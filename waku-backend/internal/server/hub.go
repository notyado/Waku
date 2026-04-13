package server

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/notyado/waku-backend/internal/matchmaker"
	"github.com/notyado/waku-backend/internal/models"
	natsclient "github.com/notyado/waku-backend/internal/nats"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, // Change in production
}

type hubMessage struct {
	UserID  string
	Message *models.InboundMessage
}

type Hub struct {
	nc      *natsclient.Client
	matcher *matchmaker.Matchmaker

	clients sync.Map
	rooms   sync.Map

	incoming chan *hubMessage
}

func New(nc *natsclient.Client) *Hub {
	return &Hub{
		nc:       nc,
		matcher:  matchmaker.New(),
		incoming: make(chan *hubMessage, 512),
	}
}

func (h *Hub) Run() {
	for hm := range h.incoming {
		h.handle(hm)
	}
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[hub] ws upgrade error: %v", err)
		return
	}

	userID := uuid.NewString()
	cl := newClient(userID, conn, h)
	h.clients.Store(userID, cl)

	cl.subscribeNATS(h.nc)

	h.sendToUser(userID, &models.OutboundMessage{
		Type:   models.TypeJoined,
		UserID: userID,
	})

	log.Printf("[hub] user %s connected from %s", userID, r.RemoteAddr)

	go cl.WritePump()
	go cl.ReadPump()
}

func (h *Hub) handle(hm *hubMessage) {
	switch hm.Message.Type {
	case models.TypeJoin:
		h.handleJoin(hm.UserID, hm.Message)
	case models.TypeMessage:
		h.handleMessage(hm.UserID, hm.Message)
	case models.TypeTyping:
		h.handleTyping(hm.UserID, hm.Message)
	case models.TypeSkip:
		h.handleSkip(hm.UserID)
	case models.TypeRead:
		h.handleRead(hm.UserID, hm.Message)
	default:
		log.Printf("[hub] unknown message type %q from user %s", hm.Message.Type, hm.UserID)
	}
}

func (h *Hub) handleJoin(userID string, msg *models.InboundMessage) {
	c, ok := h.clients.Load(userID)
	if !ok {
		return
	}
	cl := c.(*Client)

	if len(msg.Tags) < 1 || len(msg.Tags) > 10 {
		h.sendToUser(userID, &models.OutboundMessage{
			Type:  models.TypeError,
			Error: "select between 1 and 10 interests",
		})
		return
	}

	if cl.getRoom() != "" {
		h.closeRoom(userID, true)
	}
	h.matcher.Remove(userID)

	cl.setTags(msg.Tags)

	h.sendToUser(userID, &models.OutboundMessage{Type: models.TypeSearching})

	entry := &matchmaker.Entry{
		UserID:   userID,
		Tags:     msg.Tags,
		JoinedAt: time.Now(),
	}

	matched, commonTags := h.matcher.FindMatch(entry)
	if matched != nil {
		h.createRoom(userID, matched.UserID, commonTags)
	} else {
		h.matcher.Add(entry)
		log.Printf("[hub] user %s queued (tags: %v, queue_len: %d)",
			userID, msg.Tags, h.matcher.QueueLen())
	}
}

func (h *Hub) handleMessage(userID string, msg *models.InboundMessage) {
	rm := h.roomOf(userID)
	if rm == nil {
		return
	}
	partnerID := rm.Partner(userID)
	if partnerID == "" {
		return
	}

	MessageID := msg.MessageID
	if MessageID == "" {
		MessageID = uuid.NewString()
	}
	now := time.Now()

	h.sendToUser(partnerID, &models.OutboundMessage{
		Type:      models.TypeChatMessage,
		MessageID: MessageID,
		Text:      msg.Text,
		Timestamp: &now,
	})

	h.sendToUser(userID, &models.OutboundMessage{
		Type:      models.TypeDelivered,
		MessageID: MessageID,
	})

	rm.TrackMessage(MessageID, userID)
}

func (h *Hub) handleTyping(userID string, msg *models.InboundMessage) {
	rm := h.roomOf(userID)
	if rm == nil {
		return
	}
	partnerID := rm.Partner(userID)
	if partnerID == "" {
		return
	}
	h.sendToUser(partnerID, &models.OutboundMessage{
		Type:     models.TypeTyping,
		IsTyping: msg.IsTyping,
	})
}

func (h *Hub) handleSkip(userID string) {
	c, ok := h.clients.Load(userID)
	if !ok {
		return
	}
	cl := c.(*Client)

	if cl.getRoom() != "" {
		h.closeRoom(userID, true)
	} else {
		h.matcher.Remove(userID)
	}
}

func (h *Hub) handleRead(userID string, msg *models.InboundMessage) {
	rm := h.roomOf(userID)
	if rm == nil {
		return
	}
	senderID := rm.MessageSender(msg.MessageID)
	if senderID == "" {
		return
	}
	h.sendToUser(senderID, &models.OutboundMessage{
		Type:      models.TypeReadAck,
		MessageID: msg.MessageID,
	})
}

func (h *Hub) disconnect(userID string) {
	h.handleSkip(userID)
	h.clients.Delete(userID)
	log.Printf("[hub] user %s disconnected", userID)
}

func (h *Hub) createRoom(userA, userB string, commonTags []string) {
	roomID := uuid.NewString()
	rm := newRoom(roomID, userA, userB)
	h.rooms.Store(roomID, rm)

	if ca, ok := h.clients.Load(userA); ok {
		ca.(*Client).setRoom(roomID)
	}
	if cb, ok := h.clients.Load(userB); ok {
		cb.(*Client).setRoom(roomID)
	}

	if commonTags == nil {
		commonTags = []string{}
	}

	out := &models.OutboundMessage{
		Type:       models.TypeMatched,
		RoomID:     roomID,
		CommonTags: commonTags,
	}
	h.sendToUser(userA, out)
	h.sendToUser(userB, out)

	log.Printf("[hub] matched %s ↔ %s in room %s (common: %v)",
		userA, userB, roomID, commonTags)
}

func (h *Hub) closeRoom(userID string, notifyPartner bool) {
	c, ok := h.clients.Load(userID)
	if !ok {
		return
	}
	cl := c.(*Client)
	roomID := cl.getRoom()
	if roomID == "" {
		return
	}

	rm, ok := h.rooms.LoadAndDelete(roomID)
	if !ok {
		cl.setRoom("")
		return
	}

	partnerID := rm.(*Room).Partner(userID)
	cl.setRoom("")

	if notifyPartner && partnerID != "" {
		h.sendToUser(partnerID, &models.OutboundMessage{Type: models.TypePartnerLeft})
		if p, ok := h.clients.Load(partnerID); ok {
			p.(*Client).setRoom("")
		}
	}

	log.Printf("[hub] room %s closed by user %s", roomID, userID)
}

func (h *Hub) roomOf(userID string) *Room {
	c, ok := h.clients.Load(userID)
	if !ok {
		return nil
	}
	roomID := c.(*Client).getRoom()
	if roomID == "" {
		return nil
	}
	rm, ok := h.rooms.Load(roomID)
	if !ok {
		return nil
	}
	return rm.(*Room)
}

func (h *Hub) sendToUser(userID string, msg *models.OutboundMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[hub] marshal error: %v", err)
		return
	}
	if err := h.nc.Publish("waku.user."+userID, data); err != nil {
		log.Printf("[hub] NATS publish error (user %s): %v", userID, err)
	}
}

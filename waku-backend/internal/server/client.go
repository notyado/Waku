package server

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	natspkg "github.com/nats-io/nats.go"
	"github.com/notyado/waku-backend/internal/models"
	natsclient "github.com/notyado/waku-backend/internal/nats"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512 * 1024
	sendBufSize    = 256
)

type Client struct {
	id   string
	hub  *Hub
	conn *websocket.Conn
	send chan []byte

	natsSub *natspkg.Subscription

	mu     sync.RWMutex
	tags   []string
	roomID string
}

func newClient(id string, conn *websocket.Conn, hub *Hub) *Client {
	return &Client{
		id:   id,
		hub:  hub,
		conn: conn,
		send: make(chan []byte, sendBufSize),
	}
}

func (c *Client) ID() string { return c.id }

func (c *Client) setTags(tags []string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.tags = tags
}

func (c *Client) setRoom(roomID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.roomID = roomID
}

func (c *Client) getRoom() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.roomID
}

func (c *Client) subscribeNATS(nc *natsclient.Client) {
	sub, err := nc.Subscribe("waku.user."+c.id, func(data []byte) {
		select {
		case c.send <- data:
		default:
			log.Printf("[client %s] send buffer full — dropping message", c.id)
		}
	})
	if err != nil {
		log.Printf("[client %s] NATS subscribe error: %v", c.id, err)
		return
	}
	c.natsSub = sub
}

func (c *Client) unsubscribeNATS() {
	if c.natsSub != nil {
		if err := c.natsSub.Unsubscribe(); err != nil {
			log.Printf("[client %s] NATS unsubscribe error: %v", c.id, err)
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.unsubscribeNATS()
		c.hub.disconnect(c.id)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[client %s] ws read error: %v", c.id, err)
			}
			break
		}

		var msg models.InboundMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("[client %s] json decode error: %v", c.id, err)
			continue
		}

		c.hub.incoming <- &hubMessage{UserID: c.id, Message: &msg}
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case data, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("[client %s] ws write error: %v", c.id, err)
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

package server

import "sync"

type Room struct {
	id       string
	clients  [2]string
	messages map[string]string
	mu       sync.RWMutex
}

func newRoom(id, userA, userB string) *Room {
	return &Room{
		id:       id,
		clients:  [2]string{userA, userB},
		messages: make(map[string]string),
	}
}

func (r *Room) Partner(userID string) string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	switch userID {
	case r.clients[0]:
		return r.clients[1]
	case r.clients[1]:
		return r.clients[0]
	default:
		return ""
	}
}

func (r *Room) TrackMessage(msgID, senderID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.messages[msgID] = senderID
}

func (r *Room) MessageSender(msgID string) string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.messages[msgID]
}

func (r *Room) HasUser(userID string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.clients[0] == userID || r.clients[1] == userID
}

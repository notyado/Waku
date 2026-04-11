package models

import "time"

// Inbound message types (client -> server)
const (
	TypeJoin    = "join"    // Start searching
	TypeMessage = "message" // Send text
	TypeTyping  = "typing"  // Typing indicator
	TypeSkip    = "skip"    // End current chat / cancel search
	TypeRead    = "read"    // Mark message as read
)

// Outbound message types (server -> client)
const (
	TypeJoined      = "joined"       // Connection established
	TypeSearching   = "searching"    // Placed in matchmaking queue
	TypeMatched     = "matched"      // Partner found
	TypeChatMessage = "chat_message" // Incoming text
	TypePartnerLeft = "partner_left" // Partner disconnected or skipped
	TypeDelivered   = "delivered"    // Message delivered to partner
	TypeReadAck     = "read_ack"     // Partner read a message
	TypeError       = "error"        // Error
)

// InboundMsg is a message received from the WebSocket client.
type InboundMessage struct {
	Type      string   `json:"type"`
	Tags      []string `json:"tags,omitempty"`
	MessageID string   `json:"msg_id,omitempty"`
	Text      string   `json:"text,omitempty"`
	IsTyping  bool     `json:"is_typing"`
}

// OutboundMsg is a message sent to the WebSocket client.
type OutboundMessage struct {
	Type       string     `json:"type"`
	UserID     string     `json:"user_id,omitempty"`
	RoomID     string     `json:"room_id,omitempty"`
	CommonTags []string   `json:"common_tags,omitempty"`
	MessageID  string     `json:"msg_id,omitempty"`
	Text       string     `json:"text,omitempty"`
	Timestamp  *time.Time `json:"timestamp,omitempty"`
	IsTyping   bool       `json:"is_typing"`
	Error      string     `json:"error,omitempty"`
}

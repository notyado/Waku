package nats

import (
	"time"

	"github.com/nats-io/nats.go"
)

type Client struct {
	conn *nats.Conn
}

func Connect(url string) (*Client, error) {
	nc, err := nats.Connect(
		url,
		nats.Name("waku-backend"),
		nats.MaxReconnects(-1),
		nats.ReconnectWait(2*time.Second),
		nats.DisconnectErrHandler(func(_ *nats.Conn, err error) {
			if err != nil {
				_ = err
			}
		}),
	)
	if err != nil {
		return nil, err
	}
	return &Client{conn: nc}, nil
}

func (c *Client) Publish(subject string, data []byte) error {
	return c.conn.Publish(subject, data)
}

func (c *Client) Subscribe(subject string, handler func([]byte)) (*nats.Subscription, error) {
	return c.conn.Subscribe(subject, func(msg *nats.Msg) {
		handler(msg.Data)
	})
}

func (c *Client) Drain() error {
	return c.conn.Drain()
}

func (c *Client) IsConnected() bool {
	return c.conn.IsConnected()
}

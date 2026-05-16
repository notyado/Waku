# Waku — Anonymous Interest-Based Chat

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go">
  <img src="https://img.shields.io/badge/WebSockets-00ADD8?style=for-the-badge&logo=socket.io&logoColor=white" alt="WebSockets">
  <img src="https://img.shields.io/badge/NATS-27AAE1?style=for-the-badge&logo=nats&logoColor=white" alt="NATS">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <b>Waku</b> — a web platform for anonymous communication based on shared interests.<br>
  Instant connections, complete anonymity, and smart user matching.
</p>

---

## Features

* **Complete anonymity** — no registration required, temporary user IDs
* **Interest-based matching** — choose up to 10 tags and find people with similar interests
* **Instant connection** — WebSocket-powered real-time communication
* **Interactive chat** — typing indicator, delivery/read statuses
* **Beautiful UI** — purple-themed interface with smooth animations
* **Responsive design** — works on both mobile and desktop

---

## Quick Start

### Requirements

* Docker & Docker Compose

### Run with Docker Compose

```bash
git clone https://github.com/notyado/Waku.git
cd Waku
docker-compose up --build
```

### Service Access

| Service         | URL                                            | Description               |
| :-------------- | :--------------------------------------------- | :------------------------ |
| **Frontend**    | [http://localhost:3000](http://localhost:3000) | React client application  |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Go-based WebSocket server |

---

## Project Structure

```text
waku/
├── waku-backend/         # Go backend
│   ├── cmd/api/
│   │   └── main.go       # Entry point
│   ├── internal/
│   │   ├── matchmaker/   # Matching algorithm
│   │   ├── models/       # Data models
│   │   ├── nats/         # NATS client
│   │   └── server/       # WebSocket server
│   ├── config/           # Configuration
│   ├── Dockerfile
│   └── go.mod
│
├── waku-frontend/        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── screens/  # Application screens
│   │   ├── store/        # Zustand store
│   │   └── types/        # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

## Technologies

### Backend (Go)

* **Go 1.26** — programming language
* **Gorilla WebSocket** — WebSocket connections
* **NATS** — message broker for scaling
* **UUID** — unique ID generation

### Frontend (React + TypeScript)

* **React 18**
* **TypeScript** — static typing
* **Vite** — build tool
* **Zustand** — state management
* **Framer Motion** — animations
* **Tailwind CSS** — styling
* **shadcn/ui** — UI components

---

## Core Components

### Matchmaker (`internal/matchmaker/`)

User matching algorithm priorities:

1. Maximum tag overlap
2. Waiting time (FIFO)
3. Fallback to any available user

### WebSocket Hub (`internal/server/`)

* Client connection management
* Message routing through NATS
* Chat room management

---

## WebSocket API

### Outgoing Messages (Client → Server)

| Type      | Description       | Payload              |
| --------- | ----------------- | -------------------- |
| `join`    | Start searching   | `tags: string[]`     |
| `message` | Send a message    | `msg_id, text`       |
| `typing`  | Typing indicator  | `is_typing: boolean` |
| `skip`    | Skip current chat | —                    |
| `read`    | Mark as read      | `msg_id`             |

### Incoming Messages (Server → Client)

| Type           | Description            | Payload                   |
| -------------- | ---------------------- | ------------------------- |
| `joined`       | Connection established | `user_id`                 |
| `searching`    | In matchmaking queue   | —                         |
| `matched`      | Partner found          | `room_id, common_tags`    |
| `chat_message` | New message            | `msg_id, text, timestamp` |
| `partner_left` | Chat partner left      | —                         |
| `delivered`    | Message delivered      | `msg_id`                  |
| `read_ack`     | Message read           | `msg_id`                  |

---

<p align="center">
  Made with ❤️‍🩹 by Yado
</p>

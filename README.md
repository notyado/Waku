# Waku — Анонимный чат по интересам

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go">
  <img src="https://img.shields.io/badge/WebSockets-00ADD8?style=for-the-badge&logo=socket.io&logoColor=white" alt="WebSockets">
  <img src="https://img.shields.io/badge/NATS-27AAE1?style=for-the-badge&logo=nats&logoColor=white" alt="NATS">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <b>Waku</b> — веб-платформа для анонимного общения, основанная на общих интересах.<br>
  Мгновенное подключение, полная анонимность, умный подбор собеседников.
</p>

---

## Возможности

- **Полная анонимность** — вход без регистрации, временный ID
- **Подбор по интересам** — выбирай до 10 тегов, находи людей со схожими увлечениями
- **Мгновенное соединение** — WebSocket для real-time общения
- **Интерактивный чат** — индикатор "печатает", статусы доставки/прочтения
- **Красивый UI** — фиолетовая тема с плавными анимациями
- **Адаптивный дизайн** — работает на мобильных и десктопе

---

## Быстрый старт

### Требования

- Docker & Docker Compose

### Запуск через Docker Compose

```bash
git clone https://github.com/notyado/Waku.git
cd Waku
docker-compose up --build
```

### Доступ к сервисам

| Сервис | Ссылка | Описание |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Клиентское React приложение |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | WebSocket сервер на Go |

---

## Структура проекта

```
waku/
├── waku-backend/         # Go бекенд
│   ├── cmd/api/
│   │   └── main.go       # Точка входа
│   ├── internal/
│   │   ├── matchmaker/   # Алгоритм подбора
│   │   ├── models/       # Модели данных
│   │   ├── nats/         # NATS клиент
│   │   └── server/       # WebSocket сервер
│   ├── config/           # Конфигурация
│   ├── Dockerfile
│   └── go.mod
│
├── waku-frontend/        # React фронтенд
│   ├── src/
│   │   ├── components/
│   │   │   └── screens/  # Экраны приложения
│   │   ├── store/        # Zustand store
│   │   └── types/        # TypeScript типы
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

## Технологии

### Бекенд (Go)

- **Go 1.26** — язык программирования
- **Gorilla WebSocket** — WebSocket соединения
- **NATS** — message broker для масштабирования
- **UUID** — генерация уникальных ID

### Фронтенд (React + TypeScript)

- **React 18**
- **TypeScript** — типизация
- **Vite** — сборщик
- **Zustand** — state management
- **Framer Motion** — анимации
- **Tailwind CSS** — стилизация
- **shadcn/ui** — компоненты

---

## Основные компоненты

### Matchmaker (`internal/matchmaker/`)

Алгоритм подбора собеседников по приоритетам:
1. Максимальное совпадение тегов
2. Время ожидания (FIFO)
3. Fallback на любого доступного пользователя

### WebSocket Hub (`internal/server/`)

- Управление клиентскими соединениями
- Маршрутизация сообщений через NATS
- Управление комнатами чата

---

## API WebSocket

### Исходящие сообщения (Client → Server)

| Тип | Описание | Payload |
|-----|----------|---------|
| `join` | Начать поиск | `tags: string[]` |
| `message` | Отправить сообщение | `msg_id, text` |
| `typing` | Индикатор печати | `is_typing: boolean` |
| `skip` | Пропустить чат | — |
| `read` | Прочитано | `msg_id` |

### Входящие сообщения (Server → Client)

| Тип | Описание | Payload |
|-----|----------|---------|
| `joined` | Подключение установлено | `user_id` |
| `searching` | В очереди поиска | — |
| `matched` | Собеседник найден | `room_id, common_tags` |
| `chat_message` | Новое сообщение | `msg_id, text, timestamp` |
| `partner_left` | Собеседник вышел | — |
| `delivered` | Сообщение доставлено | `msg_id` |
| `read_ack` | Сообщение прочитано | `msg_id` |

---

<p align="center">
  Made with ❤️‍🩹 by Yado
</p>

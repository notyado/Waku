// WebSocket Message Types (matching Go backend)
export const MessageTypes = {
  // Inbound (client → server)
  JOIN: 'join',
  MESSAGE: 'message',
  TYPING: 'typing',
  SKIP: 'skip',
  READ: 'read',
  
  // Outbound (server → client)
  JOINED: 'joined',
  SEARCHING: 'searching',
  MATCHED: 'matched',
  CHAT_MESSAGE: 'chat_message',
  PARTNER_LEFT: 'partner_left',
  DELIVERED: 'delivered',
  READ_ACK: 'read_ack',
  ERROR: 'error',
} as const;

export type MessageType = typeof MessageTypes[keyof typeof MessageTypes];

// Inbound message (client → server)
export interface InboundMessage {
  type: typeof MessageTypes.JOIN | typeof MessageTypes.MESSAGE | typeof MessageTypes.TYPING | typeof MessageTypes.SKIP | typeof MessageTypes.READ;
  tags?: string[];
  msg_id?: string;
  text?: string;
  is_typing?: boolean;
}

// Outbound message (server → client)
export interface OutboundMessage {
  type: MessageType;
  user_id?: string;
  room_id?: string;
  common_tags?: string[];
  msg_id?: string;
  text?: string;
  timestamp?: string;
  is_typing?: boolean;
  error?: string;
}

// Chat message
export interface ChatMessage {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
  status: 'sending' | 'delivered' | 'read';
}

// User state
export interface UserState {
  userId: string | null;
  roomId: string | null;
  tags: string[];
  partnerTags: string[];
  commonTags: string[];
}

// Connection state
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

// App state
export type AppScreen = 'welcome' | 'tags' | 'searching' | 'chat';

// Available interest tags
export const AVAILABLE_TAGS = [
  'Музыка',
  'Игры',
  'Кино',
  'Книги',
  'Программирование',
  'Искусство',
  'Спорт',
  'Путешествия',
  'Фотография',
  'Наука',
  'Технологии',
  'Еда',
  'Мода',
  'Психология',
  'Философия',
  'История',
  'Языки',
  'Животные',
  'Природа',
  'Космос',
  'Аниме',
  'Мемы',
  'Политика',
  'Экономика',
  'Здоровье',
  'Фитнес',
  'Медитация',
  'Криптовалюты',
  'Дизайн',
  'Рисование',
];

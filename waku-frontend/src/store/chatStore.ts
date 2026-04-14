import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  InboundMessage,
  OutboundMessage,
  ChatMessage,
  ConnectionStatus,
  AppScreen,
} from "@/types";
import { MessageTypes } from "@/types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

interface ChatState {
  ws: WebSocket | null;
  connectionStatus: ConnectionStatus;

  userId: string | null;
  roomId: string | null;
  selectedTags: string[];
  commonTags: string[];

  messages: ChatMessage[];
  isPartnerTyping: boolean;
  partnerLeft: boolean;

  currentScreen: AppScreen;
  error: string | null;

  connect: () => void;
  disconnect: () => void;
  selectTag: (tag: string) => void;
  deselectTag: (tag: string) => void;
  startSearching: () => void;
  skipChat: () => void;
  sendMessage: (text: string) => void;
  sendTyping: (isTyping: boolean) => void;
  markAsRead: (msgId: string) => void;
  setScreen: (screen: AppScreen) => void;
  clearError: () => void;
  resetPartnerLeft: () => void;
  handleMessage: (msg: OutboundMessage) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ws: null,
      connectionStatus: "disconnected",
      userId: null,
      roomId: null,
      selectedTags: [],
      commonTags: [],
      messages: [],
      isPartnerTyping: false,
      partnerLeft: false,
      currentScreen: "welcome",
      error: null,

      connect: () => {
        const { ws } = get();
        if (ws?.readyState === WebSocket.OPEN) return;

        set({ connectionStatus: "connecting" });

        const newWs = new WebSocket(WS_URL);

        newWs.onopen = () => {
          console.log("[WebSocket] Connected");
          set({ connectionStatus: "connected", error: null });
        };

        newWs.onmessage = (event) => {
          try {
            const msg: OutboundMessage = JSON.parse(event.data);
            get().handleMessage(msg);
          } catch (err) {
            console.error("[WebSocket] Failed to parse message:", err);
          }
        };

        newWs.onclose = () => {
          console.log("[WebSocket] Disconnected");
          set({
            connectionStatus: "disconnected",
            ws: null,
            roomId: null,
            isPartnerTyping: false,
          });
        };

        newWs.onerror = (error) => {
          console.error("[WebSocket] Error:", error);
          set({
            connectionStatus: "disconnected",
            error: "Ошибка подключения. Попробуйте снова.",
          });
        };

        set({ ws: newWs });
      },

      disconnect: () => {
        const { ws } = get();
        if (ws) {
          ws.close();
        }
        set({
          ws: null,
          connectionStatus: "disconnected",
          userId: null,
          roomId: null,
          selectedTags: [],
          commonTags: [],
          messages: [],
          isPartnerTyping: false,
          currentScreen: "welcome",
        });
      },

      selectTag: (tag: string) => {
        const { selectedTags } = get();
        if (selectedTags.length >= 10) return;
        if (!selectedTags.includes(tag)) {
          set({ selectedTags: [...selectedTags, tag] });
        }
      },

      deselectTag: (tag: string) => {
        const { selectedTags } = get();
        set({ selectedTags: selectedTags.filter((t) => t !== tag) });
      },

      startSearching: () => {
        const { ws, selectedTags } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          set({ error: "Нет подключения к серверу" });
          return;
        }
        if (selectedTags.length === 0) {
          set({ error: "Выберите хотя бы один интерес" });
          return;
        }

        const msg: InboundMessage = {
          type: MessageTypes.JOIN,
          tags: selectedTags,
        };

        ws.send(JSON.stringify(msg));
        set({
          currentScreen: "searching",
          messages: [],
          isPartnerTyping: false,
          error: null,
        });
      },

      skipChat: () => {
        const { ws } = get();
        if (ws?.readyState === WebSocket.OPEN) {
          const msg: InboundMessage = { type: MessageTypes.SKIP };
          ws.send(JSON.stringify(msg));
        }
        set({
          roomId: null,
          messages: [],
          isPartnerTyping: false,
          partnerLeft: false,
          currentScreen: "tags",
          commonTags: [],
        });
      },

      resetPartnerLeft: () => {
        set({ partnerLeft: false });
      },

      sendMessage: (text: string) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;

        const msgId = crypto.randomUUID();
        const msg: InboundMessage = {
          type: MessageTypes.MESSAGE,
          msg_id: msgId,
          text: text.trim(),
        };

        ws.send(JSON.stringify(msg));

        const newMessage: ChatMessage = {
          id: msgId,
          text: text.trim(),
          isOwn: true,
          timestamp: new Date(),
          status: "sending",
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      sendTyping: (isTyping: boolean) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const msg: InboundMessage = {
          type: MessageTypes.TYPING,
          is_typing: isTyping,
        };

        ws.send(JSON.stringify(msg));
      },

      markAsRead: (msgId: string) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const msg: InboundMessage = {
          type: MessageTypes.READ,
          msg_id: msgId,
        };

        ws.send(JSON.stringify(msg));
      },

      setScreen: (screen: AppScreen) => {
        set({ currentScreen: screen });
      },

      clearError: () => {
        set({ error: null });
      },

      handleMessage: (msg: OutboundMessage) => {
        switch (msg.type) {
          case MessageTypes.JOINED:
            set({ userId: msg.user_id });
            break;

          case MessageTypes.SEARCHING:
            set({ currentScreen: "searching" });
            break;

          case MessageTypes.MATCHED:
            set({
              roomId: msg.room_id,
              commonTags: msg.common_tags || [],
              currentScreen: "chat",
              messages: [],
              isPartnerTyping: false,
              partnerLeft: false,
            });
            break;

          case MessageTypes.CHAT_MESSAGE:
            if (msg.msg_id && msg.text && msg.timestamp) {
              const newMessage: ChatMessage = {
                id: msg.msg_id,
                text: msg.text,
                isOwn: false,
                timestamp: new Date(msg.timestamp),
                status: "delivered",
              };
              set((state) => ({
                messages: [...state.messages, newMessage],
                isPartnerTyping: false,
              }));

              if (document.visibilityState === "visible") {
                get().markAsRead(msg.msg_id);
              }
            }
            break;

          case MessageTypes.TYPING:
            set({ isPartnerTyping: msg.is_typing || false });
            break;

          case MessageTypes.PARTNER_LEFT:
            set({
              isPartnerTyping: false,
              partnerLeft: true,
            });
            break;

          case MessageTypes.DELIVERED:
            if (msg.msg_id) {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === msg.msg_id ? { ...m, status: "delivered" } : m,
                ),
              }));
            }
            break;

          case MessageTypes.READ_ACK:
            if (msg.msg_id) {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === msg.msg_id ? { ...m, status: "read" } : m,
                ),
              }));
            }
            break;

          case MessageTypes.ERROR:
            set({ error: msg.error || "Произошла ошибка" });
            break;
        }
      },
    }),
    { name: "chat-store" },
  ),
);

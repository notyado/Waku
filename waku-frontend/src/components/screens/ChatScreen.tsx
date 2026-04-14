import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  MoreVertical,
  Check,
  CheckCheck,
  RotateCcw,
  Tags,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/chatStore";
import { TypingIndicator } from "@/components/ui/custom/TypingIndicator";
import { GeneratedAvatar } from "@/components/ui/custom/GeneratedAvatar";
import type { ChatMessage } from "@/types";

export function ChatScreen() {
  const {
    messages,
    isPartnerTyping,
    partnerLeft,
    sendMessage,
    sendTyping,
    skipChat,
    startSearching,
    markAsRead,
    commonTags,
    userId,
    resetPartnerLeft,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [showCommonTags, setShowCommonTags] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        messages.forEach((msg) => {
          if (!msg.isOwn && msg.status === "delivered") {
            markAsRead(msg.id);
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [messages, markAsRead]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (partnerLeft) return;

      const value = e.target.value;
      setInputText(value);

      sendTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 1000);
    },
    [sendTyping, partnerLeft],
  );

  const handleSend = useCallback(() => {
    if (!inputText.trim() || partnerLeft) return;

    sendMessage(inputText);
    setInputText("");
    sendTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [inputText, sendMessage, sendTyping, partnerLeft]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const dismissCommonTags = useCallback(() => {
    setShowCommonTags(false);
  }, []);

  const handleFindNew = useCallback(() => {
    resetPartnerLeft();
    startSearching();
  }, [resetPartnerLeft, startSearching]);

  const handleChangeInterests = useCallback(() => {
    resetPartnerLeft();
    skipChat();
  }, [resetPartnerLeft, skipChat]);

  return (
    <div className="flex flex-col h-screen">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center bg-[#1A122E]/80 backdrop-blur-lg px-4 py-4 border-[#A855F7]/20 border-b"
      >
        <div className="flex items-center gap-3">
          <GeneratedAvatar userId={userId || "anonymous"} size={40} />
          <div>
            <h3 className="font-semibold text-[#FAF5FF]">Аноним</h3>
            <div className="flex items-center gap-1.5">
              {!partnerLeft ? (
                <>
                  <span className="bg-emerald-400 rounded-full w-2 h-2 animate-pulse" />
                  <span className="text-[#A78BFA] text-xs">Онлайн</span>
                </>
              ) : (
                <>
                  <span className="bg-red-400 rounded-full w-2 h-2" />
                  <span className="text-red-400 text-xs">Вышел из чата</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-[#A855F7]/10 rounded-xl w-10 h-10 text-[#A78BFA] hover:text-[#FAF5FF]"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipChat}
            className="hover:bg-red-500/10 rounded-xl w-10 h-10 text-red-400 hover:text-red-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      <AnimatePresence>
        {showCommonTags && commonTags.length > 0 && !partnerLeft && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#A855F7]/10 px-4 py-3 border-[#A855F7]/20 border-b"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#A78BFA] text-xs">Общие интересы:</span>
                {commonTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#A855F7]/30 px-2 py-0.5 border border-[#A855F7]/40 rounded-full text-[#C084FC] text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={dismissCommonTags}
                className="text-[#A78BFA] hover:text-[#FAF5FF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {partnerLeft && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 px-4 py-4 border-red-500/30 border-b"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <UserX className="w-5 h-5" />
                <span className="font-medium">Собеседник покинул чат</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleFindNew}
                  size="sm"
                  className="bg-[#A855F7] hover:bg-[#9333EA] rounded-xl text-white"
                >
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Найти нового
                </Button>
                <Button
                  onClick={handleChangeInterests}
                  variant="outline"
                  size="sm"
                  className="hover:bg-[#A855F7]/10 border-[#A855F7]/30 rounded-xl text-[#E9D5FF]"
                >
                  <Tags className="mr-2 w-4 h-4" />
                  Другие интересы
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 space-y-4 px-4 py-4 overflow-y-auto">
        {!partnerLeft && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 text-center"
          >
            <p className="text-[#A78BFA] text-sm">
              Собеседник найден! Начните разговор.
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isPartnerTyping && !partnerLeft && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-end gap-2"
            >
              <GeneratedAvatar userId={userId || "anonymous"} size={28} />
              <div className="bg-[#251942]/80 px-4 py-3 rounded-2xl rounded-bl-md">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1A122E]/80 backdrop-blur-lg px-4 py-4 border-[#A855F7]/20 border-t"
      >
        {partnerLeft ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-[#A78BFA] text-sm">Чат завершён</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleFindNew}
                className="bg-[#A855F7] hover:bg-[#9333EA] rounded-xl text-white"
              >
                <RotateCcw className="mr-2 w-4 h-4" />
                Найти нового собеседника
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mx-auto max-w-3xl">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Введите сообщение..."
                className="bg-[#251942]/80 py-6 pr-4 pl-5 border-[#A855F7]/20 focus:border-[#A855F7] rounded-2xl focus:ring-[#A855F7]/20 focus:ring-2 w-full text-[#FAF5FF] placeholder:text-[#A78BFA] transition-all"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="flex justify-center items-center disabled:opacity-50 rounded-xl w-12 h-12 hover:scale-105 active:scale-95 transition-all duration-300"
              style={{
                background: inputText.trim()
                  ? "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)"
                  : "rgba(168, 85, 247, 0.2)",
                boxShadow: inputText.trim()
                  ? "0 4px 16px rgba(168, 85, 247, 0.4)"
                  : "none",
              }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}

        {!partnerLeft && (
          <p className="mt-3 text-[#A78BFA]/60 text-xs text-center">
            Нажмите Enter для отправки
          </p>
        )}
      </motion.div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          message.isOwn ? "rounded-br-md" : "rounded-bl-md"
        }`}
        style={{
          background: message.isOwn
            ? "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)"
            : "rgba(37, 25, 66, 0.8)",
        }}
      >
        <p className="text-[#FAF5FF] text-[15px] leading-relaxed">
          {message.text}
        </p>

        <div
          className={`flex items-center gap-1 mt-1 ${message.isOwn ? "justify-end" : "justify-start"}`}
        >
          <span className="opacity-60 text-[11px]">
            {formatTime(message.timestamp)}
          </span>

          {message.isOwn && (
            <span className="ml-1">
              {message.status === "sending" && (
                <span className="inline-block w-3 h-3">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[10px]"
                  >
                    •
                  </motion.span>
                </span>
              )}
              {message.status === "delivered" && (
                <Check className="opacity-60 w-3 h-3" />
              )}
              {message.status === "read" && (
                <CheckCheck className="w-3 h-3 text-emerald-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

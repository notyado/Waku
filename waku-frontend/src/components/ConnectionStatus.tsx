import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/chatStore";

export function ConnectionStatus() {
  const { connectionStatus } = useChatStore();

  return (
    <AnimatePresence>
      {connectionStatus !== "connected" && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="top-0 right-0 left-0 z-50 fixed flex justify-center px-4 pt-4"
        >
          <div
            className={`
              px-4 py-2 rounded-full flex items-center gap-2
              backdrop-blur-lg border
              ${
                connectionStatus === "connecting"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }
            `}
          >
            <motion.span
              animate={
                connectionStatus === "connecting" ? { scale: [1, 1.2, 1] } : {}
              }
              transition={{ duration: 1, repeat: Infinity }}
              className="bg-current rounded-full w-2 h-2"
            />
            <span className="font-medium text-sm">
              {connectionStatus === "connecting"
                ? "Подключение..."
                : "Нет подключения"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

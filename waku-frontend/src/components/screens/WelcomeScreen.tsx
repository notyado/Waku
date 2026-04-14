import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";

export function WelcomeScreen() {
  const { setScreen, connectionStatus } = useChatStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="flex flex-col flex-1 justify-center items-center px-6 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md text-center"
      >
        <motion.div variants={logoVariants} className="mb-8">
          <div className="inline-flex relative justify-center items-center">
            <div className="absolute inset-0 bg-[#A855F7] opacity-30 blur-3xl rounded-full" />

            <motion.div
              className="relative flex justify-center items-center rounded-full w-24 h-24"
              style={{
                background: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
                boxShadow: "0 0 60px rgba(168, 85, 247, 0.5)",
              }}
              animate={{
                boxShadow: [
                  "0 0 40px rgba(168, 85, 247, 0.4)",
                  "0 0 80px rgba(168, 85, 247, 0.6)",
                  "0 0 40px rgba(168, 85, 247, 0.4)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MessageCircle className="w-12 h-12 text-white" strokeWidth={2} />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-4 font-bold text-5xl tracking-tight"
          style={{
            background: "linear-gradient(135deg, #FAF5FF 0%, #C084FC 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Waku
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-8 text-[#E9D5FF] text-xl"
        >
          Анонимные разговоры с интересными людьми
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 mb-10"
        >
          <div className="flex justify-center items-center gap-3">
            <div className="flex justify-center items-center bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl w-10 h-10">
              <Shield className="w-5 h-5 text-[#C084FC]" />
            </div>
            <span className="text-[#E9D5FF]">Полная анонимность</span>
          </div>

          <div className="flex justify-center items-center gap-3">
            <div className="flex justify-center items-center bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl w-10 h-10">
              <Sparkles className="w-5 h-5 text-[#C084FC]" />
            </div>
            <span className="text-[#E9D5FF]">Поиск по интересам</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            onClick={() => setScreen("tags")}
            disabled={connectionStatus !== "connected"}
            className="disabled:opacity-50 py-6 rounded-2xl w-full font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
              boxShadow: "0 4px 24px rgba(168, 85, 247, 0.4)",
            }}
          >
            {connectionStatus === "connecting"
              ? "Подключение..."
              : connectionStatus === "disconnected"
                ? "Ожидание подключения"
                : "Начать общение"}
          </Button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-[#A78BFA] text-sm"
        >
          Без регистрации • Мгновенный вход
        </motion.p>
      </motion.div>
    </div>
  );
}

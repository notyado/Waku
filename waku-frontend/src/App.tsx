import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/store/chatStore";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { TagsScreen } from "@/components/screens/TagsScreen";
import { SearchingScreen } from "@/components/screens/SearchingScreen";
import { ChatScreen } from "@/components/screens/ChatScreen";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function App() {
  const { currentScreen, error, clearError, connect } = useChatStore();

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const screenVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  return (
    <div className="relative bg-[#0F0A1E] min-h-screen overflow-hidden text-[#FAF5FF]">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #251942 0%, #0F0A1E 50%)",
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute opacity-20 rounded-full w-[600px] h-[600px]"
          style={{
            background: "radial-gradient(circle, #A855F7 0%, transparent 70%)",
            filter: "blur(80px)",
            top: "-200px",
            left: "-200px",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute opacity-15 rounded-full w-[500px] h-[500px]"
          style={{
            background: "radial-gradient(circle, #C084FC 0%, transparent 70%)",
            filter: "blur(80px)",
            bottom: "-150px",
            right: "-150px",
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <ConnectionStatus />

      <main className="z-10 relative flex flex-col min-h-screen">
        <AnimatePresence mode="wait">
          {currentScreen === "welcome" && (
            <motion.div
              key="welcome"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex flex-col flex-1"
            >
              <WelcomeScreen />
            </motion.div>
          )}

          {currentScreen === "tags" && (
            <motion.div
              key="tags"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex flex-col flex-1"
            >
              <TagsScreen />
            </motion.div>
          )}

          {currentScreen === "searching" && (
            <motion.div
              key="searching"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex flex-col flex-1"
            >
              <SearchingScreen />
            </motion.div>
          )}

          {currentScreen === "chat" && (
            <motion.div
              key="chat"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex flex-col flex-1 h-screen"
            >
              <ChatScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1A122E",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#FAF5FF",
          },
        }}
      />
    </div>
  );
}

export default App;

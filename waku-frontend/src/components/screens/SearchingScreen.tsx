import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";

export function SearchingScreen() {
  const { selectedTags, skipChat } = useChatStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <div className="flex flex-col flex-1 justify-center items-center px-6 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md text-center"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <div className="relative mx-auto w-32 h-32">
            <motion.div
              className="absolute inset-0 border-[#A855F7]/30 border-2 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute inset-4 border-[#A855F7]/50 border-2 rounded-full"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            <motion.div
              className="absolute inset-8 border-[#A855F7]/70 border-2 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />

            <motion.div
              className="absolute inset-12 rounded-full"
              style={{
                background: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.5)",
                  "0 0 40px rgba(168, 85, 247, 0.8)",
                  "0 0 20px rgba(168, 85, 247, 0.5)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="mb-3 font-bold text-[#FAF5FF] text-2xl"
        >
          Ищем собеседника...
        </motion.h2>

        <motion.p variants={itemVariants} className="mb-8 text-[#E9D5FF]">
          Подбираем человека с похожими интересами
        </motion.p>

        <motion.div variants={itemVariants} className="mb-10">
          <p className="mb-3 text-[#A78BFA] text-sm">Ваши интересы:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedTags.map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-[#A855F7]/20 px-3 py-1.5 border border-[#A855F7]/30 rounded-full text-[#E9D5FF] text-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            onClick={skipChat}
            variant="outline"
            className="hover:bg-[#A855F7]/10 px-8 py-5 border-[#A855F7]/30 hover:border-[#A855F7]/50 rounded-xl text-[#E9D5FF] transition-all duration-300"
          >
            <X className="mr-2 w-4 h-4" />
            Отменить поиск
          </Button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-10 text-[#A78BFA] text-sm italic"
        >
          Совет: чем больше общих интересов, тем интереснее разговор!
        </motion.p>
      </motion.div>
    </div>
  );
}

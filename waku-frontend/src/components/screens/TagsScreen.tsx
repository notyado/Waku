import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";
import { AVAILABLE_TAGS } from "@/types";

export function TagsScreen() {
  const { selectedTags, selectTag, deselectTag, startSearching } =
    useChatStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const isTagSelected = (tag: string) => selectedTags.includes(tag);
  const canProceed = selectedTags.length >= 1 && selectedTags.length <= 10;

  return (
    <div className="flex flex-col flex-1 mx-auto px-6 py-8 w-full max-w-2xl">
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="mb-2 font-bold text-[#FAF5FF] text-3xl">
          Выберите ваши интересы
        </h2>
        <p className="text-[#E9D5FF]">
          Мы найдём собеседника с похожими увлечениями
        </p>
      </motion.div>

      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#A78BFA] text-sm">Выбрано:</span>
          <span
            className={`text-sm font-medium ${
              selectedTags.length > 10 ? "text-red-400" : "text-[#C084FC]"
            }`}
          >
            {selectedTags.length} / 10
          </span>
        </div>

        {selectedTags.length > 0 && (
          <button
            onClick={() => selectedTags.forEach(deselectTag)}
            className="flex items-center gap-1 text-[#A78BFA] hover:text-[#C084FC] text-sm transition-colors"
          >
            <X className="w-3 h-3" />
            Очистить
          </button>
        )}
      </motion.div>

      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <motion.span
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 bg-[#A855F7]/30 px-3 py-1.5 border border-[#A855F7]/50 rounded-full font-medium text-[#FAF5FF] text-sm"
              >
                {tag}
                <button
                  onClick={() => deselectTag(tag)}
                  className="ml-1 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto"
      >
        <div className="flex flex-wrap gap-3 pb-24">
          {AVAILABLE_TAGS.map((tag) => {
            const isSelected = isTagSelected(tag);
            return (
              <motion.button
                key={tag}
                variants={itemVariants}
                onClick={() => (isSelected ? deselectTag(tag) : selectTag(tag))}
                disabled={!isSelected && selectedTags.length >= 10}
                className={`
                  relative px-5 py-3 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${
                    isSelected
                      ? "bg-[#A855F7]/25 text-[#FAF5FF] border-[#A855F7]/60"
                      : "bg-[#A855F7]/8 text-[#E9D5FF] border-[#A855F7]/20 hover:border-[#A855F7]/40"
                  }
                  border
                  ${!isSelected && selectedTags.length >= 10 ? "opacity-40 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
                `}
                whileHover={
                  !isSelected && selectedTags.length < 10 ? { scale: 1.05 } : {}
                }
                whileTap={
                  !isSelected && selectedTags.length < 10 ? { scale: 0.95 } : {}
                }
              >
                <span className="flex items-center gap-2">
                  {isSelected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                  {tag}
                </span>

                {isSelected && (
                  <motion.div
                    layoutId="tag-glow"
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: "0 0 16px rgba(168, 85, 247, 0.3)",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="right-0 bottom-0 left-0 fixed bg-gradient-to-t from-[#0F0A1E] via-[#0F0A1E] to-transparent p-6"
      >
        <div className="mx-auto max-w-2xl">
          <Button
            onClick={startSearching}
            disabled={!canProceed}
            className="disabled:opacity-50 py-6 rounded-2xl w-full font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:cursor-not-allowed"
            style={{
              background: canProceed
                ? "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)"
                : "rgba(168, 85, 247, 0.2)",
              boxShadow: canProceed
                ? "0 4px 24px rgba(168, 85, 247, 0.4)"
                : "none",
            }}
          >
            <span className="flex items-center gap-2">
              Найти собеседника
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>

          {!canProceed && selectedTags.length === 0 && (
            <p className="mt-3 text-[#A78BFA] text-sm text-center">
              Выберите хотя бы один интерес
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

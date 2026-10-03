"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaIcon } from "@/components/shared/fa-icon";
import { ChatWindow } from "@/components/chat/chat-window";

export function AssistantChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-4 z-50 w-[min(94vw,380px)] sm:right-6 lg:bottom-24"
          >
            <ChatWindow className="shadow-2xl shadow-black/40" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-end text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 sm:right-6 lg:bottom-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <FaIcon name={open ? "faXmark" : "faRobot"} className="h-6 w-6" />
          </motion.span>
        </AnimatePresence>
      </button>
    </>
  );
}

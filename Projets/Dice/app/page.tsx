"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/store";
import { Pill } from "@/components/ui/Pill";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useMounted } from "@/lib/hooks";

export default function Home() {
  const router = useRouter();
  const mounted = useMounted();

  const player1 = useGame((s) => s.player1);
  const player2 = useGame((s) => s.player2);
  const ageConfirmed = useGame((s) => s.ageConfirmed);
  const setupComplete = useGame((s) => s.setupComplete);
  const setPlayers = useGame((s) => s.setPlayers);
  const confirmAge = useGame((s) => s.confirmAge);
  const completeSetup = useGame((s) => s.completeSetup);

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [emoji1, setEmoji1] = useState("👨");
  const [emoji2, setEmoji2] = useState("👩");
  const [showAgeGate, setShowAgeGate] = useState(false);

  useEffect(() => {
    if (mounted) {
      setName1(player1.name);
      setName2(player2.name);
      setEmoji1(player1.emoji);
      setEmoji2(player2.emoji);
    }
  }, [mounted, player1, player2]);

  // Auto-redirect if setup already complete
  useEffect(() => {
    if (mounted && setupComplete) {
      router.replace("/modes");
    }
  }, [mounted, setupComplete, router]);

  function handleStart() {
    if (!name1.trim() || !name2.trim()) return;
    setPlayers({ name: name1.trim(), emoji: emoji1 }, { name: name2.trim(), emoji: emoji2 });
    if (!ageConfirmed) {
      setShowAgeGate(true);
    } else {
      completeSetup();
      router.push("/modes");
    }
  }

  function handleAgeConfirm() {
    confirmAge();
    completeSetup();
    setShowAgeGate(false);
    router.push("/modes");
  }

  if (!mounted) return null;

  const canStart = name1.trim().length > 0 && name2.trim().length > 0;

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative z-10">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <Pill dot>Une nouvelle session vous attend</Pill>

        <h1 className="display text-5xl md:text-7xl text-balance leading-[0.92]">
          Vos <em>soirs</em><br />ne s&apos;oublient<br /><span className="pop">jamais</span>.
        </h1>

        <p className="text-muted text-base md:text-lg max-w-sm mx-auto">
          Le jeu de dés pour couples qui assument. Entrez vos prénoms et c&apos;est parti 🔥
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mt-6">
          <PlayerCard
            value={name1}
            onChange={setName1}
            emoji={emoji1}
            onEmoji={setEmoji1}
            label="Joueur 1"
            placeholder="Léon"
          />
          <span className="font-fat text-3xl text-accent rotate-12">×</span>
          <PlayerCard
            value={name2}
            onChange={setName2}
            emoji={emoji2}
            onEmoji={setEmoji2}
            label="Joueuse 2"
            placeholder="Camille"
            tint
          />
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className="btn-primary w-full !py-4 !text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          C&apos;est parti !
          <span className="bg-white text-accent w-7 h-7 rounded-full inline-flex items-center justify-center font-black text-sm">→</span>
        </button>

        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="bg-warm text-ink border-2 border-ink rounded-full px-3 py-1 font-fat text-xs -rotate-3 inline-block">
            18+ · Adultes
          </span>
          <span className="text-xs text-muted">Adultes consentants uniquement</span>
        </div>
      </motion.div>

      <AnimatePresence>{showAgeGate && <AgeGate onConfirm={handleAgeConfirm} onCancel={() => setShowAgeGate(false)} />}</AnimatePresence>
    </main>
  );
}

function PlayerCard({
  value,
  onChange,
  emoji,
  onEmoji,
  label,
  placeholder,
  tint = false,
}: {
  value: string;
  onChange: (v: string) => void;
  emoji: string;
  onEmoji: (v: string) => void;
  label: string;
  placeholder: string;
  tint?: boolean;
}) {
  const emojis = ["👨", "👩", "🧑", "👴", "👵", "🦸", "🦸‍♀️", "🧚", "🧙"];
  return (
    <div className={`player-input text-left ${tint ? "!bg-warm/30" : ""}`}>
      <button
        type="button"
        onClick={() => {
          const idx = emojis.indexOf(emoji);
          onEmoji(emojis[(idx + 1) % emojis.length]);
        }}
        className="text-2xl leading-none mb-1"
        aria-label="Changer l'emoji"
      >
        {emoji}
      </button>
      <label htmlFor={`name-${label}`}>{label}</label>
      <input
        id={`name-${label}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={20}
        autoComplete="off"
      />
    </div>
  );
}

function AgeGate({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.9 }}
        className="card max-w-md w-full text-center space-y-4"
      >
        <div className="text-6xl">🔞</div>
        <h2 className="display text-3xl">Réservé aux <em>adultes</em></h2>
        <p className="text-muted">
          Cette application contient du contenu sexuel explicite destiné aux adultes consentants. En continuant, vous confirmez avoir <strong>18 ans ou plus</strong>.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <button type="button" onClick={onConfirm} className="btn-primary w-full">
            J&apos;ai 18 ans ou plus →
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary w-full">
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

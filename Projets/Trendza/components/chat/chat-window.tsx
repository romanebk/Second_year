"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FaIcon } from "@/components/shared/fa-icon";
import type { ChatAnswer } from "@/lib/engine/types";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ChatAnswer["products"];
};

const SUGGESTIONS = [
  "Quel produit vendre avec 300 € ?",
  "Quel produit sera tendance cet hiver ?",
  "Que puis-je vendre avec peu de concurrence ?",
  "Quel produit est le plus rentable actuellement ?",
];

export function ChatWindow({ className, listMaxHeight = 320 }: { className?: string; listMaxHeight?: number }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis l'assistant Trendza. Posez-moi une question sur un produit, une tendance ou un marché, et je l'analyse à partir de nos sources.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await res.json()) as ChatAnswer & { error?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.error ?? data.message ?? "Je n'ai pas compris. Réessayez autrement.",
          products: data.products,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connexion interrompue. Réessayez dans un instant." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-3xl border border-border bg-surface/40", className)}>
      <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/15 to-primary-end/10 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-end text-white">
          <FaIcon name="faRobot" className="h-4 w-4" />
        </span>
        <div>
          <p className="font-heading text-sm font-semibold">Assistant Trendza</p>
          <p className="text-[11px] text-muted-foreground">Analyse le marché en direct</p>
        </div>
      </div>

      <div ref={listRef} className="scrollbar-none flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: listMaxHeight }}>
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto rounded-br-sm bg-gradient-to-r from-primary to-primary-end text-white"
                  : "rounded-bl-sm border border-border bg-surface/70 text-muted-foreground",
              )}
            >
              {m.content}
            </div>
            {m.products && m.products.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {m.products.map((p) => (
                  <a
                    key={p.id}
                    href={`/produits/${p.id}/analyse`}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/70 px-3 py-2 transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-end text-[11px] font-bold text-white">
                      {p.score}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{p.nom}</p>
                      <p className="text-[10px] text-muted-foreground">{p.categorie}</p>
                    </div>
                    <FaIcon name="faArrowRight" className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FaIcon name="faCircleNotch" className="h-3.5 w-3.5 animate-spin text-primary" />
            Analyse en cours…
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="cursor-pointer rounded-full border border-border-strong bg-surface px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question…"
            className="flex-1 rounded-xl border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-end text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Envoyer"
          >
            <FaIcon name="faPaperPlane" className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

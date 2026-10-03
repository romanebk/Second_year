"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, ShoppingBag, TrendingUp } from "@/components/shared/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, NIVEAUX, PLATEFORMES, type Niveau } from "@/lib/constants";
import type { Plateforme } from "@/lib/constants";

/** Identity fields captured on the signup form, saved until onboarding runs. */
function readPendingProfile() {
  try {
    const raw = window.localStorage.getItem("trendza_pending_profile");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      nom?: string;
      prenoms?: string;
      telephone?: string;
      cguAcceptedAt?: string;
    };
    return {
      nom: parsed.nom ?? null,
      prenoms: parsed.prenoms ?? null,
      telephone: parsed.telephone ?? null,
      // Preuve horodatée de l'acceptation des CGU. Repli sur l'instant présent
      // pour le parcours Google, qui n'écrit pas ce brouillon mais impose la
      // même case à cocher avant la redirection OAuth.
      cgu_accepted_at: parsed.cguAcceptedAt ?? new Date().toISOString(),
    };
  } catch {
    return {};
  }
}

const STEPS = [
  {
    key: "pays",
    label: "Pays",
    icon: MapPin,
    title: "Où allez-vous vendre ?",
    description: "Choisissez votre pays cible principal.",
  },
  {
    key: "niveau",
    label: "Niveau",
    icon: TrendingUp,
    title: "Quel est votre niveau ?",
    description: "Nous adapterons le niveau de détail de nos recommandations.",
  },
  {
    key: "plateforme",
    label: "Plateforme",
    icon: ShoppingBag,
    title: "Où vendez-vous ?",
    description: "Sélectionnez votre plateforme e-commerce préférée.",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pays, setPays] = useState<string>("");
  const [niveau, setNiveau] = useState<Niveau | "">("");
  const [plateforme, setPlateforme] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  function canContinue() {
    if (step === 0) return Boolean(pays);
    if (step === 1) return Boolean(niveau);
    return Boolean(plateforme);
  }

  function nextStep() {
    setError(null);
    if (!canContinue()) {
      setError("Merci de sélectionner une option avant de continuer.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pays || !niveau || !plateforme) {
      setError("Merci de répondre aux trois questions.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Votre session a expiré, reconnectez-vous.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      pays,
      niveau,
      plateforme: plateforme as Plateforme,
      onboarded: true,
      ...readPendingProfile(),
    });
    localStorage.removeItem("trendza_pending_profile");

    if (error) {
      setError("Impossible d'enregistrer votre profil. Réessayez.");
      setLoading(false);
      return;
    }

    router.push("/catalogue");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-primary-end/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

      <div className="relative w-full max-w-2xl">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex flex-1 flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 disabled:cursor-default",
                    i < step
                      ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white"
                      : i === step
                        ? "border-primary bg-primary/15 text-primary ring-4 ring-primary/15"
                        : "border-border-strong bg-surface text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    i <= step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-surface">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary-end"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary-end/25 text-primary">
                  <current.icon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-heading text-xl font-bold sm:text-2xl">{current.title}</h1>
                  <p className="text-sm text-muted-foreground">{current.description}</p>
                </div>
              </div>

              <form onSubmit={isLastStep ? handleSubmit : (e) => e.preventDefault()} className="mt-6">
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setPays(c.code)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                          pays === c.code
                            ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                            : "border-border-strong bg-surface hover:border-primary/40",
                        )}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary-end/25 font-heading text-xs font-bold text-primary">
                          {c.code}
                        </span>
                        <span className="text-sm font-medium leading-tight">{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {NIVEAUX.map((n) => (
                      <button
                        key={n.value}
                        type="button"
                        onClick={() => setNiveau(n.value)}
                        className={cn(
                          "cursor-pointer rounded-2xl border p-5 text-left transition-all duration-200",
                          niveau === n.value
                            ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                            : "border-border-strong bg-surface hover:border-primary/40",
                        )}
                      >
                        <p className="font-heading text-base font-semibold">{n.label}</p>
                        <p className="mt-1.5 text-sm text-muted-foreground">{n.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-3">
                    {PLATEFORMES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlateforme(p.value)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200",
                          plateforme === p.value
                            ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                            : "border-border-strong bg-surface hover:border-primary/40",
                        )}
                      >
                        <span className="font-medium">{p.label}</span>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            plateforme === p.value
                              ? "border-primary bg-gradient-to-r from-primary to-primary-end"
                              : "border-border-strong",
                          )}
                        >
                          {plateforme === p.value && <Check className="h-3 w-3 text-white" />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex items-center justify-between gap-3">
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setStep((s) => Math.max(s - 1, 0));
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </Button>
                  ) : (
                    <span />
                  )}

                  {isLastStep ? (
                    <Button type="submit" variant="gradient" size="lg" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Accéder à mon tableau de bord
                    </Button>
                  ) : (
                    <Button type="button" variant="gradient" size="lg" onClick={nextStep}>
                      Continuer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

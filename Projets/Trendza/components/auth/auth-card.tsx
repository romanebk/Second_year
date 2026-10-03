"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "@/components/shared/icons";

import { cn } from "@/lib/utils";
import { TrendMark } from "@/components/shared/logo";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

type Mode = "connexion" | "inscription";

const HIGHLIGHTS = [
  "Le produit phare de votre marché chaque mois",
  "Fiche produit et guide de lancement prêts à copier",
  "Pensé pour votre pays et la saison",
];

export function AuthCard({ initialMode = "connexion" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const isLogin = mode === "connexion";

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-surface">
      {/* Mobile segmented control */}
      <div className="grid grid-cols-2 gap-1 border-b border-border p-2 lg:hidden">
        {(["connexion", "inscription"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all",
              mode === m
                ? "bg-gradient-to-r from-primary to-primary-end text-white shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "connexion" ? "Connexion" : "Inscription"}
          </button>
        ))}
      </div>

      <div className="grid flex-1 lg:grid-cols-[1.5fr_1fr]">
        {/* Forms — the active one covers the other by sliding horizontally */}
        <div className="relative overflow-x-hidden overflow-y-auto">
          <div className="flex items-center justify-center gap-3 pt-8 sm:pt-10">
            <Image
              src="/logos/icon.png"
              alt=""
              width={252}
              height={250}
              className="h-10 w-10"
              priority
            />
            <Image
              src="/logos/wordmark.png"
              alt="Trendza"
              width={408}
              height={61}
              className="h-6 w-auto"
              priority
            />
          </div>
          <div
            className={cn(
              "flex min-h-full w-[200%] transition-transform duration-500 ease-out",
              isLogin ? "translate-x-0" : "-translate-x-1/2",
            )}
          >
            <div className="flex w-1/2 items-center justify-center p-6 py-10 sm:p-10">
              <div className="w-full max-w-md">
                <LoginForm />
              </div>
            </div>
            <div className="flex w-1/2 items-center justify-center p-6 py-10 sm:p-10">
              <div className="w-full max-w-md">
                <SignupForm />
              </div>
            </div>
          </div>
        </div>

        {/* Presentation panel — slashed diagonal edge, narrower than the form side */}
        <div className="relative hidden items-center justify-center bg-gradient-to-br from-primary to-primary-end p-10 text-white [clip-path:polygon(18%_0,100%_0,100%_100%,0%_100%)] lg:flex">
          <div className="flex w-full max-w-xs flex-col gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <TrendMark className="h-6 w-6" />
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold">
                {isLogin ? "Nouveau ici ?" : "Content de vous revoir !"}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {isLogin
                  ? "Créez votre compte gratuitement et découvrez chaque mois le produit le plus prometteur de votre marché."
                  : "Connectez-vous pour retrouver vos produits favoris et votre produit phare du mois."}
              </p>
            </div>

            <ul className="flex flex-col gap-2.5 text-sm text-white/85">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/90" />
                  {h}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setMode(isLogin ? "inscription" : "connexion")}
              className="mt-1 inline-flex h-9 w-fit cursor-pointer items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-primary transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              {isLogin ? "Créer mon compte" : "Me connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

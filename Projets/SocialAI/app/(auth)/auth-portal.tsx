"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { GoogleButton } from "@/components/google-button";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

import "./auth-portal.css";

type Mode = "login" | "signup";
type FieldErrors = Partial<Record<"name" | "email" | "password" | "global", string>>;

/** Extrait le premier message d'erreur Zod par champ. */
function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0]) as keyof FieldErrors;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Portail connexion / inscription à panneau coulissant.
 * Desktop : les formulaires glissent horizontalement, l'overlay de marque
 * coulisse en sens inverse. Mobile (<600px) : onglets + fondu vertical.
 */
export function AuthPortal({
  googleEnabled,
  initialMode,
}: {
  googleEnabled: boolean;
  initialMode: Mode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>(initialMode);

  // Bascule de panneau sans navigation : replaceState garde l'URL cohérente
  // (/login ou /register) sans remonter le composant, pour ne pas casser l'animation.
  function switchTo(next: Mode) {
    setMode(next);
    window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
  }

  return (
    <div className={cn("auth-container", mode === "signup" && "active")}>
      {/* Onglets — visibles uniquement en mobile (<600px) */}
      <div className="auth-tabs" role="tablist" aria-label="Connexion ou inscription">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className="auth-tab"
          onClick={() => switchTo("login")}
        >
          Connexion
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className="auth-tab"
          onClick={() => switchTo("signup")}
        >
          Inscription
        </button>
      </div>

      {/* Formulaire connexion */}
      <div className="form-box login-form" aria-hidden={mode !== "login"}>
        <LoginPane
          googleEnabled={googleEnabled}
          callbackUrl={callbackUrl}
          active={mode === "login"}
        />
      </div>

      {/* Formulaire inscription */}
      <div className="form-box signup-form" aria-hidden={mode !== "signup"}>
        <SignupPane googleEnabled={googleEnabled} active={mode === "signup"} />
      </div>

      {/* Panneau coulissant de marque (desktop) */}
      <div className="overlay-container" aria-hidden>
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h2 className="font-heading font-bold">Content de te revoir</h2>
            <p>Reconnecte-toi pour retrouver tes publications planifiées.</p>
            <button type="button" className="ghost-btn" onClick={() => switchTo("login")}>
              Se connecter
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h2 className="font-heading font-bold">
              Un seul endroit pour toute ta présence sociale.
            </h2>
            <p>
              Planifie, programme et publie sur Instagram, Facebook et TikTok —
              sans jongler entre dix onglets.
            </p>
            <button type="button" className="ghost-btn" onClick={() => switchTo("signup")}>
              S&apos;inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPane({
  googleEnabled,
  callbackUrl,
  active,
}: {
  googleEnabled: boolean;
  callbackUrl: string;
  active: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues));
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await signIn("credentials", { ...parsed.data, redirect: false });
    setLoading(false);

    if (res?.error) {
      setErrors({ global: "E-mail ou mot de passe incorrect." });
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold">Connexion</h2>
        <p className="text-sm text-muted-foreground">
          Connecte-toi pour gérer tes publications.
        </p>
      </div>

      {googleEnabled && (
        <div className="mt-5 space-y-4">
          <GoogleButton callbackUrl={callbackUrl} label="Continuer avec Google" />
          <Divider />
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <Label htmlFor="login-email">E-mail</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            tabIndex={active ? 0 : -1}
            required
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="login-password">Mot de passe</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            tabIndex={active ? 0 : -1}
            required
          />
          <FieldError>{errors.password}</FieldError>
        </div>

        <FieldError>{errors.global}</FieldError>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          tabIndex={active ? 0 : -1}
        >
          Se connecter
        </Button>
      </form>
    </>
  );
}

function SignupPane({
  googleEnabled,
  active,
}: {
  googleEnabled: boolean;
  active: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation client : nom ≥ 2, e-mail valide, mot de passe ≥ 8 caractères.
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues));
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors({ global: data.error ?? "Impossible de créer le compte." });
      setLoading(false);
      return;
    }

    // Connexion automatique après l'inscription.
    const signInRes = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold">Inscription</h2>
        <p className="text-sm text-muted-foreground">
          Commence à planifier tes publications en quelques secondes.
        </p>
      </div>

      {googleEnabled && (
        <div className="mt-5 space-y-4">
          <GoogleButton label="S'inscrire avec Google" />
          <Divider />
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <Label htmlFor="signup-name">Nom</Label>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder="Alex Créateur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            tabIndex={active ? 0 : -1}
            required
          />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="signup-email">E-mail</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            tabIndex={active ? 0 : -1}
            required
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="signup-password">Mot de passe</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            tabIndex={active ? 0 : -1}
            required
          />
          <FieldError>{errors.password}</FieldError>
        </div>

        <FieldError>{errors.global}</FieldError>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          tabIndex={active ? 0 : -1}
        >
          Créer mon compte
        </Button>
      </form>
    </>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">OU</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

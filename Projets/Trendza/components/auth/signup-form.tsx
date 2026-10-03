"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "@/components/shared/icons";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";

const PENDING_PROFILE_KEY = "trendza_pending_profile";
const TERMS_ERROR =
  "Vous devez accepter les conditions d'utilisation pour créer un compte.";

export function SignupForm() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  /** Le parcours Google ne passe pas par le formulaire : même exigence, garde dédiée. */
  function requireTerms() {
    if (acceptedTerms) return true;
    setError(TERMS_ERROR);
    return false;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError(TERMS_ERROR);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Un compte existe déjà avec cet email."
          : "Impossible de créer le compte. Réessayez.",
      );
      setLoading(false);
      return;
    }

    // Carry the identity fields to the onboarding step, which saves the profile.
    // `cguAcceptedAt` conserve la preuve horodatée du consentement.
    localStorage.setItem(
      PENDING_PROFILE_KEY,
      JSON.stringify({
        nom,
        prenoms,
        telephone,
        cguAcceptedAt: new Date().toISOString(),
      }),
    );

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setCheckEmail(true);
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-semibold">Vérifiez votre boîte mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Cliquez
          dessus pour activer votre compte.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Créer un compte</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Trouvez votre produit phare en quelques minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-nom">Nom</Label>
            <Input
              id="signup-nom"
              autoComplete="family-name"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-prenoms">Prénoms</Label>
            <Input
              id="signup-prenoms"
              autoComplete="given-name"
              required
              value={prenoms}
              onChange={(e) => setPrenoms(e.target.value)}
              placeholder="Vos prénoms"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-telephone">Numéro de téléphone</Label>
          <Input
            id="signup-telephone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-email">Adresse email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-password">Mot de passe</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
          />
        </div>

        <label
          htmlFor="cgu"
          className="mt-1 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground"
        >
          <Checkbox
            id="cgu"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              if (e.target.checked) setError(null);
            }}
            aria-describedby="cgu-description"
          />
          <span id="cgu-description">
            J&apos;accepte les{" "}
            <Link
              href="/conditions-utilisation"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/confidentialite"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              politique de confidentialité
            </Link>
            . Je comprends que Trendza propose des suggestions de produits et ne
            garantit aucune vente sur ma boutique.
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" variant="gradient" size="lg" disabled={loading} className="mt-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer mon compte
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton label="S'inscrire avec Google" guard={requireTerms} />
    </div>
  );
}

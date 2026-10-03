import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  LayoutGrid,
  Link2,
  Rocket,
  Send,
  Target,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HomeHero } from "@/components/home-hero";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Un tableau de bord unique",
    text: "Tous tes réseaux réunis. Vois d’un coup d’œil ce qui est programmé, publié ou en brouillon.",
  },
  {
    icon: CalendarClock,
    title: "Planifie à l’avance",
    text: "Programme tes posts à la date et l’heure idéales, et retrouve-les dans un calendrier clair.",
  },
  {
    icon: Send,
    title: "Publie partout",
    text: "Instagram, Facebook, TikTok — un seul post, plusieurs plateformes, en un clic.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Connecte tes comptes",
    text: "Relie Instagram, Facebook et TikTok en quelques clics, en toute sécurité.",
  },
  {
    number: "02",
    icon: CalendarPlus,
    title: "Planifie ton contenu",
    text: "Rédige tes posts et organise-les dans un calendrier visuel unique, pensé pour les créateurs.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Publie automatiquement",
    text: "SocialAI publie au bon moment sur chaque plateforme, sans que tu aies à y penser.",
  },
];

const MISSION_POINTS = [
  {
    title: "3 réseaux, 1 tableau de bord",
    text: "Fini les allers-retours entre applications pour publier la même idée trois fois.",
  },
  {
    title: "Du temps pour créer",
    text: "Moins de tâches administratives, plus de temps pour ce qui compte vraiment : ton contenu.",
  },
  {
    title: "Pensé pour les indépendants",
    text: "Pas besoin d’une équipe marketing pour avoir une présence sociale professionnelle.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between px-6 sm:px-10 lg:px-16 xl:px-24">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Commencer</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <HomeHero />

      {/* How it works */}
      <section className="px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Comment ça marche
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Trois étapes pour reprendre le contrôle de tes réseaux.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ number, icon: Icon, title, text }) => (
            <div key={number} className="relative">
              <span className="font-heading text-5xl font-extrabold text-muted-foreground/20">
                {number}
              </span>
              <span className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Fonctionnalités
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Tout ce qu’il faut, rien de superflu.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6 shadow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Target className="h-4 w-4" />
              Notre mission
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Redonner du temps aux créateurs, pas aux outils.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              SocialAI est né d’un constat simple : gérer une présence sociale
              professionnelle ne devrait pas nécessiter une équipe marketing.
              On construit les outils qu’on aimerait utiliser, pour que les
              créateurs indépendants passent moins de temps sur l’administratif
              et plus de temps à créer.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {MISSION_POINTS.map(({ title, text }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-5 shadow-soft"
              >
                <h3 className="font-heading text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:py-16">
          <h2 className="max-w-xl font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Prêt à simplifier ta gestion des réseaux sociaux ?
          </h2>
          <p className="max-w-md text-primary-foreground/85">
            Crée ton compte gratuitement et programme ta première publication
            en quelques minutes.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-10 lg:px-16 xl:px-24">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SocialAI. Conçu pour les créateurs.
          </p>
        </div>
      </footer>
    </div>
  );
}

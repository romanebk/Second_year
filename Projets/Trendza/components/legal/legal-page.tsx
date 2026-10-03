import Link from "next/link";
import { ArrowLeft, Clock, Mail, ShieldAlert } from "@/components/shared/icons";

import { GradientText } from "@/components/shared/gradient-text";
import { LegalTocChips, LegalTocSidebar } from "@/components/legal/legal-toc";
import { legalSectionId, splitSectionNumber } from "@/components/legal/legal-section-id";
import { LEGAL_PLACEHOLDER, LEGAL_UPDATED_AT } from "@/lib/legal";

/**
 * Affiche une valeur de `lib/legal.ts`. Une valeur non renseignée ressort
 * visuellement pour qu'un oubli se voie immédiatement en relecture.
 */
export function LegalValue({ value }: { value: string }) {
  if (value !== LEGAL_PLACEHOLDER) return <>{value}</>;
  return (
    <span className="rounded-md border border-dashed border-accent/50 bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">
      {LEGAL_PLACEHOLDER}
    </span>
  );
}

/**
 * Coquille commune aux trois documents légaux : en-tête de document, sommaire
 * sticky (latéral sur desktop, bande horizontale sur mobile) et colonne de
 * contenu. Les ancres des sections sont dérivées de leur titre.
 */
export function LegalPage({
  title,
  intro,
  updatedAt = LEGAL_UPDATED_AT,
  sections = [],
  children,
}: {
  title: string;
  intro?: string;
  updatedAt?: string;
  sections?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="relative px-4 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-20">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-primary-end/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              <GradientText>{title}</GradientText>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Dernière mise à jour : {updatedAt}
            </span>
          </div>

          {intro && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/90 sm:text-lg">
              {intro}
            </p>
          )}
        </header>

        <div className="mt-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <LegalTocSidebar sections={sections} />
          <div className="min-w-0">
            <LegalTocChips sections={sections} />
            <div className="flex flex-col gap-10">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Section numérotée d'un document légal, ancrée pour le sommaire. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = legalSectionId(title);
  const { number, label } = splitSectionNumber(title);

  return (
    <section id={id} className="scroll-mt-28 border-t border-border/50 pt-8">
      <div className="flex items-center gap-3">
        {number && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 font-heading text-sm font-bold text-primary">
            {number}
          </span>
        )}
        <h2 className="font-heading text-xl font-semibold sm:text-2xl">{label}</h2>
      </div>
      <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

/** Liste à puces homogène. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-primary">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Tableau clé / valeur (identité de l'éditeur, hébergeurs…). */
export function LegalDefinitions({ rows }: { rows: { term: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/40">
      {rows.map((row) => (
        <div key={row.term} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6 sm:px-5">
          <dt className="shrink-0 text-sm font-medium text-foreground sm:w-56">{row.term}</dt>
          <dd className="text-sm text-muted-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Encadré d'avertissement (utilisé pour la clause de non-garantie). */
export function LegalCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 sm:p-5">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

/** Encadré de contact en fin de document. */
export function LegalContactCta({
  email,
  children,
}: {
  email: string;
  children?: React.ReactNode;
}) {
  const href = email !== LEGAL_PLACEHOLDER ? `mailto:${email}` : undefined;

  return (
    <section className="relative mt-12 overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <h2 className="relative font-heading text-xl font-semibold sm:text-2xl">Une question ?</h2>
      <div className="relative mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children ?? (
          <p>Notre équipe vous répond sous 48 h ouvrées.</p>
        )}
        {href ? (
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline"
          >
            <Mail className="h-4 w-4" />
            {email}
          </a>
        ) : (
          <LegalValue value={email} />
        )}
      </div>
    </section>
  );
}

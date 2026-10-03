"use client";

import Image from "next/image";
import type { TrendzaAnalysis } from "@/lib/engine/types";
import { FaIcon } from "@/components/shared/fa-icon";
import { ScoreGauge } from "@/components/analysis/score-gauge";
import { ScoreBreakdown } from "@/components/analysis/score-breakdown";
import { SourcesTable } from "@/components/analysis/sources-table";
import { SeasonalityCalendar } from "@/components/analysis/seasonality-calendar";
import { FinancialSimulator } from "@/components/analysis/financial-simulator";
import { CompetitionPanel } from "@/components/analysis/competition-panel";
import { SuppliersPanel } from "@/components/analysis/suppliers-panel";
import { PredictionPanel } from "@/components/analysis/prediction-panel";
import { CountryComparison } from "@/components/analysis/country-comparison";
import { AiRecommendation } from "@/components/analysis/ai-recommendation";
import { AnalysisSection } from "@/components/analysis/section";
import { SuggestionDisclaimer } from "@/components/shared/suggestion-disclaimer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<string, string> = {
  success: "border-success/30 bg-success/10 text-success",
  info: "border-primary/30 bg-primary/10 text-primary",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

const SECTIONS = [
  { id: "score", label: "Score", icon: "faChartPie" },
  { id: "sources", label: "Sources", icon: "faDatabase" },
  { id: "marche", label: "Marché", icon: "faScaleBalanced" },
  { id: "saisonnalite", label: "Saisonnalité", icon: "faCalendarDays" },
  { id: "finances", label: "Finances", icon: "faCoins" },
  { id: "concurrence", label: "Concurrence", icon: "faRankingStar" },
  { id: "fournisseurs", label: "Fournisseurs", icon: "faTruckFast" },
  { id: "previsions", label: "Prévisions", icon: "faChartLine" },
];

export function AnalysisPage({ analysis }: { analysis: TrendzaAnalysis }) {
  const { product, score, sources } = analysis;

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <a
        href={`/produits/${product.id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <FaIcon name="faArrowLeft" className="h-3.5 w-3.5" />
        Retour à la fiche produit
      </a>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/50">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-border">
              <Image src={product.image_url} alt={product.nom} fill sizes="112px" className="object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gradient">{product.categorie}</Badge>
                <Badge variant="outline">
                  {analysis.paysLabel} · {analysis.moisLabel}
                </Badge>
                {analysis.sources.simulated.length === analysis.sources.signals.length ? (
                  <Badge variant="outline" className="border-accent/40 text-accent">
                    Données estimées
                  </Badge>
                ) : (
                  analysis.sources.degraded.length > 0 && (
                    <Badge variant="outline" className="text-amber-300">
                      {analysis.sources.degraded.length} source(s) en repli
                    </Badge>
                  )
                )}
              </div>
              <h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">{product.nom}</h1>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span>
                  <span className="text-xs text-muted-foreground">Prix conseillé · </span>
                  <span className="font-semibold">{product.prix_conseille.toLocaleString("fr-FR")} XOF</span>
                </span>
                <span>
                  <span className="text-xs text-muted-foreground">Marge estimée · </span>
                  <span className="font-semibold text-success">{product.marge_estimee}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ScoreGauge score={score.total} />
          </div>
        </div>
      </div>

      <div className="scrollbar-none sticky top-[60px] z-20 -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 py-2 lg:top-[72px]">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <FaIcon name={s.icon} className="h-3 w-3 text-primary" />
            {s.label}
          </a>
        ))}
      </div>

      <div className="mt-4">
        <AiRecommendation text={analysis.recommendation} />
      </div>

      {analysis.alerts.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {analysis.alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn("rounded-2xl border p-4", SEVERITY_STYLE[alert.severity])}
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <FaIcon
                  name={
                    alert.severity === "danger"
                      ? "faTriangleExclamation"
                      : alert.severity === "success"
                        ? "faCircleCheck"
                        : "faCircleInfo"
                  }
                  className="h-3.5 w-3.5"
                />
                {alert.title}
              </p>
              <p className="mt-1.5 text-xs opacity-80">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5">
        <AnalysisSection
          id="score"
          icon="faChartPie"
          title="Pourquoi ce score ?"
          subtitle={`Score d'opportunité sur 11 critères pondérés`}
        >
          <p className="mb-5 rounded-2xl border border-border bg-surface/50 p-4 text-sm text-muted-foreground">
            {score.rationale.why}
          </p>

          <ScoreBreakdown criteria={score.criteria} />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
                <FaIcon name="faCircleCheck" className="h-3.5 w-3.5" />
                Points forts
              </h3>
              <ul className="space-y-1.5">
                {score.rationale.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                <FaIcon name="faTriangleExclamation" className="h-3.5 w-3.5" />
                Risques
              </h3>
              <ul className="space-y-1.5">
                {score.rationale.risks.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <FaIcon name="faLightbulb" className="h-3.5 w-3.5" />
                Recommandations
              </h3>
              <ul className="space-y-1.5">
                {score.rationale.recommendations.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnalysisSection>

        <AnalysisSection
          id="sources"
          icon="faDatabase"
          title="Analyse multi-source"
          subtitle={
            sources.simulated.length === sources.signals.length
              ? `${sources.signals.length} sources de tendances — valeurs estimées, aucun connecteur temps réel actif`
              : `Agrégation de ${sources.signals.length} sources de tendances (${
                  sources.signals.length - sources.simulated.length
                } mesurée(s) en temps réel)`
          }
        >
          <SourcesTable report={sources} />
        </AnalysisSection>

        <AnalysisSection
          id="marche"
          icon="faScaleBalanced"
          title="Analyse du marché par pays"
          subtitle={`${analysis.paysLabel} et marchés comparables`}
        >
          <CountryComparison market={analysis.market} />
        </AnalysisSection>

        <AnalysisSection
          id="saisonnalite"
          icon="faCalendarDays"
          title="Calendrier de saisonnalité"
          subtitle="Périodes idéales et événements commerciaux"
        >
          <SeasonalityCalendar calendar={analysis.seasonality} />
        </AnalysisSection>

        <AnalysisSection
          id="finances"
          icon="faCoins"
          title="Estimation financière"
          subtitle="Simulateur de marge, ROAS cible et CPA maximal"
        >
          <FinancialSimulator initial={analysis.financial} />
        </AnalysisSection>

        <AnalysisSection
          id="concurrence"
          icon="faRankingStar"
          title="Analyse concurrentielle"
          subtitle="Saturation, forces et faiblesses des concurrents"
        >
          <CompetitionPanel competition={analysis.competition} />
        </AnalysisSection>

        <AnalysisSection
          id="fournisseurs"
          icon="faTruckFast"
          title="Comparatif fournisseurs"
          subtitle="Recommandation selon le pays ciblé"
        >
          <SuppliersPanel report={analysis.suppliers} />
        </AnalysisSection>

        <AnalysisSection
          id="previsions"
          icon="faChartLine"
          title="Prévisions IA"
          subtitle="Probabilité de rentabilité à 30, 60, 90 jours et 6 mois"
        >
          <PredictionPanel prediction={analysis.prediction} />
        </AnalysisSection>

        <SuggestionDisclaimer />
      </div>
    </div>
  );
}

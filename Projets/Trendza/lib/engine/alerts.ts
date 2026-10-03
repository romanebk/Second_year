import type { Product } from "@/types/database";
import type { TrendzaAlert } from "@/lib/engine/types";
import type { SignalsReport } from "@/lib/engine/sources";
import { averageSignals } from "@/lib/engine/sources/stats";
import { MONTHS } from "@/lib/constants";

type AlertRule = {
  id: string;
  severity: TrendzaAlert["severity"];
  title: string;
  check: (ctx: RuleContext) => string | null;
};

type RuleContext = {
  product: Product;
  pays: string;
  mois: number;
  signals: SignalsReport;
  score: number;
};

const RULES: AlertRule[] = [
  {
    id: "virale",
    severity: "success",
    title: "Tendance virale détectée",
    check: (ctx) => {
      const v = averageSignals(ctx.signals, "virality");
      return v >= 65 ? `Viralité élevée (${Math.round(v)}/100) sur les réseaux sociaux.` : null;
    },
  },
  {
    id: "periode_ideale",
    severity: "info",
    title: "Période idéale en cours",
    check: (ctx) => {
      const label = MONTHS.find((m) => m.value === ctx.mois)?.label;
      return ctx.product.mois_pertinents.includes(ctx.mois)
        ? `Le mois de ${label} est une période idéale pour ce produit.`
        : null;
    },
  },
  {
    id: "demande_hausse",
    severity: "warning",
    title: "Forte hausse de la demande",
    check: (ctx) => {
      const g = averageSignals(ctx.signals, "growth");
      return g >= 45 ? `Croissance de la demande très forte (${Math.round(g)}%).` : null;
    },
  },
  {
    id: "concurrence_faible",
    severity: "success",
    title: "Concurrence modérée",
    check: (ctx) => (ctx.score >= 72 ? "Fenêtre d'entrée favorable, à lancer rapidement." : null),
  },
  {
    id: "perte_popularite",
    severity: "danger",
    title: "Perte de popularité",
    check: (ctx) => {
      const g = averageSignals(ctx.signals, "growth");
      return g <= -20 ? `La demande recule (${Math.round(g)}%) : surveiller le positionnement.` : null;
    },
  },
];

/** Moteur de règles : génère les alertes IA actives pour un produit. */
export function buildAlerts(
  product: Product,
  pays: string,
  mois: number,
  signals: SignalsReport,
  score: number,
): TrendzaAlert[] {
  const ctx: RuleContext = { product, pays, mois, signals, score };
  const alerts: TrendzaAlert[] = [];

  for (const rule of RULES) {
    const message = rule.check(ctx);
    if (message) {
      alerts.push({ id: `${rule.id}:${product.id}`, severity: rule.severity, title: rule.title, message });
    }
  }

  return alerts;
}

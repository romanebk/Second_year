"use client";

import type { DashboardInsights, InsightProduct } from "@/lib/engine/dashboard";
import { FaIcon } from "@/components/shared/fa-icon";
import { cn } from "@/lib/utils";

const ALERT_STYLE: Record<string, string> = {
  success: "border-success/30 bg-success/10 text-success",
  info: "border-primary/30 bg-primary/10 text-primary",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

type CardDef = {
  key: keyof Pick<
    DashboardInsights,
    "topToday" | "topWeek" | "topMonth" | "growing" | "avoid" | "opportunities"
  >;
  title: string;
  icon: string;
  accent: string;
  metric: (item: InsightProduct) => string;
};

const CARDS: CardDef[] = [
  {
    key: "topToday",
    title: "Top produits du jour",
    icon: "faFire",
    accent: "text-primary",
    metric: (item) => `${Math.round(item.product.score)}/100`,
  },
  {
    key: "topWeek",
    title: "Top produits de la semaine",
    icon: "faBolt",
    accent: "text-accent",
    metric: (item) => `vitesse ${Math.round(item.velocity)}`,
  },
  {
    key: "topMonth",
    title: "Top produits du mois",
    icon: "faRankingStar",
    accent: "text-success",
    metric: (item) => `+${Math.round(item.growth)}%`,
  },
  {
    key: "growing",
    title: "En forte croissance",
    icon: "faArrowTrendUp",
    accent: "text-success",
    metric: (item) => `+${Math.round(item.growth)}%`,
  },
  {
    key: "opportunities",
    title: "Opportunités détectées",
    icon: "faLightbulb",
    accent: "text-amber-300",
    metric: (item) => `sat. ${Math.round(item.saturation)}%`,
  },
  {
    key: "avoid",
    title: "Produits à éviter",
    icon: "faTriangleExclamation",
    accent: "text-destructive",
    metric: (item) => `${Math.round(item.product.score)}/100`,
  },
];

function ProductRow({
  item,
  metric,
  analysisHref,
}: {
  item: InsightProduct;
  metric: (item: InsightProduct) => string;
  analysisHref: (id: string) => string;
}) {
  return (
    <li>
      <a
        href={analysisHref(item.product.id)}
        className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-surface/60"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-bold",
            item.product.score >= 75 ? "text-success" : item.product.score >= 55 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {Math.round(item.product.score)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium group-hover:text-primary">{item.product.nom}</p>
          <p className="text-[11px] text-muted-foreground">{item.product.categorie}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">{metric(item)}</span>
      </a>
    </li>
  );
}

export function InsightsGrid({
  insights,
  pays,
  mois,
}: {
  insights: DashboardInsights;
  pays: string;
  mois: number;
}) {
  const analysisHref = (id: string) => `/produits/${id}/analyse?pays=${pays}&mois=${mois}`;

  const hasData = CARDS.some((c) => (insights[c.key] as unknown[]).length > 0);

  if (!hasData && insights.alerts.length === 0 && insights.niches.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-end text-white">
          <FaIcon name="faWandMagicSparkles" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold">Perspectives IA</h2>
          <p className="text-xs text-muted-foreground">
            Synthèse générée à partir des tendances du marché
          </p>
        </div>
      </div>

      {insights.alerts.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.alerts.map((alert) => (
            <div key={alert.id} className={cn("rounded-2xl border p-3.5", ALERT_STYLE[alert.severity])}>
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
              <p className="mt-1 text-xs opacity-80">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.filter((c) => (insights[c.key] as unknown[]).length > 0).map((card) => (
          <div key={card.key} className="rounded-3xl border border-border bg-surface/40 p-4">
            <h3 className={cn("mb-2 flex items-center gap-2 text-sm font-semibold", card.accent)}>
              <FaIcon name={card.icon} className="h-3.5 w-3.5" />
              {card.title}
            </h3>
            <ul className="divide-y divide-border/50">
              {insights[card.key].slice(0, 4).map((item) => (
                <ProductRow key={item.product.id} item={item} metric={card.metric} analysisHref={analysisHref} />
              ))}
            </ul>
          </div>
        ))}

        {insights.niches.length > 0 && (
          <div className="rounded-3xl border border-border bg-surface/40 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <FaIcon name="faDiamond" className="h-3.5 w-3.5" />
              Niches prometteuses
            </h3>
            <ul className="space-y-2">
              {insights.niches.map((niche) => (
                <li
                  key={niche.label}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/40 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{niche.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {niche.count} produit(s) · demande en hausse
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-success">+{Math.round(niche.growth)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

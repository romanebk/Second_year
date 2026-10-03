"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { computeFinancial } from "@/lib/engine/financial";
import type { FinancialInput, FinancialPlan } from "@/lib/engine/types";
import { FaIcon } from "@/components/shared/fa-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pr-14"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
        highlight ? "border-primary/40 bg-primary/10" : "border-border bg-surface/50"
      }`}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-heading text-sm font-semibold ${highlight ? "text-white" : ""}`}>{value}</span>
    </div>
  );
}

export function FinancialSimulator({ initial }: { initial: FinancialPlan }) {
  const [input, setInput] = useState<FinancialInput>({ ...initial.input });

  const plan = useMemo(() => computeFinancial(input), [input]);

  const set = (key: keyof FinancialInput) => (value: number) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const format = (v: number) =>
    `${Math.round(v).toLocaleString("fr-FR")} XOF`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Field label="Prix de vente" value={input.prixVente} onChange={set("prixVente")} suffix="XOF" />
          <Field label="Prix d'achat" value={input.prixAchat} onChange={set("prixAchat")} suffix="XOF" />
          <Field label="Transport" value={input.transport} onChange={set("transport")} suffix="XOF" />
          <Field label="Publicité (par vente)" value={input.pub} onChange={set("pub")} suffix="XOF" />
          <Field label="TVA (%)" value={input.tvaPct} onChange={set("tvaPct")} suffix="%" />
          <Field label="Commissions (%)" value={input.commissionsPct} onChange={set("commissionsPct")} suffix="%" />
          <Field label="Frais paiement (%)" value={input.fraisPct} onChange={set("fraisPct")} suffix="%" />
        </div>
        <button
          onClick={() => {
            setInput({ ...initial.input });
            toast.success("Valeurs initiales restaurées");
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <FaIcon name="faRotateRight" className="h-3 w-3" />
          Réinitialiser aux valeurs estimées
        </button>
      </div>

      <div className="grid gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <ResultRow label="Prix conseillé" value={format(plan.prixConseille)} highlight />
          <ResultRow label="Bénéfice net / vente" value={format(plan.benefice)} />
          <ResultRow label="Marge brute" value={`${Math.round(plan.tauxBrut)}%`} />
          <ResultRow label="Marge nette" value={`${Math.round(plan.tauxNet)}%`} />
          <ResultRow label="ROAS cible" value={`${plan.roasCible.toFixed(1)}x`} />
          <ResultRow label="CPA maximal" value={format(plan.cpaMax)} />
        </div>

        <div className="mt-2 rounded-2xl border border-border bg-surface/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FaIcon name="faMoneyBillTrendUp" className="h-3.5 w-3.5 text-primary" />
            Décomposition du coût
          </p>
          <div className="space-y-1.5 text-sm">
            {[
              ["Prix de vente", format(plan.input.prixVente)],
              ["Achat", format(plan.input.prixAchat)],
              ["Transport", format(plan.input.transport)],
              ["Commissions", format(plan.commissions)],
              ["Frais paiement", format(plan.frais)],
              ["TVA collectée", format(plan.tvaAmount)],
              ["Publicité", format(plan.input.pub)],
              ["Coût total (hors pub)", format(plan.coutTotal)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

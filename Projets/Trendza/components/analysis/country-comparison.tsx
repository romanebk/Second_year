import type { MarketAnalysis } from "@/lib/engine/types";
import { marketComparisonProse } from "@/lib/engine/nlg";
import { FaIcon } from "@/components/shared/fa-icon";
import { cn } from "@/lib/utils";

export function CountryComparison({ market }: { market: MarketAnalysis }) {
  const main = market.country;

  return (
    <div>
      <p className="mb-5 rounded-2xl border border-border bg-surface/60 p-4 text-sm leading-relaxed text-muted-foreground">
        {marketComparisonProse(market)}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2.5 pr-4 font-medium">Marché</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              {market.comparison.slice(0, 1).length > 0 &&
                market.comparison[0].axes.map((a) => (
                  <th key={a.id} className="px-4 py-2.5 text-right font-medium">
                    {a.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-primary/5">
              <td className="py-3 pr-4">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  <FaIcon name="faCrown" className="h-3.5 w-3.5 text-amber-300" />
                  {main.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-heading text-base font-bold text-primary">{Math.round(main.total)}/100</span>
              </td>
              {main.axes.map((a) => (
                <td key={a.id} className="px-4 py-3 text-right font-medium">
                  {Math.round(a.value)}
                </td>
              ))}
            </tr>
            {market.comparison.map((country) => (
              <tr key={country.code} className="border-b border-border/60">
                <td className="py-3 pr-4 font-medium">{country.label}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "font-heading text-base font-bold",
                      country.total >= 70
                        ? "text-success"
                        : country.total >= 55
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {Math.round(country.total)}/100
                  </span>
                </td>
                {country.axes.map((a) => (
                  <td key={a.id} className="px-4 py-3 text-right text-muted-foreground">
                    {Math.round(a.value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

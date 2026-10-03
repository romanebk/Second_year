import type { Product } from "@/types/database";
import type {
  CommercialEvent,
  SeasonalityCalendar,
  SeasonalityMonth,
  SeasonLevel,
} from "@/lib/engine/types";
import { MONTHS } from "@/lib/constants";

export const COMMERCIAL_EVENTS: CommercialEvent[] = [
  { label: "Black Friday", start: 11, end: 11, icon: "faPercent" },
  { label: "Noël", start: 12, end: 12, icon: "faGift" },
  { label: "Saint-Valentin", start: 2, end: 2, icon: "faHeart" },
  { label: "Ramadan", start: 2, end: 3, icon: "faMoon" },
  { label: "Rentrée scolaire", start: 9, end: 9, icon: "faSchool" },
  { label: "Soldes d'été", start: 7, end: 8, icon: "faTag" },
  { label: "Vacances d'été", start: 7, end: 8, icon: "faUmbrellaBeach" },
];

function adjacent(m: number, refs: number[]): boolean {
  return refs.some(
    (r) => Math.abs(r - m) === 1 || (m === 1 && r === 12) || (m === 12 && r === 1),
  );
}

function monthEvents(m: number): string[] {
  return COMMERCIAL_EVENTS.filter((e) => e.start <= m && m <= e.end).map((e) => e.label);
}

export function buildSeasonality(product: Product): SeasonalityCalendar {
  const refs = product.mois_pertinents.length ? product.mois_pertinents : [11, 12];

  const months: SeasonalityMonth[] = MONTHS.map((m) => {
    const events = monthEvents(m.value);
    let level: SeasonLevel;
    if (refs.includes(m.value)) {
      level = "ideal";
    } else if (adjacent(m.value, refs) || events.length > 0) {
      level = "good";
    } else if (m.value === 1 || m.value === 6) {
      level = "avoid";
    } else {
      level = "medium";
    }
    return { mois: m.value, label: m.label, level, events };
  });

  const sorted = [...refs].sort((a, b) => a - b);
  const idealPeriod =
    sorted.length === 1
      ? MONTHS.find((m) => m.value === sorted[0])?.label ?? ""
      : `${MONTHS.find((m) => m.value === sorted[0])?.label} – ${
          MONTHS.find((m) => m.value === sorted[sorted.length - 1])?.label
        }`;

  return { months, events: COMMERCIAL_EVENTS, idealPeriod };
}

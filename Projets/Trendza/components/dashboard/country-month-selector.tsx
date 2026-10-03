"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, MapPin } from "@/components/shared/icons";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, MONTHS } from "@/lib/constants";

export function CountryMonthSelector({
  pays,
  mois,
}: {
  pays: string;
  mois: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Select value={pays} onValueChange={(v) => updateParam("pays", v)}>
          <SelectTrigger className="h-11 w-full border-0 bg-transparent px-1 focus:ring-0 sm:w-48">
            <SelectValue placeholder="Pays" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3">
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Select value={String(mois)} onValueChange={(v) => updateParam("mois", v)}>
          <SelectTrigger className="h-11 w-full border-0 bg-transparent px-1 focus:ring-0 sm:w-40">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

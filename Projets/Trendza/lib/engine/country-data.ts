import { COUNTRIES } from "@/lib/constants";

export type CountryFactors = {
  code: string;
  label: string;
  demande: number;
  pouvoirAchat: number;
  cpc: number;
  logistique: number;
  maturite: number;
  concurrence: number;
};

/** Facteurs normalisés (0..1) par pays. CPC élevé = publicité plus chère. */
export const COUNTRY_FACTORS: CountryFactors[] = [
  { code: "US", label: "États-Unis", demande: 0.96, pouvoirAchat: 0.94, cpc: 0.95, logistique: 0.95, maturite: 0.96, concurrence: 0.94 },
  { code: "CA", label: "Canada", demande: 0.85, pouvoirAchat: 0.88, cpc: 0.92, logistique: 0.9, maturite: 0.93, concurrence: 0.82 },
  { code: "FR", label: "France", demande: 0.95, pouvoirAchat: 0.9, cpc: 0.88, logistique: 0.92, maturite: 0.95, concurrence: 0.9 },
  { code: "CI", label: "Côte d'Ivoire", demande: 0.62, pouvoirAchat: 0.5, cpc: 0.34, logistique: 0.55, maturite: 0.6, concurrence: 0.58 },
  { code: "SN", label: "Sénégal", demande: 0.55, pouvoirAchat: 0.48, cpc: 0.32, logistique: 0.6, maturite: 0.62, concurrence: 0.55 },
  { code: "CM", label: "Cameroun", demande: 0.5, pouvoirAchat: 0.42, cpc: 0.28, logistique: 0.5, maturite: 0.5, concurrence: 0.5 },
  { code: "BJ", label: "Bénin", demande: 0.45, pouvoirAchat: 0.35, cpc: 0.24, logistique: 0.5, maturite: 0.48, concurrence: 0.45 },
  { code: "TG", label: "Togo", demande: 0.44, pouvoirAchat: 0.33, cpc: 0.22, logistique: 0.48, maturite: 0.45, concurrence: 0.42 },
  { code: "ML", label: "Mali", demande: 0.42, pouvoirAchat: 0.3, cpc: 0.2, logistique: 0.42, maturite: 0.42, concurrence: 0.4 },
];

export function countryFactors(code: string): CountryFactors {
  return (
    COUNTRY_FACTORS.find((c) => c.code === code) ??
    COUNTRY_FACTORS.find((c) => c.code === "FR")!
  );
}

export function countryLabel(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}

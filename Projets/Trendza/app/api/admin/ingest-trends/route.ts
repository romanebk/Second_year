import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";

export const dynamic = "force-dynamic";

/** L'ingestion pytrends est lente (Google impose un rythme lent). */
export const maxDuration = 300;

/**
 * Déclenche manuellement le service d'ingestion Google Trends.
 *
 * Cette route ne parle jamais à Supabase avec la clé service_role : elle
 * délègue au service Python, seul détenteur de cette clé. Elle se contente
 * de vérifier que l'appelant est bien administrateur avant de relayer.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const serviceUrl = process.env.TRENDS_SERVICE_URL;
  const serviceSecret = process.env.TRENDS_SERVICE_SECRET;

  if (!serviceUrl || !serviceSecret) {
    return NextResponse.json(
      {
        error:
          "Service d'ingestion non configuré. Renseignez TRENDS_SERVICE_URL et TRENDS_SERVICE_SECRET.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceSecret}`,
      },
      // Le service est lent par conception : on coupe avant le plafond de la
      // route pour renvoyer un message clair plutôt qu'un timeout brut.
      signal: AbortSignal.timeout(280_000),
    });

    const payload = (await response.json().catch(() => null)) as
      | { inserted?: number; updated?: number; failed?: number; errors?: string[]; detail?: string }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.detail ?? `Le service a répondu ${response.status}.` },
        { status: 502 },
      );
    }

    return NextResponse.json(payload ?? {});
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    console.error("ingest-trends error", err);
    return NextResponse.json(
      {
        error: timedOut
          ? "Le service d'ingestion n'a pas répondu à temps. Relancez-le en tâche planifiée."
          : "Service d'ingestion injoignable.",
      },
      { status: 504 },
    );
  }
}

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";
import { getAccesPremium } from "@/lib/subscription";
import { answerQuestion } from "@/lib/engine/chat";
import type { ChatContext } from "@/lib/engine/types";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { message?: string; context?: ChatContext };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);

  // L'assistant est une fonctionnalité premium. Sans ce contrôle, la page
  // /assistant serait protégée mais son API resterait appelable directement,
  // ce qui contournerait entièrement le paywall.
  const acces = await getAccesPremium(supabase, user.id, profile?.role);
  if (!acces.actif) {
    return NextResponse.json(
      {
        error:
          "L'assistant est réservé aux abonnés. Activez votre abonnement pour poser vos questions.",
        abonnementRequis: true,
      },
      { status: 402 },
    );
  }

  const context: ChatContext = { ...body.context };

  if (!context.pays) {
    context.pays = profile?.pays ?? undefined;
  }

  const { data: rows, error } = await supabase
    .from("products")
    .select("*")
    .order("score", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: "Catalogue indisponible." }, { status: 500 });
  }

  const products = rows as Product[];

  try {
    const answer = await answerQuestion(message, context, products);
    return NextResponse.json(answer);
  } catch (err) {
    console.error("assistant error", err);
    return NextResponse.json(
      { message: "Une erreur est survenue pendant l'analyse. Réessayez dans un instant." },
      { status: 200 },
    );
  }
}

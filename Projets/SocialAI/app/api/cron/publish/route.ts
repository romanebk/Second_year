import { NextResponse } from "next/server";
import { processDuePosts } from "@/lib/queue/publish-worker";

/**
 * Processes all scheduled posts that are due.
 *
 * This is where an external scheduler (Vercel Cron, GitHub Actions, a
 * BullMQ worker heartbeat, etc.) would hit periodically. Protected by an
 * optional CRON_SECRET bearer token.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const processed = await processDuePosts();
  return NextResponse.json({ processed });
}

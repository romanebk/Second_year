import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishPost } from "@/lib/queue/publish-worker";

type Params = { params: { id: string } };

/** Publish a post immediately (used by "Publier maintenant"). */
export async function POST(_req: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const post = await prisma.post.findFirst({
    where: { id: params.id, userId },
    select: { id: true },
  });
  if (!post) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await publishPost(post.id);
  return NextResponse.json({ ok: true });
}

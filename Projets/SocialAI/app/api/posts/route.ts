import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getPosts } from "@/lib/queries";
import { createPost, PostServiceError } from "@/lib/posts-service";
import { createPostSchema } from "@/lib/validations/post";
import type { PostStatus } from "@prisma/client";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as PostStatus | null;

  const posts = await getPosts(userId, {
    status: status ?? undefined,
  });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 422 },
    );
  }

  try {
    const post = await createPost(userId, parsed.data);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof PostServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

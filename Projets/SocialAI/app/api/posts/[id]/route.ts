import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getPost } from "@/lib/queries";
import { updatePost, deletePost, PostServiceError } from "@/lib/posts-service";
import { updatePostSchema } from "@/lib/validations/post";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const post = await getPost(userId, params.id);
  if (!post) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 422 },
    );
  }

  try {
    const post = await updatePost(userId, params.id, parsed.data);
    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof PostServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    await deletePost(userId, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PostServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

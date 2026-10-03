import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED: Record<string, "image" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
};

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  const kind = ALLOWED[file.type];
  if (!kind) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WebP, GIF, MP4, WebM)" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (25 Mo max)" },
      { status: 413 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filename = `${randomUUID()}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, filename), buffer);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    type: kind,
    mimeType: file.type,
    sizeBytes: file.size,
  });
}

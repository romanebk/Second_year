import type { Platform, PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publishQueue } from "@/lib/queue";
import type { CreatePostInput, UpdatePostInput } from "@/lib/validations/post";

export class PostServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Resolve the user's connected SocialAccount ids for the given platforms. */
async function resolveTargets(userId: string, platforms: Platform[]) {
  const accounts = await prisma.socialAccount.findMany({
    where: { userId, platform: { in: platforms }, status: "CONNECTED" },
  });

  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));
  const missing = platforms.filter((p) => !byPlatform.has(p));
  if (missing.length > 0) {
    throw new PostServiceError(
      `Aucun compte connecté pour : ${missing.join(", ")}. Connecte-le d'abord.`,
      422,
    );
  }

  return platforms.map((platform) => ({
    platform,
    socialAccountId: byPlatform.get(platform)!.id,
  }));
}

export async function createPost(userId: string, input: CreatePostInput) {
  const targets = await resolveTargets(userId, input.platforms);
  const isDraft = input.action === "draft";
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const status: PostStatus = isDraft ? "DRAFT" : "SCHEDULED";

  const post = await prisma.post.create({
    data: {
      userId,
      content: input.content,
      status,
      scheduledAt,
      media: {
        create: input.media.map((m, i) => ({
          url: m.url,
          type: m.type,
          mimeType: m.mimeType,
          sizeBytes: m.sizeBytes,
          order: i,
        })),
      },
      targets: {
        create: targets.map((t) => ({
          platform: t.platform,
          socialAccountId: t.socialAccountId,
          status,
        })),
      },
    },
  });

  if (status === "SCHEDULED") {
    await publishQueue.schedulePost(post.id, scheduledAt);
  }

  return post;
}

export async function updatePost(
  userId: string,
  id: string,
  input: UpdatePostInput,
) {
  const existing = await prisma.post.findFirst({ where: { id, userId } });
  if (!existing) throw new PostServiceError("Post introuvable", 404);
  if (existing.status === "PUBLISHED" || existing.status === "PUBLISHING") {
    throw new PostServiceError(
      "Un post déjà publié ne peut pas être modifié",
      409,
    );
  }

  const nextStatus: PostStatus =
    input.action === "draft"
      ? "DRAFT"
      : input.action === "schedule"
        ? "SCHEDULED"
        : existing.status;

  const scheduledAt =
    input.scheduledAt !== undefined
      ? input.scheduledAt
        ? new Date(input.scheduledAt)
        : null
      : existing.scheduledAt;

  const post = await prisma.$transaction(async (tx) => {
    if (input.platforms) {
      const targets = await resolveTargets(userId, input.platforms);
      await tx.postTarget.deleteMany({ where: { postId: id } });
      await tx.postTarget.createMany({
        data: targets.map((t) => ({
          postId: id,
          platform: t.platform,
          socialAccountId: t.socialAccountId,
          status: nextStatus,
        })),
      });
    } else {
      await tx.postTarget.updateMany({
        where: { postId: id },
        data: { status: nextStatus },
      });
    }

    if (input.media) {
      await tx.mediaAsset.deleteMany({ where: { postId: id } });
      if (input.media.length > 0) {
        await tx.mediaAsset.createMany({
          data: input.media.map((m, i) => ({
            postId: id,
            url: m.url,
            type: m.type,
            mimeType: m.mimeType,
            sizeBytes: m.sizeBytes,
            order: i,
          })),
        });
      }
    }

    return tx.post.update({
      where: { id },
      data: {
        content: input.content ?? existing.content,
        status: nextStatus,
        scheduledAt,
      },
    });
  });

  // Reconcile the queue with the new state.
  if (post.status === "SCHEDULED") {
    await publishQueue.schedulePost(post.id, post.scheduledAt);
  } else {
    await publishQueue.cancelPost(post.id);
  }

  return post;
}

export async function deletePost(userId: string, id: string) {
  const existing = await prisma.post.findFirst({ where: { id, userId } });
  if (!existing) throw new PostServiceError("Post introuvable", 404);

  await publishQueue.cancelPost(id);
  await prisma.post.delete({ where: { id } });
}

import type { Platform, PostStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function getSocialAccounts(userId: string) {
  return prisma.socialAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDashboardStats(userId: string) {
  const [grouped, accountsCount, followers] = await Promise.all([
    prisma.post.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.socialAccount.count({
      where: { userId, status: "CONNECTED" },
    }),
    prisma.socialAccount.aggregate({
      where: { userId, status: "CONNECTED" },
      _sum: { followers: true },
    }),
  ]);

  const byStatus = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all]),
  ) as Record<PostStatus, number | undefined>;

  return {
    scheduled: byStatus.SCHEDULED ?? 0,
    published: byStatus.PUBLISHED ?? 0,
    draft: byStatus.DRAFT ?? 0,
    failed: byStatus.FAILED ?? 0,
    connectedAccounts: accountsCount,
    totalFollowers: followers._sum.followers ?? 0,
  };
}

export type PostWithRelations = Prisma.PostGetPayload<{
  include: { targets: { include: { socialAccount: true } }; media: true };
}>;

export function getPosts(
  userId: string,
  opts?: { status?: PostStatus; take?: number },
) {
  return prisma.post.findMany({
    where: {
      userId,
      ...(opts?.status ? { status: opts.status } : {}),
    },
    include: {
      targets: { include: { socialAccount: true } },
      media: { orderBy: { order: "asc" } },
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: opts?.take,
  });
}

export function getUpcomingPosts(userId: string, take = 5) {
  return prisma.post.findMany({
    where: { userId, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
    include: {
      targets: { include: { socialAccount: true } },
      media: { orderBy: { order: "asc" } },
    },
    orderBy: { scheduledAt: "asc" },
    take,
  });
}

export function getPostsInRange(userId: string, start: Date, end: Date) {
  return prisma.post.findMany({
    where: {
      userId,
      scheduledAt: { gte: start, lte: end },
    },
    include: {
      targets: { include: { socialAccount: true } },
      media: { orderBy: { order: "asc" } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export function getPost(userId: string, id: string) {
  return prisma.post.findFirst({
    where: { id, userId },
    include: {
      targets: { include: { socialAccount: true } },
      media: { orderBy: { order: "asc" } },
    },
  });
}

export function getUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export type { Platform };

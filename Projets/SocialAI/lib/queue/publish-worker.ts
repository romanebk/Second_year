import { prisma } from "@/lib/prisma";
import { PLATFORMS } from "@/lib/constants";

/**
 * The actual "publish" logic executed by the queue worker.
 *
 * MVP: this is a mock. It does not call Meta/TikTok — it simply transitions
 * PostTarget + Post statuses as a real integration eventually would.
 * When the real integrations land, only the body of `publishToPlatform`
 * needs to change; the state machine around it stays identical.
 */
async function publishToPlatform(target: {
  id: string;
  platform: keyof typeof PLATFORMS;
}): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
  // --- Real integration would call the platform API here. ---
  // Simulated latency + deterministic success for the mock.
  await new Promise((r) => setTimeout(r, 150));
  return {
    ok: true,
    externalPostId: `mock_${target.platform.toLowerCase()}_${target.id.slice(0, 8)}`,
  };
}

/**
 * Publish a single post: fan out to each of its platform targets and
 * roll the results up into the post's overall status.
 */
export async function publishPost(postId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { targets: true },
  });

  if (!post) return;
  if (post.status === "PUBLISHED") return;
  if (post.targets.length === 0) return;

  await prisma.post.update({
    where: { id: post.id },
    data: { status: "PUBLISHING" },
  });

  let anySuccess = false;
  let anyFailure = false;

  for (const target of post.targets) {
    const result = await publishToPlatform({
      id: target.id,
      platform: target.platform,
    });

    if (result.ok) {
      anySuccess = true;
      await prisma.postTarget.update({
        where: { id: target.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          externalPostId: result.externalPostId,
          error: null,
        },
      });
    } else {
      anyFailure = true;
      await prisma.postTarget.update({
        where: { id: target.id },
        data: { status: "FAILED", error: result.error },
      });
    }
  }

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: anySuccess ? "PUBLISHED" : "FAILED",
      publishedAt: anySuccess ? new Date() : null,
      // If a subset failed, surface it on the failing targets; the post is
      // considered published as long as at least one platform succeeded.
      ...(anyFailure && anySuccess ? {} : {}),
    },
  });
}

/**
 * Find every scheduled post whose time has come and publish it.
 * Called by the mock queue timer and by the /api/cron/publish endpoint,
 * which is where a real cron (Vercel Cron, etc.) would hit.
 */
export async function processDuePosts(now: Date = new Date()): Promise<number> {
  const due = await prisma.post.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
    select: { id: true },
  });

  for (const post of due) {
    await publishPost(post.id);
  }

  return due.length;
}

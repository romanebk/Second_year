import type { PublishQueue } from "./types";

/**
 * Redis/BullMQ-backed implementation — STUB for the MVP.
 *
 * When we're ready to make scheduling durable, install `bullmq` + `ioredis`
 * and flesh this out. The shape below is exactly how it will wire up:
 *
 * ```ts
 * import { Queue, Worker } from "bullmq";
 * import IORedis from "ioredis";
 * import { publishPost } from "./publish-worker";
 *
 * const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
 * const queue = new Queue("publish", { connection });
 *
 * // one worker process (or a dedicated worker service):
 * new Worker("publish", async (job) => publishPost(job.data.postId), { connection });
 *
 * async schedulePost(postId, runAt) {
 *   const delay = runAt ? Math.max(0, runAt.getTime() - Date.now()) : 0;
 *   await queue.add("publish", { postId }, { jobId: postId, delay, removeOnComplete: true });
 * }
 * async cancelPost(postId) {
 *   const job = await queue.getJob(postId);
 *   await job?.remove();
 * }
 * ```
 *
 * Selecting this driver before the dependency is installed throws, on purpose.
 */
export function createBullMQQueue(): PublishQueue {
  throw new Error(
    "BullMQ queue driver not implemented yet. Install `bullmq` + `ioredis`, " +
      "set REDIS_URL, and implement lib/queue/bullmq-queue.ts. " +
      "Use QUEUE_DRIVER=mock for the MVP.",
  );
}

import type { PublishQueue } from "./types";
import { publishPost, processDuePosts } from "./publish-worker";

/**
 * In-process mock queue for the MVP.
 *
 * - Uses `setTimeout` to fire near-future jobs while the server is alive.
 * - Also exposes a poller so a cron endpoint can catch anything missed
 *   (server restarts, far-future schedules).
 *
 * This is intentionally NOT durable — it just mirrors the BullMQ API so the
 * rest of the app can be written against the real interface today.
 */
class MockPublishQueue implements PublishQueue {
  readonly driver = "mock";
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private poller?: ReturnType<typeof setInterval>;

  constructor() {
    // Safety net poller (every 60s) to publish anything already due.
    if (typeof process !== "undefined" && !this.poller) {
      this.poller = setInterval(() => {
        processDuePosts().catch(() => {});
      }, 60_000);
      // Don't keep the event loop alive just for the poller.
      this.poller.unref?.();
    }
  }

  async schedulePost(postId: string, runAt: Date | null): Promise<void> {
    this.clearTimer(postId);

    const delay = runAt ? runAt.getTime() - Date.now() : 0;

    // If it's due now (or overdue), publish immediately.
    if (delay <= 0) {
      void publishPost(postId).catch((err) =>
        console.error("[queue:mock] publish failed", postId, err),
      );
      return;
    }

    // setTimeout maxes out at ~24.8 days; the poller covers longer horizons.
    const MAX_DELAY = 2_147_483_000;
    if (delay > MAX_DELAY) {
      console.log(`[queue:mock] post ${postId} scheduled beyond timer horizon; poller will handle it`);
      return;
    }

    const timer = setTimeout(() => {
      this.timers.delete(postId);
      void publishPost(postId).catch((err) =>
        console.error("[queue:mock] publish failed", postId, err),
      );
    }, delay);
    timer.unref?.();
    this.timers.set(postId, timer);
    console.log(`[queue:mock] post ${postId} scheduled in ${Math.round(delay / 1000)}s`);
  }

  async cancelPost(postId: string): Promise<void> {
    this.clearTimer(postId);
    console.log(`[queue:mock] cancelled job for post ${postId}`);
  }

  private clearTimer(postId: string) {
    const existing = this.timers.get(postId);
    if (existing) {
      clearTimeout(existing);
      this.timers.delete(postId);
    }
  }
}

export function createMockQueue(): PublishQueue {
  return new MockPublishQueue();
}

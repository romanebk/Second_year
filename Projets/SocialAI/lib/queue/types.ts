/**
 * Publish queue abstraction.
 *
 * For the MVP this is backed by an in-process mock (see `mock-queue.ts`).
 * The real implementation will be a Redis/BullMQ-backed queue
 * (see `bullmq-queue.ts`) — swapping drivers is done in `index.ts`
 * via the QUEUE_DRIVER env var, with zero changes to calling code.
 */
export interface PublishJobData {
  postId: string;
}

export interface PublishQueue {
  /**
   * Schedule (or reschedule) a post for publication.
   * @param runAt when to publish; if null/past, publish as soon as possible.
   */
  schedulePost(postId: string, runAt: Date | null): Promise<void>;

  /** Remove any pending job for a post (e.g. when it goes back to draft or is deleted). */
  cancelPost(postId: string): Promise<void>;

  /** Human-readable driver name, for diagnostics. */
  readonly driver: string;
}

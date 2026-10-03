import type { PublishQueue } from "./types";
import { createMockQueue } from "./mock-queue";
import { createBullMQQueue } from "./bullmq-queue";

export type { PublishQueue, PublishJobData } from "./types";

const globalForQueue = globalThis as unknown as {
  publishQueue: PublishQueue | undefined;
};

function buildQueue(): PublishQueue {
  const driver = (process.env.QUEUE_DRIVER ?? "mock").toLowerCase();
  switch (driver) {
    case "bullmq":
      return createBullMQQueue();
    case "mock":
    default:
      return createMockQueue();
  }
}

/** Singleton publish queue (mock by default, BullMQ when configured). */
export const publishQueue: PublishQueue =
  globalForQueue.publishQueue ?? buildQueue();

if (process.env.NODE_ENV !== "production") {
  globalForQueue.publishQueue = publishQueue;
}

import type { Platform, PostStatus } from "@prisma/client";

export type PlatformMeta = {
  id: Platform;
  label: string;
  color: string; // brand hex, used for chips/badges only
  maxChars: number;
};

export const PLATFORMS: Record<Platform, PlatformMeta> = {
  INSTAGRAM: { id: "INSTAGRAM", label: "Instagram", color: "#E1306C", maxChars: 2200 },
  FACEBOOK: { id: "FACEBOOK", label: "Facebook", color: "#1877F2", maxChars: 63206 },
  TIKTOK: { id: "TIKTOK", label: "TikTok", color: "#111111", maxChars: 2200 },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export type StatusMeta = {
  id: PostStatus;
  label: string;
  // Tailwind classes for badge (works in light + dark)
  className: string;
};

export const POST_STATUS: Record<PostStatus, StatusMeta> = {
  DRAFT: {
    id: "DRAFT",
    label: "Brouillon",
    className: "bg-muted text-muted-foreground",
  },
  SCHEDULED: {
    id: "SCHEDULED",
    label: "Programmé",
    className: "bg-accent/10 text-accent",
  },
  PUBLISHING: {
    id: "PUBLISHING",
    label: "Publication…",
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  PUBLISHED: {
    id: "PUBLISHED",
    label: "Publié",
    className: "bg-success/15 text-success",
  },
  FAILED: {
    id: "FAILED",
    label: "Échoué",
    className: "bg-destructive/10 text-destructive",
  },
};

export const POST_STATUS_LIST = Object.values(POST_STATUS);

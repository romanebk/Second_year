import type { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * MVP mock: every user starts with three "connected" social accounts.
 * This is the mock referenced in the spec ("comptes sociaux connectés (mock)").
 * The real OAuth connect flow (the placeholder buttons in Settings) will
 * replace this later.
 */
const MOCK_TEMPLATE: {
  platform: Platform;
  displayName: string;
  followers: number;
}[] = [
  { platform: "INSTAGRAM", displayName: "Instagram", followers: 12480 },
  { platform: "FACEBOOK", displayName: "Facebook", followers: 8320 },
  { platform: "TIKTOK", displayName: "TikTok", followers: 24800 },
];

function handleFromEmail(email: string) {
  const base = email.split("@")[0]?.replace(/[^a-z0-9._]/gi, "") || "creator";
  return base.toLowerCase();
}

export async function provisionMockAccounts(userId: string, email: string) {
  const handle = handleFromEmail(email);

  await prisma.socialAccount.createMany({
    data: MOCK_TEMPLATE.map((t) => ({
      userId,
      platform: t.platform,
      handle,
      displayName: t.displayName,
      followers: t.followers,
      status: "CONNECTED" as const,
    })),
    skipDuplicates: true,
  });
}

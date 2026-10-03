import { PrismaClient, type Platform, type PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@socialai.app";
const DEMO_PASSWORD = "password123";

const MOCK_ACCOUNTS: {
  platform: Platform;
  displayName: string;
  followers: number;
}[] = [
  { platform: "INSTAGRAM", displayName: "Studio Léa", followers: 18420 },
  { platform: "FACEBOOK", displayName: "Studio Léa", followers: 9260 },
  { platform: "TIKTOK", displayName: "Studio Léa", followers: 41300 },
];

function daysFromNow(days: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Léa Créatrice",
      passwordHash,
    },
  });

  // Reset demo content for idempotency.
  await prisma.post.deleteMany({ where: { userId: user.id } });
  await prisma.socialAccount.deleteMany({ where: { userId: user.id } });

  await prisma.socialAccount.createMany({
    data: MOCK_ACCOUNTS.map((a) => ({
      userId: user.id,
      platform: a.platform,
      handle: "studio.lea",
      displayName: a.displayName,
      followers: a.followers,
      status: "CONNECTED",
    })),
  });

  const accounts = await prisma.socialAccount.findMany({
    where: { userId: user.id },
  });
  const accByPlatform = new Map(accounts.map((a) => [a.platform, a]));

  async function createPost(opts: {
    content: string;
    status: PostStatus;
    scheduledAt: Date | null;
    publishedAt?: Date | null;
    platforms: Platform[];
    failedPlatforms?: Platform[];
    media?: { url: string; type: "image" | "video" }[];
  }) {
    await prisma.post.create({
      data: {
        userId: user.id,
        content: opts.content,
        status: opts.status,
        scheduledAt: opts.scheduledAt,
        publishedAt: opts.publishedAt ?? null,
        media: {
          create: (opts.media ?? []).map((m, i) => ({
            url: m.url,
            type: m.type,
            order: i,
          })),
        },
        targets: {
          create: opts.platforms.map((p) => {
            const failed = opts.failedPlatforms?.includes(p);
            return {
              platform: p,
              socialAccountId: accByPlatform.get(p)!.id,
              status: failed ? "FAILED" : opts.status,
              publishedAt:
                opts.status === "PUBLISHED" && !failed
                  ? (opts.publishedAt ?? new Date())
                  : null,
              error: failed ? "Token expiré (simulation)" : null,
            };
          }),
        },
      },
    });
  }

  await createPost({
    content:
      "Nouvelle collection printemps disponible ! ☀️ Découvre les pièces coup de cœur en story. #mode #printemps",
    status: "PUBLISHED",
    scheduledAt: daysFromNow(-3, 9, 30),
    publishedAt: daysFromNow(-3, 9, 30),
    platforms: ["INSTAGRAM", "FACEBOOK"],
  });

  await createPost({
    content:
      "3 astuces pour booster ton engagement cette semaine 🚀 Enregistre le post pour ne rien oublier !",
    status: "SCHEDULED",
    scheduledAt: daysFromNow(2, 11, 0),
    platforms: ["INSTAGRAM", "TIKTOK"],
  });

  await createPost({
    content:
      "Behind the scenes du dernier shooting 🎬 On vous montre tout en vidéo.",
    status: "SCHEDULED",
    scheduledAt: daysFromNow(5, 18, 30),
    platforms: ["TIKTOK"],
  });

  await createPost({
    content: "Idée de post à finaliser : sondage sur les prochains contenus 📊",
    status: "DRAFT",
    scheduledAt: null,
    platforms: ["INSTAGRAM"],
  });

  await createPost({
    content:
      "Promo flash 24h ⏰ -20% avec le code CREATOR20. À partager partout !",
    status: "FAILED",
    scheduledAt: daysFromNow(-1, 14, 0),
    platforms: ["TIKTOK"],
    failedPlatforms: ["TIKTOK"],
  });

  console.log(`✅ Seed terminé.`);
  console.log(`   Compte démo : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

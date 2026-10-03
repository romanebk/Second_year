import { z } from "zod";

export const platformEnum = z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK"]);

export const mediaSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video"]),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

export const createPostSchema = z
  .object({
    content: z.string().trim().max(63206, "Contenu trop long").default(""),
    platforms: z.array(platformEnum).min(1, "Sélectionne au moins une plateforme"),
    scheduledAt: z
      .string()
      .datetime({ offset: true })
      .optional()
      .nullable(),
    media: z.array(mediaSchema).max(10, "10 médias maximum").default([]),
    action: z.enum(["draft", "schedule"]).default("schedule"),
  })
  .refine(
    (data) => data.content.trim().length > 0 || data.media.length > 0,
    { message: "Ajoute du texte ou un média", path: ["content"] },
  )
  .refine(
    (data) => data.action === "draft" || Boolean(data.scheduledAt),
    { message: "Choisis une date de publication", path: ["scheduledAt"] },
  );

export const updatePostSchema = z.object({
  content: z.string().trim().max(63206).optional(),
  platforms: z.array(platformEnum).min(1).optional(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
  media: z.array(mediaSchema).max(10).optional(),
  action: z.enum(["draft", "schedule"]).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

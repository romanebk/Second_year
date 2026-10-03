import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUserId } from "@/lib/auth";
import { getPost, getSocialAccounts } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { PostComposer, type ComposerAccount } from "@/components/post-composer";
import { StatusBadge } from "@/components/status-badge";

export const metadata = { title: "Modifier le post" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [post, accounts] = await Promise.all([
    getPost(userId, params.id),
    getSocialAccounts(userId),
  ]);

  if (!post) notFound();

  const composerAccounts: ComposerAccount[] = accounts
    .filter((a) => a.status === "CONNECTED")
    .map((a) => ({
      platform: a.platform,
      handle: a.handle,
      displayName: a.displayName,
      avatarUrl: a.avatarUrl,
    }));

  const published = post.status === "PUBLISHED" || post.status === "PUBLISHING";

  return (
    <div>
      <Link
        href="/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux publications
      </Link>
      <PageHeader
        title="Modifier le post"
        description="Ajuste le contenu, les plateformes ou la date de publication."
        action={<StatusBadge status={post.status} />}
      />

      {published ? (
        <div className="rounded-lg border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Ce post est déjà publié et ne peut plus être modifié.
        </div>
      ) : (
        <PostComposer
          accounts={composerAccounts}
          initial={{
            id: post.id,
            content: post.content,
            platforms: post.targets.map((t) => t.platform),
            scheduledAt: post.scheduledAt?.toISOString() ?? null,
            media: post.media.map((m) => ({
              url: m.url,
              type: m.type as "image" | "video",
              mimeType: m.mimeType ?? undefined,
              sizeBytes: m.sizeBytes ?? undefined,
            })),
            status: post.status,
          }}
        />
      )}
    </div>
  );
}

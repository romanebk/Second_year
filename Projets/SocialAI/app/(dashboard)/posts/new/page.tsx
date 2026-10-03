import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUserId } from "@/lib/auth";
import { getSocialAccounts } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { PostComposer, type ComposerAccount } from "@/components/post-composer";

export const metadata = { title: "Nouveau post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const accounts = await getSocialAccounts(userId);
  const composerAccounts: ComposerAccount[] = accounts
    .filter((a) => a.status === "CONNECTED")
    .map((a) => ({
      platform: a.platform,
      handle: a.handle,
      displayName: a.displayName,
      avatarUrl: a.avatarUrl,
    }));

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
        title="Créer un post"
        description="Rédige, ajoute des médias, choisis tes plateformes et programme la publication."
      />
      <PostComposer accounts={composerAccounts} />
    </div>
  );
}

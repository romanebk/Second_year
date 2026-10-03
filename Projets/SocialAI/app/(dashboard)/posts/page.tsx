import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Send } from "lucide-react";
import type { PostStatus } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { getPosts } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { PostsViewSwitch } from "@/components/posts-view-switch";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { POST_STATUS_LIST } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Publications" };
export const dynamic = "force-dynamic";

const FILTERS: { value: PostStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous" },
  ...POST_STATUS_LIST.filter((s) => s.id !== "PUBLISHING").map((s) => ({
    value: s.id,
    label: s.label,
  })),
];

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const active = (searchParams.status ?? "ALL") as PostStatus | "ALL";
  const posts = await getPosts(userId, {
    status: active !== "ALL" ? active : undefined,
  });

  return (
    <div>
      <PageHeader
        title="Publications"
        description="Gère tous tes posts : brouillons, programmés, publiés et échoués."
        action={
          <Link href="/posts/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nouveau post
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const isActive = active === f.value;
            const href =
              f.value === "ALL" ? "/posts" : `/posts?status=${f.value}`;
            return (
              <Link
                key={f.value}
                href={href}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <PostsViewSwitch />
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Send}
          title={
            active === "ALL"
              ? "Aucune publication pour le moment"
              : "Aucun post dans cette catégorie"
          }
          description="Crée un post, choisis tes plateformes et programme-le en quelques secondes."
          action={
            <Link href="/posts/new">
              <Button>
                <Plus className="h-4 w-4" />
                Créer un post
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

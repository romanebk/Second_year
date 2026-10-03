import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Plus,
  Send,
  Users,
} from "lucide-react";

import { getCurrentUserId } from "@/lib/auth";
import {
  getDashboardStats,
  getSocialAccounts,
  getUpcomingPosts,
  getUser,
} from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SocialAccountCard } from "@/components/social-account-card";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [user, stats, accounts, upcoming] = await Promise.all([
    getUser(userId),
    getDashboardStats(userId),
    getSocialAccounts(userId),
    getUpcomingPosts(userId, 4),
  ]);

  const firstName = user?.name?.split(" ")[0] ?? "Créateur";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Salut ${firstName} 👋`}
        description="Voici un aperçu de ton activité sociale."
        action={
          <Link href="/posts/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nouveau post
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Posts programmés"
          value={stats.scheduled}
          icon={CalendarClock}
          tone="accent"
        />
        <StatCard
          label="Posts publiés"
          value={stats.published}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Brouillons"
          value={stats.draft}
          icon={FileText}
          tone="muted"
        />
        <StatCard
          label="Abonnés (total)"
          value={
            stats.totalFollowers >= 1000
              ? `${(stats.totalFollowers / 1000).toFixed(1)}k`
              : stats.totalFollowers
          }
          icon={Users}
          tone="primary"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming posts */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">
              Prochaines publications
            </h2>
            <Link
              href="/posts"
              className="text-sm font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Aucune publication programmée"
              description="Crée ton premier post et choisis quand il sera publié."
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
            <div className="space-y-3">
              {upcoming.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Connected accounts */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">
              Comptes connectés
            </h2>
            <Link
              href="/settings"
              className="text-sm font-medium text-primary hover:underline"
            >
              Gérer
            </Link>
          </div>

          {accounts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aucun compte connecté</CardTitle>
                <CardDescription>
                  Connecte tes réseaux depuis les paramètres pour commencer à
                  publier.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <SocialAccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

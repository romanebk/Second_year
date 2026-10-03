"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Package, TrendingUp, UserCheck, Users } from "@/components/shared/icons";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { UsersTable } from "@/components/admin/users-table";
import { ProductsManager } from "@/components/admin/products-manager";
import { AreaChart, BarChart, DonutChart, type ChartPoint } from "@/components/admin/charts";
import { COUNTRIES, MONTHS } from "@/lib/constants";
import type { AdminUser, Product } from "@/types/database";

const PALETTE = ["#7C3AED", "#C026D3", "#FB923C", "#34D399", "#3B82F6", "#F43F5E", "#FACC15", "#22D3EE"];

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
}

function lastMonths(count: number) {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`,
      label: MONTHS[d.getMonth()].label.slice(0, 3),
    });
  }
  return result;
}

function CardShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface/50 p-5 ${className ?? ""}`}>
      <h3 className="font-heading text-sm font-semibold">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Overview({
  users,
  products,
}: {
  users: AdminUser[];
  products: Product[];
}) {
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const newUsers = users.filter((u) => now - new Date(u.created_at).getTime() < 30 * 24 * 3600 * 1000).length;
    const onboarded = users.filter((u) => u.onboarded).length;
    const avgScore = products.length
      ? Math.round(products.reduce((s, p) => s + p.score, 0) / products.length)
      : 0;

    const months = lastMonths(6);
    const signups: ChartPoint[] = months.map((m) => ({
      label: m.label,
      value: users.filter((u) => monthKey(u.created_at) === m.key).length,
    }));

    const byPays = new Map<string, number>();
    users.forEach((u) => {
      const label = COUNTRIES.find((c) => c.code === u.pays)?.label ?? u.pays ?? "Inconnu";
      byPays.set(label, (byPays.get(label) ?? 0) + 1);
    });
    const byPaysData: ChartPoint[] = [...byPays.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));

    const byNiveau = [
      { label: "Débutant", value: users.filter((u) => u.niveau === "debutant").length, color: PALETTE[0] },
      { label: "Confirmé", value: users.filter((u) => u.niveau === "pro").length, color: PALETTE[1] },
      { label: "Non renseigné", value: users.filter((u) => !u.niveau).length, color: PALETTE[2] },
    ].filter((d) => d.value > 0);

    const byCategorie = new Map<string, number>();
    products.forEach((p) => byCategorie.set(p.categorie, (byCategorie.get(p.categorie) ?? 0) + 1));
    const byCategorieData: ChartPoint[] = [...byCategorie.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));

    return { newUsers, onboarded, avgScore, signups, byPaysData, byNiveau, byCategorieData };
  }, [users, products, now]);

  const recent = users.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Utilisateurs" value={users.length} hint="Comptes créés" />
        <StatCard icon={TrendingUp} label="Nouveaux (30 j)" value={stats.newUsers} hint="Derniers 30 jours" accent="accent" />
        <StatCard icon={UserCheck} label="Onboardés" value={stats.onboarded} hint={users.length ? `${Math.round((stats.onboarded / users.length) * 100)}%` : "—"} accent="success" />
        <StatCard icon={Package} label="Produits" value={products.length} hint={`Score moyen ${stats.avgScore}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardShell
          title="Inscriptions"
          subtitle="6 derniers mois"
          className="lg:col-span-2"
        >
          <AreaChart data={stats.signups} />
          <div className="mt-2 flex justify-between px-1 text-xs text-muted-foreground">
            {stats.signups.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </CardShell>

        <CardShell title="Répartition par niveau" subtitle="Profil d'utilisateur">
          <DonutChart
            data={stats.byNiveau}
            centerLabel={String(users.length)}
            centerSub="utilisateurs"
          />
        </CardShell>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardShell title="Utilisateurs par pays" subtitle="Marchés principaux">
          <BarChart data={stats.byPaysData} />
        </CardShell>

        <CardShell title="Produits par catégorie" subtitle="Catalogue actuel">
          <BarChart data={stats.byCategorieData} color="#FB923C" endColor="#F43F5E" />
        </CardShell>
      </div>

      <CardShell title="Derniers inscrits" subtitle="Les 5 profils les plus récents">
        <div className="flex flex-col">
          {recent.map((u) => {
            const paysLabel = COUNTRIES.find((c) => c.code === u.pays)?.label ?? u.pays ?? "—";
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
              >
                <Avatar name={u.nom || u.prenoms || u.email} className="h-9 w-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {[u.prenoms, u.nom].filter(Boolean).join(" ") || u.email || "Sans nom"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {paysLabel}
                </Badge>
                {u.role === "admin" && <Badge variant="gradient">Admin</Badge>}
              </div>
            );
          })}
          {recent.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun utilisateur.</p>
          )}
        </div>
      </CardShell>
    </div>
  );
}

export function AdminDashboard({
  users,
  products,
  error,
  currentUserId,
}: {
  users: AdminUser[];
  products: Product[];
  error?: string | null;
  currentUserId: string;
}) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <PageHeader
        eyebrow="Administration"
        title="Pilotage"
        description="Vue d'ensemble de la plateforme : utilisateurs, inscriptions et catalogue."
      />

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-medium text-foreground">Données indisponibles</p>
            <p className="mt-1 text-muted-foreground">
              Impossible de charger les données. Si vous venez de configurer l&apos;espace admin,
              appliquez la migration{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/0006_admin_policies.sql
              </code>{" "}
              puis reconnectez-vous. ({error})
            </p>
          </div>
        </div>
      )}

      <ScrollReveal delay={0.1} className="mt-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Overview users={users} products={products} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTable users={users} currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManager products={products} />
          </TabsContent>
        </Tabs>
      </ScrollReveal>
    </div>
  );
}

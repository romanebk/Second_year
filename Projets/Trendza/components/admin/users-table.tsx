"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "@/components/shared/icons";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/avatar";
import { COUNTRIES, NIVEAUX, PLATEFORMES } from "@/lib/constants";
import type { AdminUser, Role } from "@/types/database";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({
  user,
  currentUserId,
  onRoleChange,
}: {
  user: AdminUser;
  currentUserId: string;
  onRoleChange: (userId: string, newRole: Role) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSelf = user.id === currentUserId;

  function handleChange(newRole: Role) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        onRoleChange(user.id, newRole);
        setEditing(false);
      }
    });
  }

  if (isSelf) {
    return <Badge variant="gradient">Admin</Badge>;
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
        title="Cliquer pour changer le rôle"
      >
        {user.role === "admin" ? (
          <Badge variant="gradient">Admin</Badge>
        ) : (
          <Badge variant="outline">Membre</Badge>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={isPending}
        onClick={() => handleChange("admin")}
        className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
          user.role === "admin"
            ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white"
            : "border-border-strong text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
      >
        Admin
      </button>
      <button
        disabled={isPending}
        onClick={() => handleChange("user")}
        className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
          user.role === "user"
            ? "border-border-strong bg-surface text-foreground"
            : "border-border-strong text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
      >
        Membre
      </button>
      <button
        disabled={isPending}
        onClick={() => setEditing(false)}
        className="cursor-pointer px-1 text-xs text-muted-foreground hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [localUsers, setLocalUsers] = useState(users);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localUsers;
    return localUsers.filter((u) =>
      [u.email, u.nom, u.prenoms, u.pays].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [localUsers, query]);

  function handleRoleChange(userId: string, newRole: Role) {
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface/50">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-base font-semibold">Utilisateurs</p>
          <p className="text-xs text-muted-foreground">
            {filtered.length} sur {localUsers.length}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un utilisateur…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Pays</th>
              <th className="px-4 py-3 font-medium">Niveau</th>
              <th className="px-4 py-3 font-medium">Plateforme</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const paysLabel = COUNTRIES.find((c) => c.code === u.pays)?.label ?? u.pays ?? "—";
              const niveauLabel = NIVEAUX.find((n) => n.value === u.niveau)?.label ?? "—";
              const plateformeLabel =
                PLATEFORMES.find((p) => p.value === u.plateforme)?.label ?? "—";
              return (
                <tr
                  key={u.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-hover/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.nom || u.prenoms || u.email} className="h-8 w-8 text-xs" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {[u.prenoms, u.nom].filter(Boolean).join(" ") || u.email || "Sans nom"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{paysLabel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{niveauLabel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{plateformeLabel}</td>
                  <td className="px-4 py-3">
                    <RoleBadge
                      user={u}
                      currentUserId={currentUserId}
                      onRoleChange={handleRoleChange}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {u.onboarded ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="accent">À compléter</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Aucun utilisateur ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

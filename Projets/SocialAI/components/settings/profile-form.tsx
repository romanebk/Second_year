"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Brussels",
  "Europe/Madrid",
  "America/New_York",
  "America/Los_Angeles",
  "Africa/Casablanca",
  "Asia/Dubai",
];

export function ProfileForm({
  email,
  initialName,
  initialTimezone,
}: {
  email: string;
  initialName: string;
  initialTimezone: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, timezone }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Impossible d'enregistrer.");
      return;
    }
    toast("Profil mis à jour.", "success");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>
          Ces informations sont utilisées dans ton espace SocialAI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={email} disabled />
            <p className="mt-1.5 text-xs text-muted-foreground">
              L’adresse e-mail ne peut pas être modifiée pour le moment.
            </p>
          </div>
          <div>
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {error && <FieldError>{error}</FieldError>}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

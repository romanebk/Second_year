"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Platform } from "@prisma/client";
import {
  CalendarClock,
  ImagePlus,
  Loader2,
  Save,
  Send,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea, Label, FieldError } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlatformIcon } from "@/components/platform-icon";
import { useToast } from "@/components/ui/toast";
import { PLATFORMS, PLATFORM_LIST } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ComposerAccount = {
  platform: Platform;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ComposerMedia = {
  url: string;
  type: "image" | "video";
  mimeType?: string;
  sizeBytes?: number;
};

export type ComposerInitial = {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledAt: string | null;
  media: ComposerMedia[];
  status: string;
};

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultSchedule() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toLocalInput(d);
}

export function PostComposer({
  accounts,
  initial,
}: {
  accounts: ComposerAccount[];
  initial?: ComposerInitial;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const availablePlatforms = accounts.map((a) => a.platform);

  const [content, setContent] = useState(initial?.content ?? "");
  const [selected, setSelected] = useState<Platform[]>(
    initial?.platforms ?? availablePlatforms.slice(0, 1),
  );
  const [media, setMedia] = useState<ComposerMedia[]>(initial?.media ?? []);
  const [scheduledAt, setScheduledAt] = useState<string>(
    initial?.scheduledAt
      ? toLocalInput(new Date(initial.scheduledAt))
      : defaultSchedule(),
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState<"draft" | "schedule" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const charLimit = useMemo(() => {
    if (selected.length === 0) return 2200;
    return Math.min(...selected.map((p) => PLATFORMS[p].maxChars));
  }, [selected]);

  const overLimit = content.length > charLimit;

  function togglePlatform(p: Platform) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error ?? "Échec de l'upload", "error");
          continue;
        }
        setMedia((prev) => [...prev, data as ComposerMedia]);
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function removeMedia(url: string) {
    setMedia((prev) => prev.filter((m) => m.url !== url));
  }

  async function submit(action: "draft" | "schedule") {
    setError(null);

    if (selected.length === 0) {
      setError("Sélectionne au moins une plateforme.");
      return;
    }
    if (content.trim().length === 0 && media.length === 0) {
      setError("Ajoute du texte ou un média.");
      return;
    }
    if (action === "schedule" && !scheduledAt) {
      setError("Choisis une date de publication.");
      return;
    }
    if (overLimit) {
      setError(`Le texte dépasse la limite de ${charLimit} caractères.`);
      return;
    }

    const payload = {
      content,
      platforms: selected,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      media,
      action,
    };

    setSubmitting(action);
    const url = initial ? `/api/posts/${initial.id}` : "/api/posts";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    toast(
      action === "draft" ? "Brouillon enregistré." : "Publication programmée !",
      "success",
    );
    router.push("/posts");
    router.refresh();
  }

  const previewPlatform = selected[0] ?? availablePlatforms[0];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Editor */}
      <div className="space-y-6 lg:col-span-3">
        <Card className="p-5 sm:p-6">
          <Label htmlFor="content">Contenu du post</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Quoi de neuf ? Écris ta légende ici…"
            className="min-h-[160px]"
          />
          <div className="mt-2 flex justify-end">
            <span
              className={cn(
                "text-xs tabular-nums",
                overLimit ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {content.length} / {charLimit}
            </span>
          </div>

          {/* Media */}
          <div className="mt-4">
            <Label>Médias</Label>
            <div className="flex flex-wrap gap-3">
              {media.map((m) => (
                <div
                  key={m.url}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted"
                >
                  {m.type === "video" ? (
                    <>
                      <video
                        src={m.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                      <span className="absolute bottom-1 left-1 rounded bg-foreground/70 p-1 text-white">
                        <Video className="h-3 w-3" />
                      </span>
                    </>
                  ) : (
                    <Image
                      src={m.url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(m.url)}
                    className="absolute right-1 top-1 rounded-full bg-foreground/70 p-1 text-white hover:bg-foreground"
                    aria-label="Retirer le média"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                <span className="text-xs">Ajouter</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>
          </div>
        </Card>

        {/* Platforms */}
        <Card className="p-5 sm:p-6">
          <Label>Plateformes cibles</Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_LIST.map((p) => {
              const connected = availablePlatforms.includes(p.id);
              const isSelected = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={!connected}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                    !connected && "cursor-not-allowed opacity-50",
                  )}
                  title={connected ? undefined : "Compte non connecté"}
                >
                  <PlatformIcon platform={p.id} className="h-4 w-4" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-5 sm:p-6">
          <Label htmlFor="schedule">Date et heure de publication</Label>
          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="schedule"
              type="datetime-local"
              value={scheduledAt}
              min={toLocalInput(new Date())}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Laisse tel quel pour enregistrer un brouillon, ou programme la
            publication à l’heure choisie.
          </p>
        </Card>

        {error && <FieldError>{error}</FieldError>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="sm:flex-1"
            loading={submitting === "draft"}
            disabled={submitting !== null}
            onClick={() => submit("draft")}
          >
            <Save className="h-4 w-4" />
            Enregistrer le brouillon
          </Button>
          <Button
            size="lg"
            className="sm:flex-1"
            loading={submitting === "schedule"}
            disabled={submitting !== null}
            onClick={() => submit("schedule")}
          >
            <Send className="h-4 w-4" />
            {initial ? "Mettre à jour" : "Programmer"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-24">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Aperçu
          </p>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{
                  backgroundColor: previewPlatform
                    ? PLATFORMS[previewPlatform].color
                    : "hsl(var(--muted))",
                }}
              >
                {previewPlatform && (
                  <PlatformIcon platform={previewPlatform} className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {accounts.find((a) => a.platform === previewPlatform)
                    ?.displayName ?? "Ton compte"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @
                  {accounts.find((a) => a.platform === previewPlatform)?.handle ??
                    "handle"}
                </p>
              </div>
            </div>

            {media[0] && (
              <div className="relative aspect-square w-full bg-muted">
                {media[0].type === "video" ? (
                  <video
                    src={media[0].url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={media[0].url}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                )}
              </div>
            )}

            <div className="p-4">
              <p className="whitespace-pre-wrap break-words text-sm">
                {content || (
                  <span className="italic text-muted-foreground">
                    Ton texte apparaîtra ici…
                  </span>
                )}
              </p>
              {selected.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                  {selected.map((p) => (
                    <PlatformIcon key={p} platform={p} className="h-4 w-4" />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

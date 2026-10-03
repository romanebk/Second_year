"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PostStatus } from "@prisma/client";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function PostActions({
  postId,
  status,
}: {
  postId: string;
  status: PostStatus;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const canPublishNow = status === "SCHEDULED" || status === "FAILED";

  async function publishNow() {
    setBusy(true);
    const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
    setBusy(false);
    setOpen(false);
    if (res.ok) {
      toast("Publication lancée.", "success");
      router.refresh();
    } else {
      toast("Impossible de publier ce post.", "error");
    }
  }

  async function remove() {
    if (!confirm("Supprimer définitivement ce post ?")) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setBusy(false);
    setOpen(false);
    if (res.ok) {
      toast("Post supprimé.", "success");
      router.refresh();
    } else {
      toast("Suppression impossible.", "error");
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-border bg-popover p-1.5 shadow-pop animate-scale-in"
        >
          <Link
            href={`/posts/${postId}`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
          {canPublishNow && (
            <button
              onClick={publishNow}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted",
              )}
            >
              <Send className="h-4 w-4" />
              Publier maintenant
            </button>
          )}
          <button
            onClick={remove}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

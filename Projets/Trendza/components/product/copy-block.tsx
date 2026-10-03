"use client";

import { useState } from "react";
import { Check, Copy } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyBlock({
  label,
  content,
  className,
}: {
  label: string;
  content: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-surface/60 p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {content}
      </p>
    </div>
  );
}

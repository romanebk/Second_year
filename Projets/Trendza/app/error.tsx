"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "@/components/shared/icons";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo className="h-14 w-14" />
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Une erreur est survenue</h1>
        <p className="max-w-md text-muted-foreground">
          Quelque chose s&apos;est mal passé de notre côté. Réessayez, ou revenez à l&apos;accueil.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="gradient" size="lg" onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" />
          Réessayer
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}

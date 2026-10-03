import Link from "next/link";
import { Compass } from "@/components/shared/icons";

import { Logo } from "@/components/shared/logo";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo className="h-14 w-14" />
      <div>
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          4<GradientText animate>0</GradientText>4
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Button variant="gradient" size="lg" asChild>
        <Link href="/">
          <Compass className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </Button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { PlatformIcon } from "@/components/platform-icon";
import { PLATFORM_LIST } from "@/lib/constants";

const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export function HomeHero() {
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
      <Card className="dark relative overflow-hidden border-border/50 bg-background p-0 shadow-pop">
        <Spotlight size={340} />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center gap-6 px-6 py-12 sm:px-10 sm:py-16 lg:py-20">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
              Pensé pour les créateurs de contenu
            </span>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-balance text-foreground sm:text-5xl">
              Toute ta présence sociale,{" "}
              <span className="text-primary">pilotée depuis un seul endroit</span>.
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              SocialAI centralise la planification de tes publications Instagram,
              Facebook et TikTok. Programme, organise et publie sans jongler entre
              dix applications.
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  J’ai déjà un compte
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-6 text-muted-foreground">
              {PLATFORM_LIST.map((p) => (
                <span key={p.id} className="flex items-center gap-2 text-sm font-medium">
                  <PlatformIcon platform={p.id} className="h-5 w-5" />
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* 3D scene */}
          <div className="relative h-[320px] lg:h-auto lg:min-h-[560px]">
            <SplineScene scene={SPLINE_SCENE_URL} className="h-full w-full" />
          </div>
        </div>
      </Card>
    </section>
  );
}

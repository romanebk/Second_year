"use client";

import type { SocialAccount } from "@prisma/client";
import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlatformIcon } from "@/components/platform-icon";
import { useToast } from "@/components/ui/toast";
import { PLATFORM_LIST, PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ConnectAccounts({ accounts }: { accounts: SocialAccount[] }) {
  const { toast } = useToast();
  const connected = new Map(accounts.map((a) => [a.platform, a]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comptes sociaux</CardTitle>
        <CardDescription>
          Connecte tes réseaux pour publier directement depuis SocialAI.
          L’intégration réelle (Meta, TikTok) arrive bientôt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {PLATFORM_LIST.map((platform) => {
          const account = connected.get(platform.id);
          const isConnected = account?.status === "CONNECTED";
          return (
            <div
              key={platform.id}
              className="flex items-center gap-4 rounded-lg border border-border p-4"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: platform.color }}
              >
                <PlatformIcon platform={platform.id} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{platform.label}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {isConnected
                    ? `Connecté · @${account!.handle}`
                    : "Non connecté"}
                </p>
              </div>
              {isConnected ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success",
                  )}
                >
                  <Check className="h-4 w-4" />
                  Connecté
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast(
                      `La connexion ${platform.label} sera disponible prochainement.`,
                      "info",
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                  Connecter {platform.label}
                </Button>
              )}
            </div>
          );
        })}
        <p className="pt-1 text-xs text-muted-foreground">
          Les comptes affichés sont des connexions simulées pour ce MVP.
        </p>
      </CardContent>
    </Card>
  );
}

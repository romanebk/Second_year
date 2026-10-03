import type { SocialAccount } from "@prisma/client";
import { PlatformIcon } from "@/components/platform-icon";
import { Card } from "@/components/ui/card";
import { PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function SocialAccountCard({ account }: { account: SocialAccount }) {
  const meta = PLATFORMS[account.platform];
  const connected = account.status === "CONNECTED";

  return (
    <Card className="flex items-center gap-4 p-4">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: meta.color }}
      >
        <PlatformIcon platform={account.platform} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {account.displayName ?? meta.label}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          @{account.handle}
        </p>
      </div>
      <div className="text-right">
        <p className="font-heading text-sm font-semibold">
          {formatFollowers(account.followers)}
        </p>
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 text-xs font-medium",
            connected ? "text-success" : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              connected ? "bg-success" : "bg-muted-foreground",
            )}
          />
          {connected ? "Connecté" : "Déconnecté"}
        </span>
      </div>
    </Card>
  );
}

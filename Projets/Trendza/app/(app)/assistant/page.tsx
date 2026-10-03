import { ChatWindow } from "@/components/chat/chat-window";
import { FaIcon } from "@/components/shared/fa-icon";
import { PageHeader } from "@/components/shared/page-header";
import { requireSubscription } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  // Fonctionnalité premium : l'assistant délivre les mêmes recommandations
  // que le tableau de bord, il doit être protégé au même niveau.
  await requireSubscription("/assistant");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        eyebrow="Assistant IA"
        title="Posez votre question"
        description="Recommandations, tendances, concurrence, rentabilité : l'assistant répond à partir des données analysées par Trendza."
      />

      <div className="mt-8">
        <ChatWindow listMaxHeight={520} className="shadow-2xl shadow-black/30" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: "faMagnifyingGlassChart", title: "Tendances", text: "« Quel produit sera tendance cet hiver ? »" },
          { icon: "faScaleBalanced", title: "Concurrence", text: "« Que puis-je vendre avec peu de concurrence ? »" },
          { icon: "faCoins", title: "Rentabilité", text: "« Quel produit est le plus rentable actuellement ? »" },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-surface/40 p-4">
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-end text-white">
              <FaIcon name={c.icon} className="h-4 w-4" />
            </span>
            <p className="font-heading text-sm font-semibold">{c.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

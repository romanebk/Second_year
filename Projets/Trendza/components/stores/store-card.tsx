import { Store as StoreIcon, Trash2 } from "@/components/shared/icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES, PLATEFORMES } from "@/lib/constants";
import type { Store } from "@/types/database";

export function StoreCard({
  store,
  onDelete,
  deleting,
}: {
  store: Store;
  onDelete: (id: string) => void;
  deleting?: boolean;
}) {
  const paysLabel = COUNTRIES.find((c) => c.code === store.pays)?.label ?? store.pays;
  const plateformeLabel =
    PLATEFORMES.find((p) => p.value === store.plateforme)?.label ?? store.plateforme;

  return (
    <Card className="flex items-start justify-between gap-4 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary-end/20 text-primary">
          <StoreIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-heading font-semibold">{store.nom}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant="outline">{plateformeLabel}</Badge>
            <Badge variant="outline">{paysLabel}</Badge>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Supprimer la boutique"
        disabled={deleting}
        onClick={() => onDelete(store.id)}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}

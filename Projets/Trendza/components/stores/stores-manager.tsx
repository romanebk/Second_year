"use client";

import { useState } from "react";
import { Store as StoreIcon } from "@/components/shared/icons";
import { motion } from "motion/react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StoreCard } from "@/components/stores/store-card";
import { StoreFormDialog } from "@/components/stores/store-form-dialog";
import { createClient } from "@/lib/supabase/client";
import { deleteStore } from "@/lib/data/stores";
import type { Store } from "@/types/database";

export function StoresManager({
  initialStores,
  userId,
}: {
  initialStores: Store[];
  userId: string;
}) {
  const [stores, setStores] = useState(initialStores);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await deleteStore(supabase, id);
    setDeletingId(null);

    if (error) {
      toast.error("Impossible de supprimer la boutique.");
      return;
    }

    setStores((prev) => prev.filter((s) => s.id !== id));
    toast.success("Boutique supprimée");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vendre"
        title="Mes boutiques"
        description="Enregistrez vos boutiques pour personnaliser vos recommandations."
      >
        <div className="flex items-center gap-2">
          <StoreFormDialog
            userId={userId}
            onCreated={(store) => setStores((prev) => [store, ...prev])}
          />
        </div>
      </PageHeader>

      {stores.length === 0 ? (
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface/30 px-6 py-24 text-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-end/15 blur-3xl" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary-end/25 text-primary">
            <StoreIcon className="h-8 w-8" />
          </div>
          <p className="mt-6 font-heading text-xl font-semibold">Aucune boutique enregistrée</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Ajoutez votre boutique pour que Trendza adapte ses recommandations à votre plateforme
            et votre pays.
          </p>
          <div className="mt-6 flex justify-center">
            <StoreFormDialog
              userId={userId}
              onCreated={(store) => setStores((prev) => [store, ...prev])}
            />
          </div>
        </div>
      ) : (
        <motion.div
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {stores.map((store) => (
            <motion.div
              key={store.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
              }}
            >
              <StoreCard
                store={store}
                onDelete={handleDelete}
                deleting={deletingId === store.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

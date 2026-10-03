"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createStore } from "@/lib/data/stores";
import { COUNTRIES, PLATEFORMES, type Plateforme } from "@/lib/constants";
import type { Store } from "@/types/database";

export function StoreFormDialog({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: (store: Store) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [plateforme, setPlateforme] = useState<string>("");
  const [pays, setPays] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nom || !plateforme || !pays) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await createStore(supabase, {
      user_id: userId,
      nom,
      plateforme: plateforme as Plateforme,
      pays,
    });

    setLoading(false);

    if (error || !data) {
      setError("Impossible d'enregistrer la boutique. Réessayez.");
      return;
    }

    toast.success("Boutique ajoutée");
    onCreated(data);
    setOpen(false);
    setNom("");
    setPlateforme("");
    setPays("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient">
          <Plus className="h-4 w-4" />
          Ajouter une boutique
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle boutique</DialogTitle>
          <DialogDescription>
            Enregistrez votre boutique pour personnaliser vos recommandations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="store-nom">Nom de la boutique</Label>
            <Input
              id="store-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : Ma Boutique Tendance"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="store-plateforme">Plateforme</Label>
            <Select value={plateforme} onValueChange={setPlateforme}>
              <SelectTrigger id="store-plateforme">
                <SelectValue placeholder="Choisir une plateforme" />
              </SelectTrigger>
              <SelectContent>
                {PLATEFORMES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="store-pays">Pays</Label>
            <Select value={pays} onValueChange={setPays}>
              <SelectTrigger id="store-pays">
                <SelectValue placeholder="Choisir un pays" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

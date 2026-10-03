import { StoresManager } from "@/components/stores/stores-manager";
import { createClient } from "@/lib/supabase/server";
import { getStores } from "@/lib/data/stores";

export default async function BoutiquesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const stores = await getStores(supabase, user.id);

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <StoresManager initialStores={stores} userId={user.id} />
    </div>
  );
}

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminUsers, getAllProducts } from "@/lib/data/admin";

export default async function AdminPage() {
  const { supabase, user } = await requireAdmin();

  const [usersRes, productsRes] = await Promise.all([
    getAdminUsers(supabase),
    getAllProducts(supabase),
  ]);

  return (
    <AdminDashboard
      users={usersRes.users}
      products={productsRes.products}
      error={usersRes.error ?? productsRes.error}
      currentUserId={user.id}
    />
  );
}

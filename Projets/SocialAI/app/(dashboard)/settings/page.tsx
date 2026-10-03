import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/lib/auth";
import { getSocialAccounts, getUser } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { ConnectAccounts } from "@/components/settings/connect-accounts";

export const metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [user, accounts] = await Promise.all([
    getUser(userId),
    getSocialAccounts(userId),
  ]);

  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Gère ton profil et tes comptes sociaux."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm
          email={user.email}
          initialName={user.name ?? ""}
          initialTimezone={user.timezone}
        />
        <ConnectAccounts accounts={accounts} />
      </div>
    </div>
  );
}

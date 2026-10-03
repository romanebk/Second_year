import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/app-shell/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session.user} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 xl:px-16">
        {children}
      </main>
    </div>
  );
}

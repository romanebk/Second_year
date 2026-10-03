import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar isLoggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

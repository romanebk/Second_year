import { Hero10Example } from "@/components/ui/hero-10-demo";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Stats } from "@/components/marketing/testimonials";
import { CtaSection } from "@/components/marketing/cta-section";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Hero10Example isLoggedIn={!!user} />
      <HowItWorks />
      <DashboardPreview />
      <Stats />
      <CtaSection />
    </>
  );
}

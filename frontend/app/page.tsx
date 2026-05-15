import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { HeroSection } from "@/sections/hero";
import { FeaturesSection } from "@/sections/features";
import { WorkflowSection } from "@/sections/workflow";
import { AnalyticsSection } from "@/sections/analytics";
import { SecuritySection } from "@/sections/security";
import { PricingSection } from "@/sections/pricing";
import { CtaSection } from "@/sections/cta";

export default function LandingPage() {
  return (
    <div className="grid-bg min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <AnalyticsSection />
        <SecuritySection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

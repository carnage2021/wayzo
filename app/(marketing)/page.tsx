import { Faq, FAQS } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Groups } from "@/components/marketing/groups";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { LandingEffects } from "@/components/marketing/landing-effects";
import { Problem } from "@/components/marketing/problem";
import { ScrollBand } from "@/components/marketing/scroll-band";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { SplashIntro } from "@/components/marketing/splash-intro";
import { Trust } from "@/components/marketing/trust";
import { Waitlist } from "@/components/marketing/waitlist";
import { WhatsAppSoon } from "@/components/marketing/whatsapp-soon";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Wayzo",
      applicationCategory: "TravelApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "AI trip dashboard for group travel. Upload your tickets. We'll run the trip.",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SplashIntro />
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <ScrollBand />
        <HowItWorks />
        <Features />
        <Groups />
        <Trust />
        <WhatsAppSoon />
        <Faq />
        <Waitlist />
      </main>
      <SiteFooter />
      <LandingEffects />
    </>
  );
}

import { Automations } from '@/components/marketing/Automations';
import { CTA } from '@/components/marketing/CTA';
import { FAQ } from '@/components/marketing/FAQ';
import { Features } from '@/components/marketing/Features';
import { Footer } from '@/components/marketing/Footer';
import { Hero } from '@/components/marketing/Hero';
import { Insights } from '@/components/marketing/Insights';
import { Integrations } from '@/components/marketing/Integrations';
import { Pricing } from '@/components/marketing/Pricing';
import { Testimonials } from '@/components/marketing/Testimonials';
import { WhyChoose } from '@/components/marketing/WhyChoose';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-100 h-100 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <Integrations />
        <Insights />
        <Automations />
        <Pricing />
        <Testimonials />
        <FAQ />
        <WhyChoose />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}

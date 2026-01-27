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
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 relative overflow-hidden">
      {/* Cloudy sky background */}
      <div className="absolute inset-0">
        {/* Base sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900" />
        
        {/* Cloud layers */}
        <div className="absolute inset-0">
          {/* Large clouds */}
          <div className="absolute top-10 left-10 w-64 h-32 bg-white/30 dark:bg-white/10 rounded-full blur-sm opacity-60" />
          <div className="absolute top-20 right-20 w-80 h-40 bg-white/25 dark:bg-white/8 rounded-full blur-md opacity-50" />
          <div className="absolute top-32 left-1/3 w-72 h-36 bg-white/20 dark:bg-white/6 rounded-full blur-sm opacity-40" />
          
          {/* Medium clouds */}
          <div className="absolute top-40 right-1/4 w-48 h-24 bg-white/35 dark:bg-white/12 rounded-full blur-sm opacity-55" />
          <div className="absolute top-60 left-1/4 w-56 h-28 bg-white/30 dark:bg-white/10 rounded-full blur-md opacity-45" />
          <div className="absolute top-80 right-1/3 w-64 h-32 bg-white/25 dark:bg-white/8 rounded-full blur-sm opacity-50" />
          
          {/* Small clouds */}
          <div className="absolute top-16 left-1/2 w-32 h-16 bg-white/40 dark:bg-white/15 rounded-full blur-sm opacity-60" />
          <div className="absolute top-48 right-10 w-40 h-20 bg-white/30 dark:bg-white/10 rounded-full blur-sm opacity-50" />
          <div className="absolute top-72 left-10 w-36 h-18 bg-white/35 dark:bg-white/12 rounded-full blur-sm opacity-55" />
          
          {/* Distant clouds */}
          <div className="absolute top-24 right-1/2 w-96 h-48 bg-white/15 dark:bg-white/5 rounded-full blur-lg opacity-30" />
          <div className="absolute top-64 left-1/2 w-80 h-40 bg-white/20 dark:bg-white/6 rounded-full blur-lg opacity-25" />
        </div>
        
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 dark:via-white/2 to-white/10 dark:to-white/5" />
      </div>
      
      {/* Content with relative positioning */}
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
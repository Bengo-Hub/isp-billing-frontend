'use client';

import { Button } from '@/components/ui/button';
import { startSSOSignup } from '@/lib/auth/sso';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

/** The single pay-as-you-grow plan (base KES 500/mo + 3% of hotspot revenue
 *  above KES 10k + KES 35 per active PPPoE subscriber/mo). Covers hotspot AND
 *  PPPoE, no feature limits. Subscription tiers are now owned by
 *  subscriptions-api, so this marketing card is rendered statically — no API. */
const fallbackPlans = [
  {
    name: 'ISP Billing',
    tag: 'Pay as you grow',
    price: 'KSh 500/mo + 3% above 10K',
    description: 'Hotspot + PPPoE — no feature limits',
    features: [
      'Unlimited MikroTik routers & users',
      '3% of hotspot revenue (only above KSh 10,000/mo)',
      'KSh 35 per active PPPoE subscriber/mo',
      'Automated provisioning + M-Pesa/Paystack billing',
      'Voucher system & captive portal',
      'Real-time dashboard & analytics',
    ],
    popular: true,
    trial_days: 14,
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const plans = useMemo(
    () =>
      fallbackPlans.map((p) => ({
        ...p,
        buttonVariant: p.popular ? ('default' as const) : ('outline' as const),
        color: p.popular ? 'from-brand-700 to-brand-900' : 'from-gray-400 to-brand-700',
      })),
    [],
  );

  const trialDays = fallbackPlans[0]?.trial_days ?? 7;

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="text-center mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Transparent Pricing, No Surprises
          </motion.div>
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Flexible Plans for All
          </motion.h2>
          <motion.p
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Our plans are scalable and will grow with you. Monthly and annual plans.
          </motion.p>

          {/* Animated Toggle */}
          <motion.div
            className="inline-flex bg-card border border-border rounded-lg p-1 mb-8 md:mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              onClick={() => setIsAnnual(false)}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                !isAnnual ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setIsAnnual(true)}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isAnnual ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Annually
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Pricing cards */}
        <div className={`grid grid-cols-1 ${plans.length <= 2 ? 'lg:grid-cols-2 max-w-5xl' : 'lg:grid-cols-3 max-w-7xl'} gap-6 md:gap-8 mx-auto mb-8`}>
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-card rounded-lg p-6 md:p-8 shadow-lg relative overflow-hidden group ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 1 + index * 0.2 }}
              whileHover={{
                y: -10,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                scale: 1.02,
              }}
            >
              {/* Background gradient on hover */}
              <motion.div
                className={`absolute inset-0 bg-linear-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {plan.tag && (
                <motion.div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                >
                  <motion.span
                    className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {plan.tag}
                  </motion.span>
                </motion.div>
              )}

              <div className="text-center mb-6 relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <motion.div
                  className="text-2xl md:text-3xl font-bold text-foreground"
                  key={plan.price}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {plan.price}
                </motion.div>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 relative z-10">
                {plan.features.map((feature, fi) => (
                  <motion.li
                    key={fi}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 1.4 + fi * 0.1 }}
                  >
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                    <span className="text-sm md:text-base text-muted-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="block relative z-10">
                <Button
                  onClick={() => { void startSSOSignup(); }}
                  variant={plan.buttonVariant}
                  className={`w-full h-10 md:h-12 text-base md:text-lg ${
                    plan.buttonVariant === 'default'
                      ? 'bg-primary hover:bg-brand-800 text-white'
                      : 'border-primary text-primary hover:bg-primary/10'
                  }`}
                >
                  Get Started - Free
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center text-muted-foreground"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <p className="text-sm md:text-base">
            We offer {trialDays}-day free trial and dedicated support for all new ISP accounts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

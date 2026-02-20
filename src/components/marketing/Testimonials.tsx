'use client';

import { Router, CreditCard, Users, Wifi, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const highlights = [
    {
      icon: Router,
      title: 'Automated MikroTik Provisioning',
      description: 'One-command bootstrap sets up your router with API access, user groups, and system configuration. Supports both RouterOS v6 and v7.',
      color: 'from-brand-700 to-brand-900'
    },
    {
      icon: CreditCard,
      title: 'M-Pesa STK Push Billing',
      description: 'Automated billing with M-Pesa STK Push and Paystack. Customers pay directly from their phone with instant account activation.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Wifi,
      title: 'Hotspot & PPPoE Management',
      description: 'Full captive portal setup with voucher system, or PPPoE server provisioning with per-user bandwidth management.',
      color: 'from-gray-400 to-brand-700'
    },
    {
      icon: Users,
      title: 'Multi-Tenant Organization',
      description: 'Each ISP gets their own isolated workspace with staff users, roles, routers, customers, and billing — all on one platform.',
      color: 'from-brand-700 to-gray-400'
    },
    {
      icon: Shield,
      title: 'Secure by Design',
      description: 'TOTP-based two-factor authentication, role-based access control with granular permissions, and encrypted credential storage.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Real-Time Dashboard',
      description: 'Monitor revenue, active subscriptions, router status, and customer activity from a single dashboard with live updates.',
      color: 'from-brand-900 to-brand-700'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted">
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
            Platform Highlights
          </motion.div>
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Built for East African ISPs
          </motion.h2>
          <motion.p
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Purpose-built features for ISPs running MikroTik networks with M-Pesa billing.
          </motion.p>
        </motion.div>

        {/* Feature highlights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                scale: 1.02
              }}
            >
              {/* Icon */}
              <motion.div
                className={`w-12 h-12 bg-gradient-to-br ${highlight.color} rounded-lg flex items-center justify-center mb-4`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <highlight.icon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h3
                className="font-bold text-foreground mb-2 text-base md:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.15 }}
              >
                {highlight.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                className="text-muted-foreground text-sm md:text-base leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
              >
                {highlight.description}
              </motion.p>

              {/* Hover effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-brand-700/5 to-gray-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
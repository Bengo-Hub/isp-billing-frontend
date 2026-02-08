'use client';

import { CheckCircle, Router, Wifi, CreditCard, Settings, Package, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function Automations() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const automations = [
    {
      icon: Router,
      title: 'PPPoE Integration',
      description: 'Seamless integration with PPPoE protocols for easy user management',
      color: 'from-brand-700 to-brand-900'
    },
    {
      icon: Wifi,
      title: 'HotSpot Management',
      description: 'Complete hotspot management with user authentication and billing',
      color: 'from-gray-400 to-brand-700'
    },
    {
      icon: CreditCard,
      title: 'Automated Billing',
      description: 'Automated billing cycles with multiple payment gateway support',
      color: 'from-brand-700 to-gray-400'
    },
    {
      icon: Router,
      title: 'Remote Mikrotik',
      description: 'Remote management of Mikrotik routers with real-time monitoring',
      color: 'from-brand-900 to-brand-700'
    },
    {
      icon: Package,
      title: 'Package Management',
      description: 'Create and manage service packages with flexible pricing',
      color: 'from-gray-400 to-brand-900'
    },
    {
      icon: User,
      title: 'Customer Portal',
      description: 'Self-service customer portal for account management',
      color: 'from-brand-700 to-gray-400'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-card">
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
            Save more and Earn
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Time-saving Automations
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Simplify the management of your ISP business.
          </motion.p>
        </motion.div>
        
        {/* Automation cards with staggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-8 md:mb-12">
          {automations.map((automation, index) => (
            <motion.div 
              key={index}
              className="bg-card rounded-lg p-4 md:p-6 shadow-lg border border-border relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                scale: 1.02
              }}
            >
              {/* Animated background gradient */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${automation.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.05 }}
              />
              
              <motion.div 
                className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${automation.color} rounded-lg flex items-center justify-center mb-4 relative z-10`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <automation.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </motion.div>
              
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 relative z-10">
                {automation.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground relative z-10">
                {automation.description}
              </p>
              
              {/* Hover effect overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Feature list with animations */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {[
            'Free Mikrotik Support',
            'Reliable API',
            'Available 24/7'
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </motion.div>
              <span className="text-sm md:text-base text-muted-foreground font-medium">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const plans = [
    {
      name: 'Proportional Plan',
      tag: 'Popular',
      price: isAnnual ? '3% of total balance' : '3% of total balance',
      description: 'Perfect for growing ISPs',
      features: [
        'Unlimited Customers',
        'Remote Mikrotik management',
        'Automated billing',
        'Real-time reports',
        '24/7 support',
        'API access'
      ],
      buttonText: 'Get Started - Free',
      buttonVariant: 'default' as const,
      popular: true,
      color: 'from-[#801066] to-[#6d0d57]'
    },
    {
      name: 'PPPoE Plan',
      tag: null,
      price: isAnnual ? 'KSh 20 / user / month' : 'KSh 25 / user / month',
      description: 'Ideal for established ISPs',
      features: [
        'Unlimited Mikrotik',
        'Automated billing',
        'Customer portal',
        'Payment gateways',
        'SMS notifications',
        'Advanced analytics'
      ],
      buttonText: 'Get Started - Free',
      buttonVariant: 'outline' as const,
      popular: false,
      color: 'from-[#acacb3] to-[#801066]'
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          className="text-center mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-[#801066]/10 dark:bg-[#801066]/20 text-[#801066] dark:text-[#801066] px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="w-2 h-2 bg-[#801066] rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Transparent Pricing, No Surprises
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Flexible Plans for All
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Our plans are scalable and will grow with you. Monthly and annual plans.
          </motion.p>
          
          {/* Animated Toggle */}
          <motion.div 
            className="inline-flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-8 md:mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              onClick={() => setIsAnnual(false)}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                !isAnnual ? 'bg-[#801066] text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setIsAnnual(true)}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isAnnual ? 'bg-[#801066] text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Annually
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Pricing cards with animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-lg relative overflow-hidden group ${
                plan.popular ? 'ring-2 ring-[#801066]' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 1 + index * 0.2 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                scale: 1.02
              }}
            >
              {/* Animated background gradient */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.05 }}
              />
              
              {plan.popular && (
                <motion.div 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                >
                  <motion.span 
                    className="bg-[#801066] text-white px-4 py-1 rounded-full text-sm font-medium"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {plan.tag}
                  </motion.span>
                </motion.div>
              )}
              
              <div className="text-center mb-6 relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
                <motion.div 
                  className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                  key={plan.price}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {plan.price}
                </motion.div>
              </div>
              
              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 relative z-10">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 1.4 + featureIndex * 0.1 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: featureIndex * 0.5 }}
                    >
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#801066] dark:text-[#801066] flex-shrink-0" />
                    </motion.div>
                    <span className="text-sm md:text-base text-gray-700 dark:text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Link href="/signup" className="block relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={plan.buttonVariant}
                    className={`w-full h-10 md:h-12 text-base md:text-lg ${
                      plan.buttonVariant === 'default'
                        ? 'bg-[#801066] hover:bg-[#6d0d57] text-white'
                        : 'border-[#801066] text-[#801066] hover:bg-[#801066]/10 dark:border-[#801066] dark:text-[#801066] dark:hover:bg-[#801066]/10'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <p className="text-sm md:text-base">We offer 7-day free trial and dedicated support for all new ISP accounts.</p>
        </motion.div>
      </div>
    </section>
  );
}
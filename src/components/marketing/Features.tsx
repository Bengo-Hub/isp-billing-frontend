'use client';

import { CheckCircle, Shield, Zap, Users, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee',
      color: 'from-[#801066] to-[#6d0d57]'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for thousands of concurrent users',
      color: 'from-[#acacb3] to-[#801066]'
    },
    {
      icon: Users,
      title: 'Scalable',
      description: 'Grows with your business from startup to enterprise',
      color: 'from-[#801066] to-[#acacb3]'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Comprehensive insights and reporting for data-driven decisions',
      color: 'from-[#6d0d57] to-[#801066]'
    },
    {
      icon: Settings,
      title: 'Customizable',
      description: 'Flexible configuration to match your business needs',
      color: 'from-[#acacb3] to-[#6d0d57]'
    }
  ];

  return (
    <section id="features" className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          className="text-center mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything You Need to Run Your ISP
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From customer management to automated billing, we provide all the tools 
            you need to grow your internet service provider business.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="text-center p-4 md:p-6 group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <motion.div 
                className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 360,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </motion.div>
              <motion.h3 
                className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                {feature.title}
              </motion.h3>
              <motion.p 
                className="text-sm md:text-base text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
        
        {/* Feature highlights with animations */}
        <motion.div 
          className="mt-12 md:mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 md:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              'Easy Captcha Profiles',
              'Remote Mikrotik Management',
              'Automated Payments',
              'Real-Time Reports',
              'Many More'
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#801066] dark:text-[#801066]" />
                </motion.div>
                <span className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
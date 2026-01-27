'use client';

import { CheckCircle } from 'lucide-react';
import { ActiveUsersChart, RevenueChart } from './Illustrations';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function Insights() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800">
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
            Time-saving Insights
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Comprehensive Insights
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Reports built for data-driven ISPs that want to make smart decisions to grow their business.
          </motion.p>
        </motion.div>
        
        {/* Insight cards with staggered animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto mb-8 md:mb-12">
          <motion.div 
            className="bg-white dark:bg-gray-900 rounded-lg p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Active Users</h3>
              <motion.span 
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Live
              </motion.span>
            </div>
            <div className="mb-6">
              <ActiveUsersChart />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Monitor ISP performance in real-time. Track payment processing, customer churning, 
              and compliance with a fully-featured ISP billing system to effectively assess and 
              identify revenue opportunities.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-900 rounded-lg p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 1 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Revenue Today</h3>
              <motion.span 
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Today
              </motion.span>
            </div>
            <div className="mb-6">
              <RevenueChart />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Leverage CodeVertex ISP billing system's analytics to optimize revenue, improve 
              customer experience, and make data-driven decisions on pricing and service packages.
            </p>
          </motion.div>
        </div>
        
        {/* Feature list with animations */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
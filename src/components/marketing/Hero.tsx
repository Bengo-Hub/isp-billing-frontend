'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export function Hero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-[#801066]/10 dark:bg-[#801066]/5 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-96 h-96 bg-[#acacb3]/10 dark:bg-[#acacb3]/5 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#801066]/5 dark:bg-[#801066]/3 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-7xl">
          {/* Main heading */}
          <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-8 md:mb-12"
          >
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              CodeVertex ISP Billing System
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect. Earn. Expand.
            </motion.p>
            <motion.p 
              className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              CodeVertex helps local ISPs grow their business by automating the manual stuff, 
              so they can focus on what matters most: customer support and satisfaction.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-[#801066] hover:bg-[#6d0d57] text-white text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto shadow-lg">
                    Get Started - Free
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="#demo">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="text-[#801066] border-[#801066] hover:bg-[#801066]/10 dark:text-[#801066] dark:border-[#801066] dark:hover:bg-[#801066]/10 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto shadow-lg">
                    <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    View Demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Vivid Dashboard Screenshot */}
          <motion.div 
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <motion.div 
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Browser header */}
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                  app.codevertexitsolutions.com
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">CodeVertex ISP Billing System</h2>
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Live
                    </motion.div>
                  </div>
                </div>
                
                {/* Real Charts with KSH Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <motion.div 
                    className="bg-gradient-to-br from-[#801066]/10 to-[#801066]/20 dark:from-[#801066]/20 dark:to-[#801066]/30 p-4 md:p-6 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Revenue</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#801066] dark:text-[#801066]">KSh 2,458,000</p>
                    <p className="text-sm text-[#801066] dark:text-[#801066] mt-1">+12.5% from last month</p>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-[#acacb3]/10 to-[#acacb3]/20 dark:from-[#acacb3]/20 dark:to-[#acacb3]/30 p-4 md:p-6 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Active Users</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#acacb3] dark:text-[#acacb3]">1,247</p>
                    <p className="text-sm text-[#acacb3] dark:text-[#acacb3] mt-1">+8.2% from last month</p>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-4 md:p-6 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Revenue Today</h3>
                    <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">KSh 124,000</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">+5.3% from yesterday</p>
                  </motion.div>
                </div>
                
                {/* Vivid Real Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <motion.div 
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6"
                    initial={{ opacity: 0, x: -50 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ duration: 0.8, delay: 1.8 }}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Active Users</h4>
                    <div className="h-32 flex items-end justify-between gap-1">
                      {[40, 60, 45, 80, 70, 90, 75, 85, 70, 95, 80, 100].map((height, index) => (
                        <motion.div
                          key={index}
                          className="bg-gradient-to-t from-[#801066] to-[#6d0d57] rounded-t flex-1"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={inView ? { height: `${height}%` } : { height: 0 }}
                          transition={{ duration: 1, delay: 2 + index * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-lg font-bold text-[#801066] dark:text-[#801066]">1,247 Users</div>
                      <div className="text-xs text-[#801066] dark:text-[#801066]">+8.2% growth</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6"
                    initial={{ opacity: 0, x: 50 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.8, delay: 2 }}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Today</h4>
                    <div className="h-32 flex items-end justify-between gap-1">
                      {[30, 50, 40, 70, 60, 85, 65, 80, 55, 90, 75, 95].map((height, index) => (
                        <motion.div
                          key={index}
                          className="bg-gradient-to-t from-green-500 to-green-400 rounded-t flex-1"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={inView ? { height: `${height}%` } : { height: 0 }}
                          transition={{ duration: 1, delay: 2.2 + index * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">KSh 124,000</div>
                      <div className="text-xs text-green-600 dark:text-green-400">+5.3% growth</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Floating feature badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            {[
              { icon: Shield, text: "Secure & Reliable" },
              { icon: TrendingUp, text: "Fast & Easy Setup" },
              { icon: Users, text: "Customizable Solutions" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 2.4 + index * 0.2 }}
              >
                <feature.icon className="w-4 h-4 text-[#801066] dark:text-[#801066]" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Floating buttons - hidden on mobile */}
          <div className="hidden lg:flex fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex-col gap-2">
            <motion.button 
              className="w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg">?</span>
            </motion.button>
            <motion.button 
              className="w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <span className="text-lg">💬</span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
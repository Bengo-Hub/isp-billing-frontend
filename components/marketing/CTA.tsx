'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export function CTA() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 relative overflow-hidden">
      {/* Cloudy background elements */}
      <div className="absolute inset-0">
        {/* Large clouds */}
        <motion.div 
          className="absolute top-10 left-10 w-64 h-32 bg-white/40 dark:bg-white/20 rounded-full blur-sm opacity-60"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-20 right-20 w-80 h-40 bg-white/30 dark:bg-white/15 rounded-full blur-md opacity-50"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 15, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-32 left-1/3 w-72 h-36 bg-white/25 dark:bg-white/10 rounded-full blur-sm opacity-40"
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 25, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Medium clouds */}
        <motion.div 
          className="absolute top-40 right-1/4 w-48 h-24 bg-white/35 dark:bg-white/18 rounded-full blur-sm opacity-55"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
            y: [0, 8, 0]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-60 left-1/4 w-56 h-28 bg-white/30 dark:bg-white/12 rounded-full blur-md opacity-45"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 15, 0],
            y: [0, -12, 0]
          }}
          transition={{ 
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-80 right-1/3 w-64 h-32 bg-white/25 dark:bg-white/8 rounded-full blur-sm opacity-50"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -25, 0],
            y: [0, 10, 0]
          }}
          transition={{ 
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Small clouds */}
        <motion.div 
          className="absolute top-16 left-1/2 w-32 h-16 bg-white/40 dark:bg-white/20 rounded-full blur-sm opacity-60"
          animate={{ 
            scale: [1, 1.05, 1],
            x: [0, 10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-48 right-10 w-40 h-20 bg-white/30 dark:bg-white/12 rounded-full blur-sm opacity-50"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -15, 0],
            y: [0, 6, 0]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-72 left-10 w-36 h-18 bg-white/35 dark:bg-white/15 rounded-full blur-sm opacity-55"
          animate={{ 
            scale: [1, 1.08, 1],
            x: [0, 12, 0],
            y: [0, -8, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Distant clouds */}
        <motion.div 
          className="absolute top-24 right-1/2 w-96 h-48 bg-white/15 dark:bg-white/5 rounded-full blur-lg opacity-30"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-64 left-1/2 w-80 h-40 bg-white/20 dark:bg-white/8 rounded-full blur-lg opacity-25"
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 35, 0],
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          ref={ref}
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
            Ready to Transform Your ISP Business?
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join thousands of ISPs who trust CodeVertex for their billing and management needs. 
            Start your free trial today.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
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
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-700 hover:bg-gray-100 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-gray-700 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto shadow-lg">
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  View Demo
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
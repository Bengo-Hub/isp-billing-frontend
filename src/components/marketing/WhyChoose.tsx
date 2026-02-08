'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Zap, Shield, TrendingUp, Users, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export function WhyChoose() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and security protocols',
      color: 'from-brand-700 to-brand-900',
      delay: 0.1
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for high-performance operations',
      color: 'from-gray-400 to-brand-700',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      title: 'Scalable Growth',
      description: 'Grows seamlessly with your business',
      color: 'from-brand-700 to-gray-400',
      delay: 0.3
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Dedicated support team always available',
      color: 'from-brand-900 to-brand-700',
      delay: 0.4
    }
  ];

  const stats = [
    { value: 'KSh 2.4M+', label: 'Revenue Generated', icon: TrendingUp },
    { value: '1,247', label: 'Active Users', icon: Users },
    { value: '99.9%', label: 'Uptime Guarantee', icon: Shield },
    { value: '24/7', label: 'Support Available', icon: CheckCircle }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background relative overflow-hidden">
      {/* Magical background elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-gray-400/10 dark:bg-gray-400/5 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-brand-700/5 to-gray-400/5 dark:from-brand-700/3 dark:to-gray-400/3 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 360, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
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
            <Sparkles className="w-4 h-4" />
            Why Choose CodeVertex?
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The Smart Choice for Modern ISPs
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join thousands of ISPs who trust CodeVertex for their billing and management needs. 
            Experience the difference with our comprehensive solution.
          </motion.p>
        </motion.div>
        
        {/* Stats section with magical animations */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center p-4 md:p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              whileHover={{ 
                y: -10, 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-brand-700 to-brand-900 rounded-full flex items-center justify-center mx-auto mb-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div 
                className="text-2xl md:text-3xl font-bold text-primary mb-1"
                initial={{ scale: 0.8 }}
                animate={inView ? { scale: 1 } : { scale: 0.8 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto items-center">
          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="p-4 md:p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 1.4 + feature.delay }}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.02,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
                  }}
                >
                  <motion.div 
                    className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-3`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* CTA section */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-primary hover:bg-brand-800 text-white text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto shadow-lg">
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
                  <Button size="lg" variant="outline" className="text-primary border-primary hover:bg-primary/10 dark:text-primary dark:border-primary dark:hover:bg-primary/10 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto shadow-lg">
                    <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    View Demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            {/* Testimonial quote */}
            <motion.div 
              className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-border"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, delay: 2 + i * 0.1 }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>
              <blockquote className="text-sm md:text-base text-muted-foreground italic mb-3">
                "CodeVertex transformed our ISP operations. The automated billing and real-time analytics 
                helped us increase revenue by 40% in just 6 months."
              </blockquote>
              <div className="text-sm font-medium text-foreground">
                - Sarah Johnson, CEO TechNet ISP
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
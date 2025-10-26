'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'ISP Owner',
      company: 'TechConnect ISP',
      content: 'CodeVertex Billing has transformed our business operations. The automated billing and customer management features have saved us countless hours.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Network Administrator',
      company: 'MetroNet Solutions',
      content: 'The Mikrotik integration is seamless. We can manage all our routers remotely and the real-time monitoring is incredibly helpful.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Business Owner',
      company: 'CityWide Internet',
      content: 'The customer portal has reduced our support tickets by 70%. Our customers love the self-service features.',
      rating: 5,
      avatar: 'ER'
    }
  ];

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
            Customer Stories
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            What other Internet Providers Say
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Hear from ISP owners who have transformed their business with CodeVertex Billing.
          </motion.p>
        </motion.div>
        
        {/* Testimonials grid with staggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                scale: 1.02
              }}
            >
              {/* Quote icon */}
              <motion.div 
                className="absolute top-4 right-4 text-[#801066]/20 dark:text-[#801066]/30"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
              >
                <Quote className="w-8 h-8" />
              </motion.div>
              
              {/* Rating stars */}
              <motion.div 
                className="flex items-center gap-1 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 + index * 0.2 + i * 0.1 }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Testimonial content */}
              <motion.p 
                className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.2 }}
              >
                "{testimonial.content}"
              </motion.p>
              
              {/* Author info */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-[#801066] to-[#acacb3] rounded-full flex items-center justify-center text-white font-bold text-sm"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </motion.div>
              
              {/* Hover effect overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-[#801066]/5 to-[#acacb3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
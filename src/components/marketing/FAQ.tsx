'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

export function FAQ() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is CodeVertex ISP Billing System?',
      answer: 'CodeVertex ISP Billing System is a comprehensive billing and management solution designed specifically for Internet Service Providers. It includes automated billing, customer management, payment processing, and network device integration.'
    },
    {
      question: 'Does it support Mikrotik routers?',
      answer: 'Yes! CodeVertex Billing includes full Mikrotik integration with remote management capabilities, real-time monitoring, and automated user provisioning. You can manage all your Mikrotik routers from a single dashboard.'
    },
    {
      question: 'What payment gateways are supported?',
      answer: 'We support multiple payment gateways including M-Pesa, PayPal, Stripe, and bank transfers. The system is designed to work with local and international payment methods to serve ISPs globally.'
    },
    {
      question: 'Is there a customer portal?',
      answer: 'Absolutely! The system includes a self-service customer portal where your customers can view their bills, make payments, update their information, and manage their services without contacting support.'
    },
    {
      question: 'Can I customize the billing plans?',
      answer: 'Yes, you have complete flexibility to create custom billing plans, packages, and pricing structures. The system supports various billing cycles, usage-based billing, and promotional offers.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We provide comprehensive support including setup assistance, training, documentation, and ongoing technical support. Our team is available to help you get the most out of your billing system.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            Common Questions
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Questions? Answers!
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Find answers to the most frequently asked questions about CodeVertex ISP Billing System.
          </motion.p>
        </motion.div>
        
        {/* FAQ items with smooth animations */}
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
            >
              <motion.button
                className="w-full text-left bg-card rounded-lg p-6 shadow-lg border border-border hover:shadow-xl transition-shadow duration-300 group"
                onClick={() => toggleFAQ(index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-bold text-foreground pr-4 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0"
                  >
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300" />
                    )}
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <motion.p 
                        className="mt-4 text-muted-foreground leading-relaxed"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        {/* Call to action */}
        <motion.div 
          className="text-center mt-8 md:mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.p 
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            Still have questions? We're here to help!
          </motion.p>
          <motion.a
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary hover:bg-brand-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    CreditCard,
    MessageSquare,
    Router,
    Shield
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export function Integrations() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const integrations = [
    {
      category: 'Payment Gateways',
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      items: [
        { name: 'M-Pesa', description: 'Mobile money payments', status: 'active' },
        { name: 'Paystack', description: 'Online card payments', status: 'active' },
        { name: 'IOTEC', description: 'Digital payment processing', status: 'active' },
        { name: 'ClickPesa', description: 'Business payment platform', status: 'active' },
        { name: 'ZenoPay', description: 'Modern digital payments', status: 'active' }
      ]
    },
    {
      category: 'Network Management',
      icon: Router,
      color: 'from-brand-700 to-brand-900',
      items: [
        { name: 'Mikrotik RouterOS', description: 'Full RouterOS v6 & v7 support', status: 'active' },
        { name: 'PPPoE Servers', description: 'Point-to-Point Protocol over Ethernet', status: 'active' },
        { name: 'Hotspot Management', description: 'Captive portal & user authentication', status: 'active' },
        { name: 'DHCP Servers', description: 'Dynamic IP assignment', status: 'active' },
        { name: 'VLAN Management', description: 'Virtual LAN configuration', status: 'active' }
      ]
    },
    {
      category: 'Communication',
      icon: MessageSquare,
      color: 'from-gray-400 to-brand-700',
      items: [
        { name: 'SMS Gateway', description: 'Bulk SMS notifications', status: 'active' },
        { name: 'Email Integration', description: 'Automated email alerts', status: 'active' },
        { name: 'WhatsApp API', description: 'WhatsApp notifications', status: 'active' },
        { name: 'Push Notifications', description: 'Mobile app notifications', status: 'active' }
      ]
    },
    {
      category: 'Security & Compliance',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      items: [
        { name: 'SSL/TLS Encryption', description: 'Secure data transmission', status: 'active' },
        { name: 'Two-Factor Authentication', description: 'Enhanced security login', status: 'active' },
        { name: 'Data Backup', description: 'Automated data protection', status: 'active' },
        { name: 'Audit Logs', description: 'Comprehensive activity tracking', status: 'active' }
      ]
    }
  ];

  return (
    <section id="integrations" className="py-12 md:py-16 lg:py-20 bg-card relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
          className="absolute bottom-0 left-0 w-96 h-96 bg-gray-400/10 dark:bg-gray-400/5 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
            Seamless Integrations
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            CodeVertex Integrates with
          </motion.h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Multiple payment gateways, network devices, communication platforms, and security systems.
          </motion.p>
        </motion.div>
        
        {/* Integration categories with vivid animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {integrations.map((category, categoryIndex) => (
            <motion.div 
              key={categoryIndex}
              className="bg-card rounded-lg p-6 shadow-lg border border-border relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.8 + categoryIndex * 0.2 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                scale: 1.02
              }}
            >
              {/* Animated background gradient */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.05 }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground">{category.category}</h3>
                </div>
                
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg group/item hover:bg-primary/5 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.6, delay: 1 + itemIndex * 0.1 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <motion.span 
                            className="w-2 h-2 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: itemIndex * 0.5 }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <motion.div
                        className="text-green-600 dark:text-green-400 text-sm font-medium"
                        whileHover={{ scale: 1.1 }}
                      >
                        Active
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Integration network diagram */}
        <motion.div 
          className="mt-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 shadow-lg border border-border"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">Integration Network</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { icon: CreditCard, name: 'Payments', color: 'text-green-600' },
              { icon: Router, name: 'Network', color: 'text-primary' },
              { icon: MessageSquare, name: 'SMS', color: 'text-gray-400' },
              { icon: Shield, name: 'Security', color: 'text-red-600' }
            ].map((integration, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-card rounded-full shadow-lg flex items-center justify-center border-2 border-border"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <integration.icon className={`w-8 h-8 ${integration.color}`} />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground">{integration.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/10 text-base md:text-lg h-10 md:h-12 px-6 md:px-8 shadow-lg">
              Explore All Integrations
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
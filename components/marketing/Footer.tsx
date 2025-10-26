'use client';

import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export function Footer() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Integrations', href: '#integrations' },
      { name: 'API Documentation', href: '/docs' }
    ],
    company: [
      { name: 'About Us', href: 'https://codevertexitsolutions.com/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: 'https://codevertexitsolutions.com/blog' },
      { name: 'Careers', href: 'https://codevertexitsolutions.com/careers' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Status', href: '/status' },
      { name: 'Contact Support', href: '/contact' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/codevertex' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/codevertex' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/codevertex' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/codevertex' }
  ];

  return (
    <footer className="bg-gradient-to-br from-[#801066] via-[#6d0d57] to-[#acacb3] text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
      
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 relative z-10">
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          {/* Company info */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/images/logo.png"
                alt="CodeVertex Billing"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </motion.div>
            <motion.p 
              className="text-white/90 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Empowering ISPs with comprehensive billing and management solutions. 
              Transform your business with automated workflows and real-time insights.
            </motion.p>
            
            {/* Contact info */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Mail className="w-4 h-4 text-white/80" />
                <span className="text-white/90 text-sm">info@codevertexitsolutions.com</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Phone className="w-4 h-4 text-white/80" />
                <span className="text-white/90 text-sm">+254 700 000 000</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white/90 text-sm">Nairobi, Kenya</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div 
              key={category}
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.8 + categoryIndex * 0.1 }}
            >
              <motion.h3 
                className="text-lg font-bold text-white capitalize"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 1 + categoryIndex * 0.1 }}
              >
                {category}
              </motion.h3>
              <motion.ul 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + categoryIndex * 0.1 }}
              >
                {links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 1.4 + categoryIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <Link 
                      href={link.href}
                      className="text-white/80 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {link.name}
                      </motion.span>
                      <motion.div
                        className="w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-300"
                        whileHover={{ width: '100%' }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Social links and bottom section */}
        <motion.div 
          className="mt-12 pt-8 border-t border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.p 
              className="text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              © 2024 CodeVertex IT Solutions. All rights reserved.
            </motion.p>
            
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 2 }}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300 group"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: 2.2 + index * 0.1 }}
                >
                  <social.icon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-300" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
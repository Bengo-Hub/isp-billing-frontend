'use client';

import Brand from '@/components/brand/Brand';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Hide navbar on auth pages (login, signup)
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="codevertex-theme">
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 dark:from-slate-900 dark:via-gray-800 dark:to-slate-900 relative overflow-hidden">
        {!isAuthPage && (
          <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700' 
              : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-100 dark:border-gray-800'
          }`}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="w-20 h-14 flex items-center">
              <Brand href="/" />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('integrations')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Integrations
              </button>
              <Link 
                href="/contact"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Contact
              </Link>
            </nav>
            
            {/* Desktop CTA and Theme Toggle */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <button 
                onClick={() => scrollToSection('pricing')}
                className="bg-[#801066] hover:bg-[#6d0d57] text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Get Started - Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="px-4 py-4 space-y-4">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('integrations')}
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Integrations
                </button>
                <Link 
                  href="/contact"
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Contact
                </Link>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ThemeToggle />
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    className="bg-[#801066] hover:bg-[#6d0d57] text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    Get Started - Free
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>
        )}
        
        {/* Add top padding to account for fixed header only when navbar is shown */}
        <div className={isAuthPage ? '' : 'pt-16'}>
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
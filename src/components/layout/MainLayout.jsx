import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout = ({ children }) => {
  const { isDark } = useTheme();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Close mobile menus when route changes
  useEffect(() => {
    // This helps ensure mobile menus are closed on route changes
    const closeMobileMenus = () => {
      // You can add event listeners here to close mobile menus if needed
      window.dispatchEvent(new CustomEvent('closeMobileMenus'));
    };

    closeMobileMenus();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background">
      {/* Fixed/Sticky Header - Full width, no horizontal scroll */}
      <div className="w-full relative z-50">
        <Header />
      </div>
        
      {/* Main Content Area with proper spacing - allows horizontal scrolling */}
      <main className="flex-1 relative overflow-y-auto pt-16 lg:pt-18">
        {/* Content wrapper with proper spacing */}
        <div className="relative z-10">
          {children}
        </div>
          
        {/* Enhanced Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 bg-gradient-primary hover:bg-gradient-primary-hover text-white p-3 rounded-full shadow-xl transition-all duration-300 z-50 group ${
            showScrollTop
              ? 'opacity-100 translate-y-0 visible'
              : 'opacity-0 translate-y-2 invisible pointer-events-none'
          }`}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </main>
        
      {/* Footer - Full width, no horizontal scroll */}
      <div className="w-full relative z-0">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
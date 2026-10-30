'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Calendar, Menu, X, Shield, PhoneCall, Home } from 'lucide-react';

export const Navbar = ({ onOpenCMS }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      if (pathname === '/') {
        if (window.scrollY < 350) {
          setActiveSection('home');
        } else {
          const sections = ['rooms', 'amenities', 'dining', 'gallery', 'reviews', 'contact'];
          for (const sec of sections) {
            const el = document.getElementById(sec);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 250 && rect.bottom >= 150) {
                setActiveSection(sec);
                break;
              }
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Home link logic: smooth scroll to top if already on '/', or navigate to '/'
  const handleHomeClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('home');
    }
    setIsMobileMenuOpen(false);
  };

  // Section smooth scrolling logic
  const handleSectionClick = (e, targetId) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(targetId);
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-white/10 py-2.5 sm:py-3' 
        : 'bg-gradient-to-b from-black/85 via-black/45 to-transparent py-3 sm:py-4 lg:py-5'
    }`}>
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 flex-nowrap w-full">
          
          {/* Logo & Hotel Name (Shrink-0, stays on one line) */}
          <Link 
            href="/" 
            onClick={handleHomeClick}
            className="flex items-center gap-2 sm:gap-3 group shrink-0 whitespace-nowrap"
          >
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-serif text-base sm:text-lg lg:text-xl font-bold border-2 shadow-inner transition-transform group-hover:scale-105 shrink-0"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                borderColor: 'var(--color-secondary)',
                color: 'var(--color-secondary)'
              }}
            >
              {theme?.hotelName?.charAt(0) || 'H'}
            </div>
            <div className="whitespace-nowrap">
              <div className="font-serif text-sm sm:text-base lg:text-lg xl:text-xl font-semibold tracking-wide text-white flex items-center gap-2">
                {theme?.hotelName || 'The Grand Aurelia'}
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-amber-200/80 font-medium">
                {theme?.hotelSubtitle || 'Luxury Hotel & Suites'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Includes Home + section anchors, single line with fluid shrink) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3.5 xl:gap-5 2xl:gap-6 text-xs lg:text-[13px] xl:text-sm font-medium text-white/90 whitespace-nowrap flex-nowrap">
            {/* Home Link with dynamic active logic */}
            <Link 
              href="/" 
              onClick={handleHomeClick}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeSection === 'home' && pathname === '/'
                  ? 'text-amber-300 font-semibold' 
                  : 'text-white/90 hover:text-amber-300'
              }`}
            >
              <span>Home</span>
              {activeSection === 'home' && pathname === '/' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                />
              )}
            </Link>

            <a 
              href="/#rooms" 
              onClick={(e) => handleSectionClick(e, 'rooms')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeSection === 'rooms' && pathname === '/' ? 'text-amber-300 font-semibold' : 'hover:text-amber-300'
              }`}
            >
              Rooms & Suites
            </a>

            <a 
              href="/#amenities" 
              onClick={(e) => handleSectionClick(e, 'amenities')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeSection === 'amenities' && pathname === '/' ? 'text-amber-300 font-semibold' : 'hover:text-amber-300'
              }`}
            >
              Experiences & Spa
            </a>

            <a 
              href="/#dining" 
              onClick={(e) => handleSectionClick(e, 'dining')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeSection === 'dining' && pathname === '/' ? 'text-amber-300 font-semibold' : 'hover:text-amber-300'
              }`}
            >
              Gastronomy
            </a>

            <a 
              href="/#gallery" 
              onClick={(e) => handleSectionClick(e, 'gallery')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeSection === 'gallery' && pathname === '/' ? 'text-amber-300 font-semibold' : 'hover:text-amber-300'
              }`}
            >
              Gallery
            </a>

            <a 
              href="/#reviews" 
              onClick={(e) => handleSectionClick(e, 'reviews')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeSection === 'reviews' && pathname === '/' ? 'text-amber-300 font-semibold' : 'hover:text-amber-300'
              }`}
            >
              Testimonials
            </a>

            <a 
              href="/#contact" 
              onClick={(e) => handleSectionClick(e, 'contact')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeSection === 'contact' && pathname === '/' ? 'text-amber-300 font-semibold' : 'hover:text-amber-300'
              }`}
            >
              Contact
            </a>
          </nav>

          {/* Right Action Buttons (Stays on one line, shrink-0) */}
          <div className="hidden sm:flex items-center gap-2.5 lg:gap-3.5 shrink-0 whitespace-nowrap flex-nowrap">
            {/* Book Now Button */}
            <button
              onClick={() => openBookingModal()}
              className="flex items-center gap-1.5 px-4 py-1.5 lg:px-5 lg:py-2 rounded-full text-[11px] lg:text-xs font-bold uppercase tracking-wider text-slate-950 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              style={{
                backgroundColor: 'var(--color-secondary)',
                boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)'
              }}
            >
              <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 shrink-0" />
              <span>Book Stay</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger (for screens under md) */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4 shadow-2xl animate-fade-in">
          <nav className="flex flex-col space-y-3 text-base font-medium text-white/90">
            <Link 
              href="/" 
              onClick={handleHomeClick}
              className={`flex items-center justify-between py-1 transition-colors ${
                activeSection === 'home' && pathname === '/' ? 'text-amber-300 font-bold' : 'hover:text-amber-300'
              }`}
            >
              <span>Home</span>
              {activeSection === 'home' && pathname === '/' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>

            <a 
              href="/#rooms" 
              onClick={(e) => handleSectionClick(e, 'rooms')} 
              className={`hover:text-amber-300 ${activeSection === 'rooms' && pathname === '/' ? 'text-amber-300 font-semibold' : ''}`}
            >
              Rooms & Suites
            </a>

            <a 
              href="/#amenities" 
              onClick={(e) => handleSectionClick(e, 'amenities')} 
              className={`hover:text-amber-300 ${activeSection === 'amenities' && pathname === '/' ? 'text-amber-300 font-semibold' : ''}`}
            >
              Experiences & Spa
            </a>

            <a 
              href="/#dining" 
              onClick={(e) => handleSectionClick(e, 'dining')} 
              className={`hover:text-amber-300 ${activeSection === 'dining' && pathname === '/' ? 'text-amber-300 font-semibold' : ''}`}
            >
              Gastronomy
            </a>

            <a 
              href="/#gallery" 
              onClick={(e) => handleSectionClick(e, 'gallery')} 
              className={`hover:text-amber-300 ${activeSection === 'gallery' && pathname === '/' ? 'text-amber-300 font-semibold' : ''}`}
            >
              Photo Gallery
            </a>

            <a 
              href="/#reviews" 
              onClick={(e) => handleSectionClick(e, 'reviews')} 
              className={`hover:text-amber-300 ${activeSection === 'reviews' && pathname === '/' ? 'text-amber-300 font-semibold' : ''}`}
            >
              Guest Reviews
            </a>

            <a 
              href="/#contact" 
              onClick={(e) => handleSectionClick(e, 'contact')} 
              className={`hover:text-amber-300 ${activeSection === 'contact' && pathname === '/' ? 'text-amber-300 font-semibold' : ''}`}
            >
              Contact Concierge
            </a>
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openBookingModal();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-slate-950 font-bold text-sm tracking-wider uppercase shadow-lg"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Room Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

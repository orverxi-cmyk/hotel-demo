'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Calendar, Menu, X, Shield, PhoneCall, Home, ExternalLink } from 'lucide-react';
import { getCachedNavMenus, subscribeNavMenus, initialNavMenus } from '../services/storageService';

// Helper to extract target section ID and canonical href from any menu item
export const resolveNavTarget = (item) => {
  if (!item) return { isHome: false, isAnchor: false, targetId: null, href: '/' };

  const rawHref = (item.href || '').trim();
  const rawTarget = (item.targetId || '').trim().replace(/^#+/, '');

  if (rawHref === '/' || rawTarget === 'home') {
    return { isHome: true, isAnchor: false, targetId: 'home', href: '/' };
  }

  // Any link that contains '#' is an anchor link (e.g. "/#amenities", "#amenities", "http.../#amenities")
  if (rawHref.includes('#')) {
    const hashId = rawHref.split('#')[1].split('/')[0].split('?')[0].trim();
    if (hashId) {
      return {
        isHome: false,
        isAnchor: true,
        targetId: hashId,
        href: `/#${hashId}`
      };
    }
  }

  // If rawTarget is specified (e.g. "amenities", "rooms", "dining")
  if (rawTarget && rawTarget !== 'home') {
    return {
      isHome: false,
      isAnchor: true,
      targetId: rawTarget,
      href: `/#${rawTarget}`
    };
  }

  // If rawHref is a known section slug like "amenities" or "/amenities"
  const cleanPath = rawHref.replace(/^\/+|\/+$/g, '').toLowerCase();
  const known = ['rooms', 'amenities', 'dining', 'gallery', 'reviews', 'contact', 'location'];
  if (known.includes(cleanPath)) {
    return {
      isHome: false,
      isAnchor: true,
      targetId: cleanPath,
      href: `/#${cleanPath}`
    };
  }

  return {
    isHome: false,
    isAnchor: false,
    targetId: null,
    href: rawHref || '/'
  };
};

export const Navbar = ({ onOpenCMS }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [navMenus, setNavMenus] = useState(initialNavMenus);

  // Sync navigation menus dynamically in real time
  useEffect(() => {
    const cached = getCachedNavMenus();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setNavMenus(cached);
    }

    const unsubscribe = subscribeNavMenus((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setNavMenus(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleMenus = [...navMenus]
    .filter(m => m.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Scroll to hash target on initial mount or route landing
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname === '/' && window.location.hash) {
      const hashId = window.location.hash.replace(/^#+/, '').trim();
      if (hashId) {
        const timer = setTimeout(() => {
          const targetEl = document.getElementById(hashId) || 
                           (hashId === 'contact' ? document.getElementById('location') : null) ||
                           (hashId === 'location' ? document.getElementById('contact') : null);
          if (targetEl) {
            const navHeight = 80;
            const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = Math.max(0, elementPosition - navHeight);
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            setActiveSection(hashId);
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      if (pathname === '/') {
        if (window.scrollY < 350) {
          setActiveSection('home');
        } else {
          const sections = ['rooms', 'amenities', 'dining', 'gallery', 'reviews', 'location', 'contact'];
          for (const sec of sections) {
            const el = document.getElementById(sec);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 250 && rect.bottom >= 150) {
                setActiveSection(sec === 'location' ? 'contact' : sec);
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

  // Section smooth scrolling logic with fixed header offset
  const handleSectionClick = (e, targetId, href) => {
    setIsMobileMenuOpen(false);

    const cleanId = (targetId || '').replace(/^#+/, '').trim();
    if (!cleanId) return;

    if (pathname === '/') {
      const targetEl = document.getElementById(cleanId) || 
                       (cleanId === 'contact' ? document.getElementById('location') : null) ||
                       (cleanId === 'location' ? document.getElementById('contact') : null);

      if (targetEl) {
        if (e && e.preventDefault) e.preventDefault();
        
        const navHeight = 80;
        const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - navHeight);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        setActiveSection(cleanId);

        try {
          window.history.pushState(null, '', `/#${cleanId}`);
        } catch (_) {}
      } else {
        // Fallback retry for dynamic or mounting sections
        setTimeout(() => {
          const retryEl = document.getElementById(cleanId) || 
                          (cleanId === 'contact' ? document.getElementById('location') : null) ||
                          (cleanId === 'location' ? document.getElementById('contact') : null);
          if (retryEl) {
            const navHeight = 80;
            const elementPosition = retryEl.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = Math.max(0, elementPosition - navHeight);
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            setActiveSection(cleanId);
          }
        }, 150);
      }
    } else {
      // If we are on /admin, /discover, or another route, navigate to /#section
      if (e && e.preventDefault) e.preventDefault();
      window.location.href = href || `/#${cleanId}`;
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-white/10 py-2.5 sm:py-3' 
          : theme?.heroNavbarStyle === 'transparent'
            ? 'bg-transparent py-3 sm:py-4 lg:py-5'
            : theme?.heroNavbarStyle === 'solid'
              ? 'py-3 sm:py-4 lg:py-5 border-b border-white/10 shadow-md'
              : 'bg-gradient-to-b from-black/85 via-black/45 to-transparent py-3 sm:py-4 lg:py-5'
      }`}
      style={(!isScrolled && theme?.heroNavbarStyle === 'solid') ? { backgroundColor: theme?.heroBgColor || '#020617' } : undefined}
    >
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

          {/* Desktop Navigation Links (Dynamically synced & customizable) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3.5 xl:gap-5 2xl:gap-6 text-xs lg:text-[13px] xl:text-sm font-medium text-white/90 whitespace-nowrap flex-nowrap">
            {visibleMenus.map((item) => {
              const nav = resolveNavTarget(item);
              const isActive = (nav.isHome && pathname === '/' && activeSection === 'home') ||
                               (!nav.isHome && pathname === '/' && (activeSection === nav.targetId || (activeSection === 'location' && nav.targetId === 'contact') || (activeSection === 'contact' && nav.targetId === 'location'))) ||
                               (!nav.isHome && !nav.isAnchor && pathname === nav.href);

              if (item.isExternal || (item.href && (item.href.startsWith('http://') || item.href.startsWith('https://')))) {
                return (
                  <a 
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors whitespace-nowrap py-1 hover:text-amber-300"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </a>
                );
              }

              if (nav.isAnchor) {
                return (
                  <a 
                    key={item.id}
                    href={nav.href}
                    onClick={(e) => handleSectionClick(e, nav.targetId, nav.href)}
                    className={`transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                      isActive ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span 
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      />
                    )}
                  </a>
                );
              }

              return (
                <Link 
                  key={item.id}
                  href={nav.href}
                  onClick={nav.isHome ? handleHomeClick : () => setIsMobileMenuOpen(false)}
                  className={`transition-colors whitespace-nowrap py-1 relative ${
                    isActive ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    />
                  )}
                </Link>
              );
            })}
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
            {visibleMenus.map((item) => {
              const nav = resolveNavTarget(item);
              const isActive = (nav.isHome && pathname === '/' && activeSection === 'home') ||
                               (!nav.isHome && pathname === '/' && (activeSection === nav.targetId || (activeSection === 'location' && nav.targetId === 'contact') || (activeSection === 'contact' && nav.targetId === 'location'))) ||
                               (!nav.isHome && !nav.isAnchor && pathname === nav.href);

              if (item.isExternal || (item.href && (item.href.startsWith('http://') || item.href.startsWith('https://')))) {
                return (
                  <a 
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-1 hover:text-amber-300"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                );
              }

              if (nav.isAnchor) {
                return (
                  <a 
                    key={item.id}
                    href={nav.href}
                    onClick={(e) => handleSectionClick(e, nav.targetId, nav.href)} 
                    className={`flex items-center justify-between py-1 transition-colors cursor-pointer ${
                      isActive ? 'text-amber-300 font-bold' : 'hover:text-amber-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </a>
                );
              }

              return (
                <Link 
                  key={item.id}
                  href={nav.href}
                  onClick={nav.isHome ? handleHomeClick : () => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-1 transition-colors ${
                    isActive ? 'text-amber-300 font-bold' : 'hover:text-amber-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </Link>
              );
            })}
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

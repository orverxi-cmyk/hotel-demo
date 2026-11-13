'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Shield, Sparkles, Send, Check } from 'lucide-react';

export const Footer = ({ onOpenCMS }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <footer className="bg-slate-950 text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-xl font-bold border-2"
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  borderColor: 'var(--color-secondary)',
                  color: 'var(--color-secondary)'
                }}
              >
                {theme?.hotelName?.charAt(0) || 'H'}
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide">
                {theme?.hotelName || 'The Grand Aurelia'}
              </span>
            </div>
            
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              An aristocratic retreat providing unprecedented privacy, bespoke gastronomy, and restorative botanical wellness on the Mediterranean shoreline.
            </p>

            <div className="pt-2">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold block mb-2">
                Member of Leading Luxury Hotels
              </span>
              <div className="flex items-center gap-4 text-stone-400 text-xs">
                <span>★ Forbes 5-Star 2026</span>
                <span>•</span>
                <span>Michelin Guide Selected</span>
              </div>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-4">
              Residences
            </h5>
            <ul className="space-y-2 text-sm text-stone-300">
              <li><Link href="/rooms" className="hover:text-amber-300 transition-colors">Ocean Villas</Link></li>
              <li><Link href="/rooms" className="hover:text-amber-300 transition-colors">Penthouse Suites</Link></li>
              <li><Link href="/rooms" className="hover:text-amber-300 transition-colors">Botanical Suites</Link></li>
              <li><Link href="/rooms" className="hover:text-amber-300 transition-colors">Classic Deluxe</Link></li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-4">
              Experiences
            </h5>
            <ul className="space-y-2 text-sm text-stone-300">
              <li><Link href="/amenities" className="hover:text-amber-300 transition-colors">The Botanical Spa</Link></li>
              <li><Link href="/dining" className="hover:text-amber-300 transition-colors">Michelin Gastronomy</Link></li>
              <li><Link href="/amenities" className="hover:text-amber-300 transition-colors">Private Riva Yacht</Link></li>
              <li><Link href="/amenities" className="hover:text-amber-300 transition-colors">Wine Vault & Tastings</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-4">
            <h5 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-4">
              Private Gazette
            </h5>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribe to receive private invitation privileges, seasonal retreat packages, and culinary events.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>You are subscribed to the private registry.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-300 flex-1"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} {theme?.hotelName || 'The Grand Aurelia'}. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/book"
              className="hover:text-amber-300 transition-colors"
            >
              Direct Reservations
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-amber-300 transition-colors">
              Concierge Desk
            </Link>
            <span>•</span>
            <Link 
              href="/admin" 
              className="text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1" 
              title="Staff & Management CMS"
            >
              <Shield className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

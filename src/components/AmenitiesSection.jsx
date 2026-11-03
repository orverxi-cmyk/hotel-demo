'use client';

import React, { useState, useEffect } from 'react';
import { hotelAmenities } from '../data/initialData';
import { Sparkles, Utensils, Waves, Anchor, Wine, ShieldCheck, ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { initialSectionHeaders, getCachedSectionHeaders, subscribeSectionHeaders } from '../services/storageService';

export const AmenitiesSection = () => {
  const { openBookingModal } = useBooking();
  const [sectionHeaders, setSectionHeaders] = useState(initialSectionHeaders.amenities);

  useEffect(() => {
    const cached = getCachedSectionHeaders();
    if (cached && cached.amenities) {
      setSectionHeaders(cached.amenities);
    }
    const unsub = subscribeSectionHeaders((all) => {
      if (all && all.amenities) setSectionHeaders(all.amenities);
    });
    return () => unsub();
  }, []);

  const iconMap = {
    Sparkles: Sparkles,
    Utensils: Utensils,
    Waves: Waves,
    Anchor: Anchor,
    Wine: Wine,
    ShieldCheck: ShieldCheck
  };

  return (
    <section id="amenities" className="py-24 bg-stone-100/70 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span 
            className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
          >
            {sectionHeaders?.eyebrow || "Curated Hotel Experiences"}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            {sectionHeaders?.title || "Unrivaled World-Class Amenities"}
          </h2>
          <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
            {sectionHeaders?.subtitle || "Every moment at our resort is tailored to exceed imagination — from thermal spa rituals to private yacht expeditions across the turquoise Mediterranean."}
          </p>
        </div>

        {/* 6 Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotelAmenities.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Sparkles;
            return (
              <div 
                key={idx}
                className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: 'var(--color-primary-soft)', 
                    color: 'var(--color-primary)' 
                  }}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                <h3 className="font-serif text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-800 transition-colors">
                  {item.title}
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="pt-2 flex items-center text-xs font-semibold text-stone-500 group-hover:text-slate-900 gap-1.5 transition-colors">
                  <span>Included with residency</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Experience Banner Callout */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-slate-950 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-2 block">
              Private Concierge Excursions
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              Charter Our Riva Yacht for Sunset Dining
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Explore secret emerald sea caves and enjoy private chef-prepared oysters and champagne beneath the starlit sky.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => openBookingModal()}
              className="px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <span>Reserve With Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};


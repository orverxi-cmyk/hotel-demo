'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Utensils, Award, Clock, Calendar, Wine } from 'lucide-react';
import { getCachedDiningVenues, subscribeDiningVenues, initialDiningVenues } from '../services/storageService';

export const DiningSection = () => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const [venues, setVenues] = useState(initialDiningVenues);

  useEffect(() => {
    const cached = getCachedDiningVenues();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setVenues(cached);
    }

    const unsubscribe = subscribeDiningVenues((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setVenues(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleVenues = venues.filter(v => v.visible !== false);

  return (
    <section id="dining" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span 
          className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
        >
          Gastronomy & Libations
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          A Symphony of Epicurean Artistry
        </h2>
        <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
          Embark on an unforgettable gastronomic journey guided by award-winning culinary masters and international sommeliers.
        </p>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visibleVenues.map((venue, idx) => (
          <div 
            key={idx}
            className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col"
          >
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={venue.image} 
                alt={venue.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-slate-950 flex items-center gap-1 shadow-md"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Award className="w-3.5 h-3.5" />
                  {venue.accolade}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif text-2xl font-bold">{venue.name}</h3>
                <p className="text-xs text-stone-300 mt-0.5">{venue.type}</p>
              </div>
            </div>

            {/* Description & Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold mb-3">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Service: {venue.hours}</span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {venue.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Dress Code: Resort Chic</span>
                <button
                  onClick={() => openBookingModal()}
                  className="text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <span>Book Table</span>
                  <span>→</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};


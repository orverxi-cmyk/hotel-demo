'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Utensils, Clock, Calendar, Wine, MapPin } from 'lucide-react';
import { 
  getCachedDiningVenues, 
  subscribeDiningVenues, 
  initialDiningVenues, 
  initialSectionHeaders, 
  getCachedSectionHeaders, 
  subscribeSectionHeaders,
  initialNavMenus,
  getCachedNavMenus,
  subscribeNavMenus,
  isSectionHiddenByMenu 
} from '../services/storageService';

// Gastronomy & Dining Venues Section
export const DiningSection = () => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const [venues, setVenues] = useState(initialDiningVenues);
  const [sectionHeaders, setSectionHeaders] = useState(initialSectionHeaders.dining);
  const [navMenus, setNavMenus] = useState(initialNavMenus);

  useEffect(() => {
    const cachedVenues = getCachedDiningVenues();
    if (cachedVenues && Array.isArray(cachedVenues) && cachedVenues.length > 0) {
      setVenues(cachedVenues);
    }

    const cachedHeaders = getCachedSectionHeaders();
    if (cachedHeaders && cachedHeaders.dining) {
      setSectionHeaders(cachedHeaders.dining);
    }

    const cachedNav = getCachedNavMenus();
    if (cachedNav && Array.isArray(cachedNav)) setNavMenus(cachedNav);

    const unsubscribe = subscribeDiningVenues((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setVenues(updated);
      }
    });

    const unsubscribeHeaders = subscribeSectionHeaders((all) => {
      if (all && all.dining) setSectionHeaders(all.dining);
    });

    const unsubscribeNav = subscribeNavMenus((allNav) => {
      if (allNav && Array.isArray(allNav)) setNavMenus(allNav);
    });

    return () => {
      unsubscribe();
      unsubscribeHeaders();
      unsubscribeNav();
    };
  }, []);

  const visibleVenues = venues.filter(v => v.visible !== false);

  if (sectionHeaders?.visible === false || isSectionHiddenByMenu('dining', navMenus)) return null;

  return (
    <section id="dining" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span 
          className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
        >
          {sectionHeaders?.eyebrow || "Gastronomy & Libations"}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          {sectionHeaders?.title || "A Symphony of Epicurean Artistry"}
        </h2>
        <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
          {sectionHeaders?.subtitle || "Embark on an unforgettable gastronomic journey guided by award-winning culinary masters and international sommeliers."}
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

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif text-2xl font-bold">{venue.name}</h3>
                <p className="text-xs text-stone-300 mt-0.5">{venue.type}</p>
              </div>
            </div>

            {/* Description & Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-semibold mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{venue.hours}</span>
                  </div>
                  {venue.location && (
                    <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{venue.location}</span>
                    </div>
                  )}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {venue.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Dress Code: Resort Chic</span>
                <button
                  type="button"
                  onClick={() => openBookingModal(venue, 'dining')}
                  className="text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
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


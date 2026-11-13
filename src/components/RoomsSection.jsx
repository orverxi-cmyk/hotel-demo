'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { RoomCard } from './RoomCard';
import { RoomDetailModal } from './RoomDetailModal';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { 
  initialSectionHeaders, 
  getCachedSectionHeaders, 
  subscribeSectionHeaders,
  initialNavMenus,
  getCachedNavMenus,
  subscribeNavMenus,
  isSectionHiddenByMenu 
} from '../services/storageService';

export const RoomsSection = () => {
  const { rooms, searchParams, setSearchParams } = useBooking();
  const { theme } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [inspectingRoom, setInspectingRoom] = useState(null);
  const [sectionHeaders, setSectionHeaders] = useState(initialSectionHeaders.rooms);
  const [navMenus, setNavMenus] = useState(initialNavMenus);

  useEffect(() => {
    const cached = getCachedSectionHeaders();
    if (cached && cached.rooms) {
      setSectionHeaders(cached.rooms);
    }
    const unsub = subscribeSectionHeaders((all) => {
      if (all && all.rooms) setSectionHeaders(all.rooms);
    });

    const cachedNav = getCachedNavMenus();
    if (cachedNav && Array.isArray(cachedNav)) setNavMenus(cachedNav);
    const unsubNav = subscribeNavMenus((allNav) => {
      if (allNav && Array.isArray(allNav)) setNavMenus(allNav);
    });

    return () => {
      unsub();
      unsubNav();
    };
  }, []);

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by guests from search bar if set
    if (searchParams.guests && searchParams.guests > 1) {
      result = result.filter(r => r.guests >= searchParams.guests);
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'capacity') {
      result.sort((a, b) => b.guests - a.guests);
    } else {
      // Featured first
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [rooms, selectedCategory, searchParams.guests, sortBy]);

  const categories = ['All', 'Villa', 'Suite', 'Deluxe'];

  if (sectionHeaders?.visible === false || isSectionHiddenByMenu('rooms', navMenus)) return null;

  return (
    <section id="rooms" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background ambient accents */}
      <div 
        className="absolute top-1/3 -left-32 w-96 h-96 rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <div 
        className="absolute bottom-10 -right-32 w-96 h-96 rounded-full blur-[180px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-widest text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{sectionHeaders?.eyebrow || "Bespoke Accommodations"}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {sectionHeaders?.title || "Sanctuaries of Refined Elegance"}
          </h2>
          <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
            {sectionHeaders?.subtitle || "Each residence is individually curated with natural materials, handcrafted Italian furnishings, and unobstructed Mediterranean vistas."}
          </p>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 pb-6 border-b border-white/10">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'text-slate-950 font-bold shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/15 text-stone-300 border border-white/10'
                }`}
                style={selectedCategory === cat ? { backgroundColor: 'var(--color-secondary)' } : {}}
              >
                {cat === 'All' ? 'All Residences' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Sort and Count */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-stone-400 font-medium">
              Showing <strong className="text-white">{filteredRooms.length}</strong> available rooms
            </span>

            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-medium text-stone-200 focus:outline-none cursor-pointer [color-scheme:dark]"
              >
                <option value="featured" className="bg-slate-900 text-white">Signature First</option>
                <option value="price-low" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="capacity" className="bg-slate-900 text-white">Largest Capacity</option>
              </select>
            </div>
          </div>

        </div>

        {/* Rooms Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelectDetail={(r) => setInspectingRoom(r)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/80 rounded-3xl border border-white/10 p-8 shadow-sm">
            <p className="text-stone-300 text-lg mb-4">No rooms match your specific guest count or category filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchParams({ ...searchParams, guests: 1 });
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg cursor-pointer"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Inspecting Room Modal */}
        {inspectingRoom && (
          <RoomDetailModal
            room={inspectingRoom}
            onClose={() => setInspectingRoom(null)}
          />
        )}

      </div>
    </section>
  );
};


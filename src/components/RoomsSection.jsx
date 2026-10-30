'use client';

import React, { useState, useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { RoomCard } from './RoomCard';
import { RoomDetailModal } from './RoomDetailModal';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const RoomsSection = () => {
  const { rooms, searchParams, setSearchParams } = useBooking();
  const { theme } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [inspectingRoom, setInspectingRoom] = useState(null);

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

  return (
    <section id="rooms" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bespoke Accommodations</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Sanctuaries of Refined Elegance
        </h2>
        <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
          Each residence is individually curated with natural materials, handcrafted Italian furnishings, and unobstructed Mediterranean vistas.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 pb-6 border-b border-stone-200">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                selectedCategory === cat
                  ? 'text-white shadow-md'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
              style={selectedCategory === cat ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {cat === 'All' ? 'All Residences' : `${cat}s`}
            </button>
          ))}
        </div>

        {/* Sort and Count */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-slate-900">{filteredRooms.length}</strong> available rooms
          </span>

          <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-medium text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="featured">Signature First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="capacity">Largest Capacity</option>
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
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          <p className="text-stone-500 text-lg mb-4">No rooms match your specific guest count or category filter.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchParams({ ...searchParams, guests: 1 });
            }}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
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

    </section>
  );
};


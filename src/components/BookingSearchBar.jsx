'use client';

import React from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, Users, Home, Search, Sparkles } from 'lucide-react';

export const BookingSearchBar = () => {
  const { searchParams, setSearchParams, openBookingModal } = useBooking();
  const { theme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    // Scroll down to rooms section
    const roomsEl = document.getElementById('rooms');
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950/85 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Check In */}
        <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Check-In
          </label>
          <input
            type="date"
            value={searchParams.checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
            className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
            required
          />
        </div>

        {/* Check Out */}
        <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Check-Out
          </label>
          <input
            type="date"
            value={searchParams.checkOut}
            min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
            onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
            className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
            required
          />
        </div>

        {/* Guests & Category */}
        <div className="grid grid-cols-2 gap-2">
          {/* Guests */}
          <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Guests
            </label>
            <select
              value={searchParams.guests}
              onChange={(e) => setSearchParams({ ...searchParams, guests: Number(e.target.value) })}
              className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
            >
              <option value={1} className="bg-slate-900 text-white">1 Guest</option>
              <option value={2} className="bg-slate-900 text-white">2 Guests</option>
              <option value={3} className="bg-slate-900 text-white">3 Guests</option>
              <option value={4} className="bg-slate-900 text-white">4 Guests</option>
              <option value={5} className="bg-slate-900 text-white">5+ Guests</option>
            </select>
          </div>

          {/* Room Type */}
          <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              Type
            </label>
            <select
              value={searchParams.roomType}
              onChange={(e) => setSearchParams({ ...searchParams, roomType: e.target.value })}
              className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
            >
              <option value="all" className="bg-slate-900 text-white">All Suites</option>
              <option value="Villa" className="bg-slate-900 text-white">Villas</option>
              <option value="Suite" className="bg-slate-900 text-white">Suites</option>
              <option value="Deluxe" className="bg-slate-900 text-white">Deluxe</option>
            </select>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center">
          <button
            type="submit"
            className="w-full h-full min-h-[52px] rounded-xl flex items-center justify-center gap-2 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            <Search className="w-4 h-4" />
            <span>Check Availability</span>
          </button>
        </div>

      </form>
    </div>
  );
};


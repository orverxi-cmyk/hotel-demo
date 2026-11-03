'use client';

import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { initialDiningVenues } from '../data/initialData';
import { 
  Calendar, 
  Users, 
  Home, 
  Search, 
  Sparkles, 
  UtensilsCrossed, 
  Clock, 
  ArrowRight, 
  BedDouble, 
  ShieldCheck, 
  FileText,
  MapPin
} from 'lucide-react';

export const BookingSearchBar = () => {
  const { 
    searchParams, 
    setSearchParams, 
    diningSearchParams,
    setDiningSearchParams,
    openBookingModal, 
    openDiningModal,
    openTrackerModal,
    diningVenues,
    rooms
  } = useBooking();
  const { theme } = useTheme();

  // Active Tab: 'stay' | 'dining' | 'track'
  const [activeTab, setActiveTab] = useState('stay');

  // Local state for Dining form
  const venuesList = (diningVenues && diningVenues.length > 0) ? diningVenues : initialDiningVenues;
  const [selectedVenueId, setSelectedVenueId] = useState(venuesList[0]?.id || 'dining-1');
  const [dinnerDate, setDinnerDate] = useState(
    diningSearchParams?.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const activeVenue = venuesList.find(v => v.id === selectedVenueId) || venuesList[0];
  const availableSlots = (activeVenue?.timeSlots && activeVenue.timeSlots.length > 0)
    ? activeVenue.timeSlots
    : ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
  const [dinnerTimeSlot, setDinnerTimeSlot] = useState(availableSlots[0] || '19:30');
  const [dinnerGuests, setDinnerGuests] = useState(2);

  // Local state for Quick Tracker
  const [trackerCodeInput, setTrackerCodeInput] = useState('');

  // Handle Stay search (scroll to rooms with filter applied)
  const handleStaySearch = (e) => {
    e.preventDefault();
    const roomsEl = document.getElementById('rooms');
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Instant Stay Booking modal open
  const handleInstantStayBook = () => {
    const matchingRoom = searchParams.roomType !== 'all' 
      ? (rooms?.find(r => r.category?.toLowerCase() === searchParams.roomType?.toLowerCase()) || rooms?.[0]) 
      : (rooms?.[0] || null);
    openBookingModal(matchingRoom, 'stay');
  };

  // Handle Dining Table Booking
  const handleDiningSubmit = (e) => {
    e.preventDefault();
    const venueToBook = venuesList.find(v => v.id === selectedVenueId) || venuesList[0];
    const initialParams = {
      venueId: selectedVenueId,
      date: dinnerDate,
      timeSlot: dinnerTimeSlot,
      guests: Number(dinnerGuests)
    };
    if (setDiningSearchParams) {
      setDiningSearchParams(initialParams);
    }
    openDiningModal(venueToBook, null, initialParams);
  };

  // Handle quick tracker submit
  const handleTrackerSubmit = (e) => {
    e.preventDefault();
    if (trackerCodeInput.trim()) {
      openTrackerModal(trackerCodeInput.trim());
    } else {
      openTrackerModal();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950/90 backdrop-blur-2xl p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl transition-all duration-300 relative z-30">
      
      {/* TOP TAB CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        
        {/* Navigation Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          
          {/* Tab 1: Check Room Booking */}
          <button
            type="button"
            onClick={() => setActiveTab('stay')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stay'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Check Room Booking</span>
          </button>

          {/* Tab 2: Book a Table for Dinner */}
          <button
            type="button"
            onClick={() => setActiveTab('dining')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dining'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Book a Table for Dinner</span>
          </button>

          {/* Tab 3: Track Reservation */}
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-white/10'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Booking</span>
          </button>

        </div>

        {/* Micro Guarantee Badge */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-amber-300/90">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Best Direct Guarantee • Real-Time Confirmation</span>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 1. STAY / ROOM BOOKING PANEL                                  */}
      {/* ============================================================== */}
      {activeTab === 'stay' && (
        <form onSubmit={handleStaySearch} className="animate-fade-in space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Check In */}
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Check-In Date
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
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Check-Out Date
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
              <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
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
              <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  Suite Type
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

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 justify-center">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <Search className="w-4 h-4" />
                <span>Check Availability</span>
              </button>

              <button
                type="button"
                onClick={handleInstantStayBook}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-semibold text-[11px] uppercase tracking-wider transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Book Direct Online</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 2. DINING & TABLE BOOKING PANEL (BOOK A TABLE FOR DINNER)      */}
      {/* ============================================================== */}
      {activeTab === 'dining' && (
        <form onSubmit={handleDiningSubmit} className="animate-fade-in space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Dining Venue */}
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                Dining Venue
              </label>
              <select
                value={selectedVenueId}
                onChange={(e) => {
                  setSelectedVenueId(e.target.value);
                  const v = venuesList.find(item => item.id === e.target.value);
                  if (v?.timeSlots?.[0]) {
                    setDinnerTimeSlot(v.timeSlots[0]);
                  }
                }}
                className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
              >
                {venuesList.map((venue) => (
                  <option key={venue.id} value={venue.id} className="bg-slate-900 text-white">
                    {venue.name} ({venue.accolade || 'Fine Dining'})
                  </option>
                ))}
              </select>
            </div>

            {/* Dinner Date */}
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Dinner Date
              </label>
              <input
                type="date"
                value={dinnerDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDinnerDate(e.target.value)}
                className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                required
              />
            </div>

            {/* Time Slot & Diners */}
            <div className="grid grid-cols-2 gap-2">
              {/* Seating Time */}
              <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Dinner Time
                </label>
                <select
                  value={dinnerTimeSlot}
                  onChange={(e) => setDinnerTimeSlot(e.target.value)}
                  className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                >
                  {availableSlots.map((slot, i) => (
                    <option key={i} value={slot} className="bg-slate-900 text-white">
                      {slot} Seating
                    </option>
                  ))}
                </select>
              </div>

              {/* Diners / Party Size */}
              <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Diners
                </label>
                <select
                  value={dinnerGuests}
                  onChange={(e) => setDinnerGuests(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                >
                  <option value={1} className="bg-slate-900 text-white">1 Diner</option>
                  <option value={2} className="bg-slate-900 text-white">2 Diners (Couple)</option>
                  <option value={3} className="bg-slate-900 text-white">3 Diners</option>
                  <option value={4} className="bg-slate-900 text-white">4 Diners (Salon)</option>
                  <option value={5} className="bg-slate-900 text-white">5 Diners</option>
                  <option value={6} className="bg-slate-900 text-white">6+ Diners (Banquet)</option>
                </select>
              </div>
            </div>

            {/* Dining Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 justify-center">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Book Dinner Table</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const diningEl = document.getElementById('dining');
                  if (diningEl) diningEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-semibold text-[11px] uppercase tracking-wider transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Tasting Menus ↓</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 3. TRACK & LOOKUP RESERVATION PANEL                           */}
      {/* ============================================================== */}
      {activeTab === 'track' && (
        <form onSubmit={handleTrackerSubmit} className="animate-fade-in space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
            
            <div className="sm:col-span-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all focus-within:border-amber-400/50">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Booking Reference or Guest Email
              </label>
              <input
                type="text"
                placeholder="e.g. AUR-10492 or your-email@domain.com"
                value={trackerCodeInput}
                onChange={(e) => setTrackerCodeInput(e.target.value)}
                className="w-full bg-transparent text-white font-mono text-sm placeholder:text-stone-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <Search className="w-4 h-4" />
                <span>Check Booking Status</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* FOOTER QUICK LINKS */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {activeTab === 'stay' && "Complimentary airport limousine & champagne welcome included with palatial residences."}
            {activeTab === 'dining' && "Private table lock guaranteed with sommelier consultation on arrival."}
            {activeTab === 'track' && "Real-time sync with hotel concierge ledger and instant email notifications."}
          </span>
        </div>

        {activeTab !== 'track' && (
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className="text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
          >
            <span>Have a reservation code? Check booking status</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

    </div>
  );
};

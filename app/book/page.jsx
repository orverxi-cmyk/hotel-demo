'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../src/components/Navbar';
import { Footer } from '../../src/components/Footer';
import { useBooking } from '../../src/context/BookingContext';
import { useTheme } from '../../src/context/ThemeContext';
import { initialDiningVenues } from '../../src/data/initialData';
import { 
  Calendar, 
  Users, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Printer, 
  BedDouble, 
  Utensils, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Home
} from 'lucide-react';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    rooms, 
    diningVenues, 
    createReservation, 
    getRoomAvailability, 
    isTableAvailable,
    showNotification 
  } = useBooking();
  const { theme } = useTheme();

  // Booking Type: 'stay' | 'dining'
  const initialType = searchParams.get('type') === 'dining' ? 'dining' : 'stay';
  const initialRoomId = searchParams.get('room') || searchParams.get('roomId') || '';
  const initialVenueId = searchParams.get('venue') || searchParams.get('venueId') || '';

  const [bookingType, setBookingType] = useState(initialType);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // --- STAY STATE ---
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(2);

  // --- DINING STATE ---
  const venuesList = (diningVenues && diningVenues.length > 0) ? diningVenues : initialDiningVenues;
  const [selectedVenueId, setSelectedVenueId] = useState(venuesList[0]?.id || 'dining-1');
  const [diningDate, setDiningDate] = useState('');
  const [diningTimeSlot, setDiningTimeSlot] = useState('19:30');
  const [diningGuests, setDiningGuests] = useState(2);
  const [selectedTableNumber, setSelectedTableNumber] = useState('');

  // --- GUEST CONTACT DETAILS ---
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    specialRequests: ''
  });

  // Initialize dates and room/venue selection
  useEffect(() => {
    // Dates default: checkIn = tomorrow, checkOut = in 4 days
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const fourDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
    setCheckIn(tomorrow);
    setCheckOut(fourDaysLater);
    setDiningDate(tomorrow);

    // Initial Room selection
    if (initialRoomId && rooms.some(r => r.id === initialRoomId)) {
      setSelectedRoomId(initialRoomId);
    } else if (rooms && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }

    // Initial Venue selection
    if (initialVenueId && venuesList.some(v => v.id === initialVenueId)) {
      setSelectedVenueId(initialVenueId);
    }
  }, [rooms, initialRoomId, initialVenueId]);

  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0] || null;
  const activeVenue = venuesList.find(v => v.id === selectedVenueId) || venuesList[0] || null;

  // Initialize selected table for active venue
  useEffect(() => {
    if (activeVenue?.tables && activeVenue.tables.length > 0) {
      const currentAvailable = activeVenue.tables.find(t => 
        isTableAvailable ? isTableAvailable(activeVenue.id, diningDate, diningTimeSlot, t.number) : true
      ) || activeVenue.tables[0];
      setSelectedTableNumber(currentAvailable?.number || '');
    }
  }, [activeVenue, diningDate, diningTimeSlot]);

  // Calculations for Stay
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomBaseTotal = (activeRoom?.price || 0) * nights;
  const diningTotalAmount = (diningGuests || 2) * 125; // standard gourmet seating tasting per guest

  // Stage 1 Validation
  const handleProceedToGuestDetails = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (bookingType === 'stay') {
      if (!selectedRoomId) {
        showNotification("Please select a suite or villa.", "error");
        return;
      }
      if (!checkIn || !checkOut) {
        showNotification("Please select valid check-in and check-out dates.", "error");
        return;
      }
      if (new Date(checkIn) >= new Date(checkOut)) {
        showNotification("Check-out date must be after check-in date.", "error");
        return;
      }
      if (getRoomAvailability) {
        const { isAvailable } = getRoomAvailability(selectedRoomId, checkIn, checkOut);
        if (!isAvailable) {
          showNotification("Selected suite is fully booked for these dates. Please choose alternative dates.", "error");
          return;
        }
      }
    } else {
      if (!selectedVenueId || !diningDate || !diningTimeSlot) {
        showNotification("Please fill in your dining reservation details.", "error");
        return;
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stage 2 Validation
  const handleProceedToReview = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!guestDetails.name.trim()) {
      showNotification("Please provide your full name.", "error");
      return;
    }
    if (!guestDetails.email.trim() || !guestDetails.email.includes('@')) {
      showNotification("Please provide a valid email address.", "error");
      return;
    }
    if (!guestDetails.phone.trim()) {
      showNotification("Please provide your phone number.", "error");
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stage 3 Final Submission
  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (bookingType === 'stay') {
        const payload = {
          bookingType: 'stay',
          guestName: guestDetails.name.trim(),
          guestEmail: guestDetails.email.trim(),
          guestPhone: guestDetails.phone.trim(),
          country: guestDetails.country.trim() || 'International',
          roomId: activeRoom.id,
          roomName: activeRoom.name,
          roomLocation: activeRoom.location,
          quantity: 1,
          checkIn,
          checkOut,
          nights,
          guests: guestCount,
          roomPrice: activeRoom.price,
          totalAmount: roomBaseTotal,
          addons: [],
          specialRequests: guestDetails.specialRequests.trim()
        };

        const res = await createReservation(payload);
        setConfirmedBooking(res);
        setStep(4);
      } else {
        const selectedTableObj = activeVenue?.tables?.find(t => t.number === selectedTableNumber) || {
          number: selectedTableNumber || 'T-1',
          name: 'Signature Terrace Table',
          location: 'Main Dining Room'
        };

        const payload = {
          bookingType: 'dining',
          guestName: guestDetails.name.trim(),
          guestEmail: guestDetails.email.trim(),
          guestPhone: guestDetails.phone.trim(),
          country: guestDetails.country.trim() || 'International',
          venueId: activeVenue.id,
          venueName: activeVenue.name,
          venueLocation: activeVenue.location,
          tableNumber: selectedTableObj.number,
          tableName: selectedTableObj.name,
          tableLocation: selectedTableObj.location,
          date: diningDate,
          timeSlot: diningTimeSlot,
          guests: diningGuests,
          totalAmount: diningTotalAmount,
          addons: [],
          specialRequests: guestDetails.specialRequests.trim()
        };

        const res = await createReservation(payload);
        setConfirmedBooking(res);
        setStep(4);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Booking error:", err);
      showNotification(err.message || "Failed to finalize reservation. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative">
        {/* Background Ambient Luxury Accents */}
        <div 
          className="absolute top-10 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-15 pointer-events-none"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
        <div 
          className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] opacity-10 pointer-events-none"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* PAGE BANNER HEADER */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-white/10 text-amber-300 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Direct Booking</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              {step === 4 
                ? "Reservation Confirmed" 
                : bookingType === 'stay' 
                  ? "Reserve Your Sanctuary" 
                  : "Book a Table for Dinner"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-light">
              {step === 4
                ? "Your booking has been received and confirmed in our direct guest registry."
                : "Best direct rate guaranteed with real-time confirmation and complimentary concierge arrival welcome."}
            </p>
          </div>

          {/* STAGE PROGRESS STEPPER (Visible during Steps 1-3) */}
          {step < 4 && (
            <div className="mb-10">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
                {[
                  { num: 1, label: bookingType === 'stay' ? '1. Dates & Suite' : '1. Date & Table' },
                  { num: 2, label: '2. Guest Details' },
                  { num: 3, label: '3. Review & Confirm' }
                ].map((s) => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;

                  return (
                    <button
                      key={s.num}
                      type="button"
                      disabled={step < s.num}
                      onClick={() => {
                        if (step > s.num) setStep(s.num);
                      }}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                        isActive
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-lg'
                          : isCompleted
                            ? 'border-white/20 bg-white/5 text-stone-200 hover:bg-white/10 cursor-pointer'
                            : 'border-white/10 bg-white/5 text-stone-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isCompleted 
                          ? 'bg-amber-400 text-slate-950' 
                          : isActive 
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/40' 
                            : 'bg-white/10 text-stone-400'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 1: DATES & SELECTION                                     */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Category Switcher Tabs (Stay vs Dining) */}
              <div className="flex items-center justify-center">
                <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setBookingType('stay')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      bookingType === 'stay'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                    <span>Suites & Villas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('dining')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      bookingType === 'dining'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Dining Table</span>
                  </button>
                </div>
              </div>

              {/* STAY SELECTION: DATES & SUITE CARDS */}
              {bookingType === 'stay' ? (
                <div className="space-y-8">
                  
                  {/* Date & Guest Inputs */}
                  <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
                    <h2 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Select Stay Dates & Guests</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Check-In */}
                      <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 focus-within:border-amber-400/50">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                          Check-In Date
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                          required
                        />
                      </div>

                      {/* Check-Out */}
                      <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 focus-within:border-amber-400/50">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                          Check-Out Date
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                          required
                        />
                      </div>

                      {/* Guests */}
                      <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 focus-within:border-amber-400/50">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                          Guests
                        </label>
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                        >
                          <option value={1} className="bg-slate-900 text-white">1 Guest</option>
                          <option value={2} className="bg-slate-900 text-white">2 Guests</option>
                          <option value={3} className="bg-slate-900 text-white">3 Guests</option>
                          <option value={4} className="bg-slate-900 text-white">4 Guests</option>
                          <option value={6} className="bg-slate-900 text-white">5+ Guests (Villa)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                      <span>Stay Duration: <strong className="text-white">{nights} {nights === 1 ? 'Night' : 'Nights'}</strong></span>
                      <span className="text-amber-300 font-mono text-[11px]">Best Direct Rate Applied</span>
                    </div>
                  </div>

                  {/* Visual Suite Selection Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-amber-400" />
                        <span>Choose Your Suite or Villa</span>
                      </h2>
                      <span className="text-xs text-stone-400 font-mono">
                        {rooms.length} Sanctuaries Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {rooms.map((room) => {
                        const isSelected = selectedRoomId === room.id;
                        const roomTotal = room.price * nights;

                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`group cursor-pointer rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-400 bg-slate-900 ring-2 ring-amber-400/30 shadow-2xl shadow-amber-500/10'
                                : 'border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-white/30'
                            }`}
                          >
                            <div className="relative h-48 overflow-hidden bg-slate-950">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                              
                              {/* Selection badge */}
                              <div className="absolute top-3 right-3">
                                {isSelected ? (
                                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-lg">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Selected</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white border border-white/20 backdrop-blur-md">
                                    Click to Select
                                  </span>
                                )}
                              </div>

                              <div className="absolute bottom-3 left-3 text-xs text-stone-300 font-mono bg-black/60 px-2.5 py-0.5 rounded-lg border border-white/15">
                                {room.category || 'Luxury Suite'} • {room.size}
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1.5">
                                <h3 className={`font-serif text-xl font-bold transition-colors ${
                                  isSelected ? 'text-amber-300' : 'text-white'
                                }`}>
                                  {room.name}
                                </h3>
                                <p className="text-xs text-stone-400 font-light line-clamp-2">
                                  {room.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] uppercase font-mono text-stone-400 block">Rate</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-serif text-2xl font-bold text-white">
                                      {theme.currency}{room.price}
                                    </span>
                                    <span className="text-xs text-stone-400">/ night</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] uppercase font-mono text-stone-400 block">
                                    Total for {nights} {nights === 1 ? 'Night' : 'Nights'}
                                  </span>
                                  <span className="font-serif text-xl font-bold text-amber-300">
                                    {theme.currency}{roomTotal}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                /* DINING SELECTION: VENUE, DATE, TIME, TABLE */
                <div className="space-y-6 bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>Dining Venue & Seating Details</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Venue */}
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                        Restaurant Venue
                      </label>
                      <select
                        value={selectedVenueId}
                        onChange={(e) => setSelectedVenueId(e.target.value)}
                        className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                      >
                        {venuesList.map(v => (
                          <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                            {v.name} ({v.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                        Reservation Date
                      </label>
                      <input
                        type="date"
                        value={diningDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDiningDate(e.target.value)}
                        className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                      />
                    </div>

                    {/* Time Slot */}
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                        Seating Time
                      </label>
                      <select
                        value={diningTimeSlot}
                        onChange={(e) => setDiningTimeSlot(e.target.value)}
                        className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                      >
                        {((activeVenue?.timeSlots && activeVenue.timeSlots.length > 0) 
                          ? activeVenue.timeSlots 
                          : ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"]
                        ).map(t => (
                          <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guests */}
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                        Diners / Party Size
                      </label>
                      <select
                        value={diningGuests}
                        onChange={(e) => setDiningGuests(Number(e.target.value))}
                        className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map(n => (
                          <option key={n} value={n} className="bg-slate-900 text-white">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar (Proceed to Stage 2) */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                <div>
                  <span className="text-[11px] font-mono uppercase text-stone-400 block">Selected Sanctuary</span>
                  <div className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                    <span>{bookingType === 'stay' ? activeRoom?.name : activeVenue?.name}</span>
                    <span className="text-amber-300 text-sm font-sans font-semibold">
                      ({theme.currency}{bookingType === 'stay' ? roomBaseTotal : diningTotalAmount} total)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToGuestDetails}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 2: GUEST DETAILS & FOLIO                                 */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
              <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Guest Contact & Folio Information</h2>
                  <p className="text-xs text-stone-300 mt-1">
                    Your official confirmation, reservation code, and check-in welcome details will be dispatched to this email.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={guestDetails.name}
                      onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                      placeholder="e.g. Lord Alexander Montgomery"
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                        placeholder="guest@example.com"
                        required
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-sm"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                        placeholder="+39 0789 98765"
                        required
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Country of Residence
                    </label>
                    <input
                      type="text"
                      value={guestDetails.country}
                      onChange={(e) => setGuestDetails({ ...guestDetails, country: e.target.value })}
                      placeholder="e.g. United Kingdom / United States"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-sm"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Special Requests / Arrival Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      placeholder="Dietary preferences, estimated arrival time, limousine transfer requests..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-sm"
                    />
                  </div>
                </div>

                {/* Back / Continue Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToReview}
                    className="px-6 py-3 rounded-full text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 3: REVIEW & CONFIRMATION                                 */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
              <div className="bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Review & Confirm Your Reservation</h2>
                  <p className="text-xs text-stone-300 mt-1">
                    Please verify your details below. No upfront payment required in demo mode; real-time confirmation will be generated immediately.
                  </p>
                </div>

                {/* Selected Item Summary */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <img
                    src={bookingType === 'stay' ? activeRoom?.image : activeVenue?.image}
                    alt={bookingType === 'stay' ? activeRoom?.name : activeVenue?.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-amber-300 block">
                      {bookingType === 'stay' ? activeRoom?.category : activeVenue?.type}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white truncate">
                      {bookingType === 'stay' ? activeRoom?.name : activeVenue?.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {bookingType === 'stay' ? activeRoom?.location : activeVenue?.location}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-stone-400 block text-[10px] uppercase font-mono">
                      {bookingType === 'stay' ? 'Check-In' : 'Date'}
                    </span>
                    <strong className="text-white text-sm">{bookingType === 'stay' ? checkIn : diningDate}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-stone-400 block text-[10px] uppercase font-mono">
                      {bookingType === 'stay' ? 'Check-Out' : 'Time'}
                    </span>
                    <strong className="text-white text-sm">{bookingType === 'stay' ? checkOut : diningTimeSlot}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-stone-400 block text-[10px] uppercase font-mono">Guests</span>
                    <strong className="text-white text-sm">{bookingType === 'stay' ? guestCount : diningGuests} Guests</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-stone-400 block text-[10px] uppercase font-mono">Duration</span>
                    <strong className="text-white text-sm">{bookingType === 'stay' ? `${nights} Nights` : 'Evening Seating'}</strong>
                  </div>
                </div>

                {/* Guest Contact Summary */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block">Folio Contact</span>
                  <div className="text-white font-semibold text-sm">{guestDetails.name}</div>
                  <div className="text-stone-300">{guestDetails.email} • {guestDetails.phone}</div>
                  {guestDetails.specialRequests && (
                    <div className="text-stone-400 text-[11px] pt-1 italic">
                      Special Requests: "{guestDetails.specialRequests}"
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">Total Estimated Amount</span>
                    <span className="text-xs text-emerald-400 font-mono">● Best Direct Guarantee</span>
                  </div>
                  <div className="font-serif text-3xl font-bold text-amber-300">
                    {theme.currency}{bookingType === 'stay' ? roomBaseTotal : diningTotalAmount}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalConfirm}
                    className="px-8 py-3.5 rounded-full text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    {isSubmitting ? (
                      <span>Confirming Reservation...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm Reservation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 4: CONFIRMATION SUCCESS VIEW                             */}
          {/* ============================================================== */}
          {step === 4 && confirmedBooking && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-emerald-500/30 shadow-2xl text-center space-y-6">
                
                {/* Success Icon */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase text-emerald-400 tracking-widest font-semibold">
                    Direct Booking Confirmed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    Thank You, {confirmedBooking.guestName}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                    Your official direct reservation is confirmed. We look forward to welcoming you to {theme?.hotelName || "The Grand Aurelia"}.
                  </p>
                </div>

                {/* Reference Code Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block">
                    Official Reservation Code
                  </span>
                  <div className="text-2xl font-mono font-bold text-amber-300 tracking-wider">
                    {confirmedBooking.id}
                  </div>
                  <span className="text-[10px] text-stone-400 block">
                    Dispatched to {confirmedBooking.guestEmail}
                  </span>
                </div>

                {/* Summary Table */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
                  <div className="flex justify-between pb-2 border-b border-white/10 font-medium">
                    <span className="text-stone-400">Reserved Sanctuary:</span>
                    <span className="text-white font-semibold">{confirmedBooking.roomName || confirmedBooking.venueName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/10 font-medium">
                    <span className="text-stone-400">Dates / Time:</span>
                    <span className="text-white font-semibold">
                      {confirmedBooking.bookingType === 'stay' 
                        ? `${confirmedBooking.checkIn} to ${confirmedBooking.checkOut} (${confirmedBooking.nights} nights)`
                        : `${confirmedBooking.date} at ${confirmedBooking.timeSlot}`}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/10 font-medium">
                    <span className="text-stone-400">Party Size:</span>
                    <span className="text-white font-semibold">{confirmedBooking.guests} Guests</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold">
                    <span className="text-stone-300">Total Confirmed:</span>
                    <span className="text-amber-300 font-serif">{theme.currency}{confirmedBooking.totalAmount}</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/15"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Confirmation</span>
                  </button>

                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <Home className="w-4 h-4" />
                    <span>Return to Homepage</span>
                  </Link>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-sm font-mono text-amber-300 animate-pulse">Loading reservation suite...</div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}

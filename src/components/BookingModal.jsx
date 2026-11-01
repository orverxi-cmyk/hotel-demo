'use client';

import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { availableAddons, availableDiningAddons, initialDiningVenues } from '../data/initialData';
import { 
  X, 
  Calendar, 
  Users, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Printer, 
  Mail, 
  Search,
  BedDouble,
  Utensils,
  MapPin,
  Clock,
  AlertCircle,
  Award,
  Info,
  CheckCircle2
} from 'lucide-react';

export const BookingModal = () => {
  const { 
    isBookingModalOpen, 
    closeBookingModal, 
    bookingMode,
    setBookingMode,
    selectedRoom, 
    rooms, 
    diningVenues,
    selectedVenue,
    selectedTableNumber,
    searchParams,
    createReservation,
    openTrackerModal,
    getRoomAvailability,
    getDiningAvailability,
    isTableAvailable,
    showNotification
  } = useBooking();
  const { theme } = useTheme();

  // Wizard Step
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // --- STAY STATE ---
  const [activeRoom, setActiveRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // --- DINING STATE ---
  const [activeDiningVenue, setActiveDiningVenue] = useState(null);
  const [diningDate, setDiningDate] = useState('');
  const [diningTimeSlot, setDiningTimeSlot] = useState('');
  const [diningGuests, setDiningGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDiningAddons, setSelectedDiningAddons] = useState([]);

  // --- COMMON GUEST DETAILS ---
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    specialRequests: ''
  });

  // Sync state whenever modal opens or defaults change
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setConfirmedBooking(null);

      // Initialize Stay State
      const currentRoom = selectedRoom || rooms[0] || null;
      setActiveRoom(currentRoom);
      const defaultCheckIn = searchParams.checkIn || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
      const defaultCheckOut = searchParams.checkOut || new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0];
      setCheckIn(defaultCheckIn);
      setCheckOut(defaultCheckOut);
      setGuestCount(searchParams.guests || 2);
      setRoomQuantity(1);
      setSelectedAddons([]);

      // Initialize Dining State
      const venuesList = (diningVenues && diningVenues.length > 0) ? diningVenues : initialDiningVenues;
      const currentVenue = selectedVenue || venuesList[0];
      setActiveDiningVenue(currentVenue);
      const defaultDiningDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      setDiningDate(defaultDiningDate);
      const defaultSlot = (currentVenue?.timeSlots && currentVenue.timeSlots[0]) ? currentVenue.timeSlots[0] : "19:30";
      setDiningTimeSlot(defaultSlot);
      setDiningGuests(2);
      setSelectedDiningAddons([]);

      // Find initial table if specified
      if (currentVenue?.tables && selectedTableNumber) {
        const found = currentVenue.tables.find(t => t.number === selectedTableNumber);
        setSelectedTable(found || null);
      } else if (currentVenue?.tables && currentVenue.tables.length > 0) {
        setSelectedTable(currentVenue.tables[0]);
      } else {
        setSelectedTable(null);
      }

      // Guest details reset
      setGuestDetails({
        name: '',
        email: '',
        phone: '',
        country: '',
        specialRequests: ''
      });
    }
  }, [isBookingModalOpen, selectedRoom, selectedVenue, selectedTableNumber, rooms, diningVenues, searchParams]);

  if (!isBookingModalOpen) return null;

  // --- CALCULATIONS FOR STAY ---
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomAvailability = activeRoom 
    ? getRoomAvailability(activeRoom.id, checkIn, checkOut)
    : { totalQuantity: 2, bookedCount: 0, remainingCount: 2, isAvailable: true };

  const roomBaseTotal = (activeRoom?.price || 0) * nights * roomQuantity;

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = availableAddons.find(a => a.id === addonId);
    if (!addon) return sum;
    if (addon.priceType.includes('per guest / day')) {
      return sum + (addon.price * guestCount * nights);
    }
    return sum + addon.price;
  }, 0);

  const staySubtotal = roomBaseTotal + addonsTotal;
  const stayLuxuryTax = Math.round(staySubtotal * 0.10); // 10% tax
  const stayGrandTotal = staySubtotal + stayLuxuryTax;

  // --- CALCULATIONS FOR DINING ---
  const diningAvailability = (activeDiningVenue && diningDate && diningTimeSlot)
    ? getDiningAvailability(activeDiningVenue.id, diningDate, diningTimeSlot)
    : { reservedTableNumbers: [], availableTables: activeDiningVenue?.tables || [], totalTables: 6, isFullyBooked: false };

  const diningAddonsTotal = selectedDiningAddons.reduce((sum, addonId) => {
    const addon = availableDiningAddons.find(a => a.id === addonId);
    if (!addon) return sum;
    if (addon.priceType.includes('per guest')) {
      return sum + (addon.price * diningGuests);
    }
    return sum + addon.price;
  }, 0);

  const diningTotalAmount = diningAddonsTotal; // Dining is deposit-free demo with add-ons

  // Addon Toggles
  const toggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleDiningAddon = (id) => {
    setSelectedDiningAddons(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // --- FORM SUBMIT HANDLER ---
  const handleConfirmReservation = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (bookingMode === 'stay') {
        if (!activeRoom) throw new Error("Please select a suite.");
        if (roomQuantity > roomAvailability.remainingCount) {
          throw new Error(`Only ${roomAvailability.remainingCount} suite(s) available for the selected dates.`);
        }

        const reservationPayload = {
          bookingType: 'stay',
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          country: guestDetails.country,
          roomId: activeRoom.id,
          roomName: activeRoom.name,
          roomLocation: activeRoom.location,
          quantity: roomQuantity,
          checkIn,
          checkOut,
          nights,
          guests: guestCount,
          roomPrice: activeRoom.price,
          totalAmount: stayGrandTotal,
          addons: selectedAddons.map(id => availableAddons.find(a => a.id === id)?.name).filter(Boolean),
          specialRequests: guestDetails.specialRequests
        };

        const res = await createReservation(reservationPayload);
        setConfirmedBooking(res);
        setStep(4);
      } else {
        // Dining Reservation
        if (!activeDiningVenue) throw new Error("Please select a dining venue.");
        if (!selectedTable) throw new Error("Please choose an available table.");
        if (!isTableAvailable(activeDiningVenue.id, diningDate, diningTimeSlot, selectedTable.number)) {
          throw new Error(`Table ${selectedTable.number} is already reserved for ${diningTimeSlot}. Please pick another table.`);
        }

        const diningPayload = {
          bookingType: 'dining',
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          country: guestDetails.country,
          venueId: activeDiningVenue.id,
          venueName: activeDiningVenue.name,
          venueLocation: activeDiningVenue.location,
          tableNumber: selectedTable.number,
          tableName: selectedTable.name,
          tableLocation: selectedTable.location,
          date: diningDate,
          timeSlot: diningTimeSlot,
          guests: diningGuests,
          totalAmount: diningTotalAmount,
          addons: selectedDiningAddons.map(id => availableDiningAddons.find(a => a.id === id)?.name).filter(Boolean),
          specialRequests: guestDetails.specialRequests
        };

        const res = await createReservation(diningPayload);
        setConfirmedBooking(res);
        setStep(4);
      }
    } catch (err) {
      console.error("Booking error:", err);
      showNotification(err.message || "Failed to complete reservation", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const venuesList = (diningVenues && diningVenues.length > 0) ? diningVenues : initialDiningVenues;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div 
          className="p-5 sm:p-6 text-white flex items-center justify-between shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold block">
              {theme.hotelName} • Official Reservation Engine
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
              {step === 4 
                ? (bookingMode === 'dining' ? 'Dining Reservation Confirmed' : 'Sanctuary Stay Confirmed') 
                : (bookingMode === 'dining' ? 'Reserve Michelin Dining & Tasting Table' : 'Book Your Palatial Residency')}
            </h3>
          </div>

          <button
            onClick={closeBookingModal}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Mode Switcher: Suites & Villas VS Dining & Tables (Only in steps 1-3) */}
        {step < 4 && (
          <div className="bg-stone-900 px-6 py-2.5 flex items-center justify-between border-b border-stone-800 text-xs shrink-0">
            <span className="text-stone-400 font-medium hidden sm:inline">Reservation Category:</span>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setBookingMode('stay');
                  setStep(1);
                }}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  bookingMode === 'stay'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>Luxury Suites & Villas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingMode('dining');
                  setStep(1);
                }}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  bookingMode === 'dining'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Michelin Dining & Tables</span>
              </button>
            </div>
          </div>
        )}

        {/* Step Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between text-xs font-semibold shrink-0">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-amber-400 text-slate-950' : 'bg-stone-200 text-stone-600'}`}>1</span>
              <span>{bookingMode === 'dining' ? 'Venue & Table Selection' : 'Stay & Suite Inventory'}</span>
            </div>
            <div className="w-8 h-px bg-stone-300" />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-amber-400 text-slate-950' : 'bg-stone-200 text-stone-600'}`}>2</span>
              <span>{bookingMode === 'dining' ? 'Bespoke Pairings' : 'Luxury Add-Ons'}</span>
            </div>
            <div className="w-8 h-px bg-stone-300" />
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-amber-400 text-slate-950' : 'bg-stone-200 text-stone-600'}`}>3</span>
              <span>Guest Details & Folio</span>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================== */}
          {/* 1. ACCOMMODATION / STAY WORKFLOW                           */}
          {/* ========================================================== */}
          {bookingMode === 'stay' && (
            <>
              {/* STEP 1: Dates, Suite, Location, Quantity & Real-Time Availability */}
              {step === 1 && activeRoom && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Selected Suite Preview Card */}
                  <div className="flex flex-col md:flex-row gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-200 items-start">
                    <img 
                      src={activeRoom.image} 
                      alt={activeRoom.name} 
                      className="w-full md:w-44 h-32 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {activeRoom.category}
                        </span>
                        <span className="font-serif text-xl font-bold text-slate-900">
                          {theme.currency}{activeRoom.price} <span className="text-xs font-normal text-stone-500">/ night</span>
                        </span>
                      </div>
                      
                      <h4 className="font-serif text-lg font-bold text-slate-900">{activeRoom.name}</h4>
                      
                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="font-medium truncate">
                          <strong>Location:</strong> {activeRoom.location || "North Cliffside Wing — Oceanfront Promontory"}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500">{activeRoom.size} • Up to {activeRoom.guests} Guests • {activeRoom.beds}</p>

                      {/* Suite Switcher Dropdown */}
                      <div className="pt-1">
                        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                          Select Different Suite or Villa
                        </label>
                        <select
                          value={activeRoom.id}
                          onChange={(e) => {
                            const found = rooms.find(r => r.id === e.target.value);
                            if (found) {
                              setActiveRoom(found);
                              setRoomQuantity(1);
                            }
                          }}
                          className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {rooms.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.category}) — {theme.currency}{r.price}/night [Qty: {r.quantity || 2}]
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Date & Guests Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        Check-In Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        Check-Out Date
                      </label>
                      <input
                        type="date"
                        required
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        Number of Guests
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        {[...Array(activeRoom.guests || 4)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* INVENTORY QUANTITY & AVAILABILITY STATUS ENGINE */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-semibold">
                          Inventory & Availability Control
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {roomAvailability.isAvailable ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{roomAvailability.remainingCount} of {roomAvailability.totalQuantity} Suites Available</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Sold Out for Selected Dates (0 of {roomAvailability.totalQuantity} Available)</span>
                            </span>
                          )}
                          <span className="text-xs text-stone-400">
                            ({roomAvailability.bookedCount} currently booked)
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      {roomAvailability.isAvailable && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-800 whitespace-nowrap">
                            Quantity to Book:
                          </label>
                          <select
                            value={roomQuantity}
                            onChange={(e) => setRoomQuantity(Number(e.target.value))}
                            className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {[...Array(roomAvailability.remainingCount)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} {i === 0 ? 'Suite / Villa' : 'Suites / Villas'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {!roomAvailability.isAvailable ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>This room category is fully occupied during {checkIn} to {checkOut}.</strong>
                          <p className="text-[11px] text-rose-700 mt-0.5">Please adjust your check-in dates or choose another suite from the switcher above.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-600 gap-1">
                        <span>Duration: <strong>{nights} {nights === 1 ? 'Night' : 'Nights'}</strong> ({checkIn} → {checkOut})</span>
                        <span>Quantity: <strong>{roomQuantity} {roomQuantity === 1 ? 'Suite' : 'Suites'}</strong> • Subtotal: <strong className="font-serif text-sm text-slate-900">{theme.currency}{roomBaseTotal}</strong></span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* STEP 2: Luxury Add-ons for Stay */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="mb-2">
                    <h4 className="font-serif text-xl font-bold text-slate-900">Elevate Your Residency</h4>
                    <p className="text-xs text-stone-500">Select bespoke privileges and services to accompany your stay.</p>
                  </div>

                  <div className="space-y-3">
                    {availableAddons.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isChecked 
                              ? 'border-amber-400 bg-amber-50/50 shadow-sm' 
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                                isChecked ? 'bg-amber-400 border-amber-500 text-slate-950' : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-slate-900">{addon.name}</h5>
                              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{addon.description}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-serif text-base font-bold text-slate-900">
                              +{theme.currency}{addon.price}
                            </span>
                            <span className="text-[10px] text-stone-400 block uppercase tracking-wider">{addon.priceType}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                    <span>Add-ons selected: <strong>{selectedAddons.length}</strong></span>
                    <span>Add-ons Subtotal: <strong className="font-serif text-sm">{theme.currency}{addonsTotal}</strong></span>
                  </div>
                </div>
              )}

              {/* STEP 3: Guest Details & Pricing Breakdown for Stay */}
              {step === 3 && activeRoom && (
                <form onSubmit={handleConfirmReservation} id="stay-booking-form" className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Primary Guest Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lady Sophia Harrington"
                        value={guestDetails.name}
                        onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sophia@luxury.com"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Direct Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+44 7700 900123"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Country of Residence
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. United Kingdom"
                        value={guestDetails.country}
                        onChange={(e) => setGuestDetails({ ...guestDetails, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Special Requests & Dietary Requirements
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Private airport pickup time, pillow preference, anniversary champagne, allergies..."
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Price Breakdown Bill */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>{activeRoom.name} ({nights} nights × {roomQuantity} suite{roomQuantity > 1 ? 's' : ''} × {theme.currency}{activeRoom.price})</span>
                      <span>{theme.currency}{roomBaseTotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 text-[11px]">
                      <span>Location: {activeRoom.location}</span>
                      <span>{roomQuantity} units</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Selected Luxury Add-ons</span>
                        <span>+{theme.currency}{addonsTotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Hospitality & Resort Tax (10%)</span>
                      <span>+{theme.currency}{stayLuxuryTax}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 flex justify-between font-serif text-base font-bold text-slate-950">
                      <span>Total Amount Due</span>
                      <span>{theme.currency}{stayGrandTotal}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Demo Guarantee: No credit card charged. Booking is logged directly into Firebase CMS.</span>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ========================================================== */}
          {/* 2. MICHELIN DINING & TABLE WORKFLOW                        */}
          {/* ========================================================== */}
          {bookingMode === 'dining' && (
            <>
              {/* STEP 1: Venue, Date, Time Slot, and Interactive Table Grid */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Dining Venue Selector */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                      Choose Gastronomy Destination
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {venuesList.map((venue) => {
                        const isSelected = activeDiningVenue?.id === venue.id;
                        return (
                          <div
                            key={venue.id}
                            onClick={() => {
                              setActiveDiningVenue(venue);
                              if (venue.tables && venue.tables.length > 0) {
                                setSelectedTable(venue.tables[0]);
                              }
                              if (venue.timeSlots && venue.timeSlots.length > 0) {
                                setDiningTimeSlot(venue.timeSlots[0]);
                              }
                            }}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-200'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <div className="relative h-20 rounded-xl overflow-hidden mb-2">
                                <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950">
                                  {venue.accolade}
                                </span>
                              </div>
                              <h5 className="font-serif text-xs font-bold text-slate-900 leading-snug">{venue.name}</h5>
                              <p className="text-[10px] text-stone-500 mt-0.5">{venue.type}</p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1 text-[10px] text-stone-500">
                              <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                              <span className="truncate">{venue.location}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date, Time Slot & Guests */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        Reservation Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={diningDate}
                        onChange={(e) => setDiningDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        Meal Time Slot
                      </label>
                      <select
                        value={diningTimeSlot}
                        onChange={(e) => setDiningTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        {(activeDiningVenue?.timeSlots || ["19:00", "19:30", "20:00", "20:30", "21:00"]).map((slot) => (
                          <option key={slot} value={slot}>
                            {slot} Tasting Seating
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        Party Size
                      </label>
                      <select
                        value={diningGuests}
                        onChange={(e) => setDiningGuests(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* VISUAL INTERACTIVE TABLE SELECTION GRID */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200 pb-2">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Select Table Number & Location</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                            {diningDate} at {diningTimeSlot}
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Live real-time table occupancy. Double-bookings are prevented by the reservation engine.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-semibold">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                        </span>
                        <span className="flex items-center gap-1 text-rose-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Reserved / Occupied
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {(activeDiningVenue?.tables || []).map((table) => {
                        const isReserved = diningAvailability.reservedTableNumbers.includes(table.number);
                        const isSelected = selectedTable?.number === table.number;

                        return (
                          <div
                            key={table.number}
                            onClick={() => {
                              if (!isReserved) {
                                setSelectedTable(table);
                              }
                            }}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                              isReserved
                                ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 shadow-md cursor-pointer'
                                : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-sm cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="font-mono text-xs font-bold text-amber-900 block">
                                  Table {table.number}
                                </span>
                                <h5 className="font-bold text-xs text-slate-900 mt-0.5">{table.name}</h5>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                isReserved 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : isSelected
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isReserved ? 'Reserved' : isSelected ? 'Selected' : 'Available'}
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                              <div className="flex items-center gap-1 text-stone-600">
                                <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                                <span className="truncate">{table.location}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span>Capacity: Up to {table.capacity} Guests</span>
                                {table.badge && (
                                  <span className="text-amber-800 font-semibold">{table.badge}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Table Summary Banner */}
                    {selectedTable && (
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Selected: <strong>Table {selectedTable.number}</strong> ({selectedTable.name}) • <em>{selectedTable.location}</em>
                          </span>
                        </div>
                        <span className="font-semibold text-amber-900">Seats up to {selectedTable.capacity}</span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* STEP 2: Bespoke Dining Addons & Sommelier Pairings */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="mb-2">
                    <h4 className="font-serif text-xl font-bold text-slate-900">Sommelier & Gastronomy Additions</h4>
                    <p className="text-xs text-stone-500">Enhance your tasting experience with cellar grand crus and table surprises.</p>
                  </div>

                  <div className="space-y-3">
                    {availableDiningAddons.map((addon) => {
                      const isChecked = selectedDiningAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleDiningAddon(addon.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isChecked 
                              ? 'border-amber-400 bg-amber-50/50 shadow-sm' 
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                                isChecked ? 'bg-amber-400 border-amber-500 text-slate-950' : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-slate-900">{addon.name}</h5>
                              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{addon.description}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-serif text-base font-bold text-slate-900">
                              +{theme.currency}{addon.price}
                            </span>
                            <span className="text-[10px] text-stone-400 block uppercase tracking-wider">{addon.priceType}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                    <span>Inclusions selected: <strong>{selectedDiningAddons.length}</strong></span>
                    <span>Add-ons Total: <strong className="font-serif text-sm">{theme.currency}{diningAddonsTotal}</strong></span>
                  </div>
                </div>
              )}

              {/* STEP 3: Guest Details & Table Folio for Dining */}
              {step === 3 && activeDiningVenue && selectedTable && (
                <form onSubmit={handleConfirmReservation} id="dining-booking-form" className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Primary Guest Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Contessa Isabella Farnese"
                        value={guestDetails.name}
                        onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="isabella@farnese.it"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Direct Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+39 06 6987 4120"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Country of Residence
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Italy"
                        value={guestDetails.country}
                        onChange={(e) => setGuestDetails({ ...guestDetails, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Dietary Allergies & Special Requests
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Shellfish allergy, vegan preference, anniversary cake candle, quiet table..."
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Dining Reservation Folio Card */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-700 font-semibold">
                      <span>Venue: {activeDiningVenue.name}</span>
                      <span>{activeDiningVenue.accolade}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Table: <strong>Table {selectedTable.number}</strong> ({selectedTable.name})</span>
                      <span>{selectedTable.location}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Date & Seating Slot:</span>
                      <span><strong>{diningDate} at {diningTimeSlot}</strong> ({diningGuests} Guests)</span>
                    </div>
                    {diningAddonsTotal > 0 && (
                      <div className="flex justify-between text-stone-600 pt-1 border-t border-stone-200">
                        <span>Selected Tasting Add-ons:</span>
                        <span>+{theme.currency}{diningAddonsTotal}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-stone-200 flex justify-between font-serif text-base font-bold text-slate-950">
                      <span>Table Reservation Fee</span>
                      <span>Complimentary Demo Guarantee</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant Table Lock: Your selected table number will be immediately secured and protected from double-booking.</span>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ========================================================== */}
          {/* 3. STEP 4: CONFIRMATION SCREEN (FOR BOTH STAY & DINING)   */}
          {/* ========================================================== */}
          {step === 4 && confirmedBooking && (
            <div className="text-center py-4 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold block mb-1">
                  {confirmedBooking.bookingType === 'dining' ? 'Dining Reservation Confirmed' : 'Residency Reserved & Guaranteed'}
                </span>
                <h3 className="font-serif text-3xl font-bold text-slate-900">
                  We look forward to welcoming you!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  A confirmation voucher has been recorded in the central hotel CMS registry.
                </p>
              </div>

              {/* Printable Voucher Card */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-stone-50 border-2 border-dashed border-amber-300 text-left space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Booking Reference</span>
                    <h4 className="font-mono text-xl font-bold text-amber-800 tracking-wider">
                      {confirmedBooking.id}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {confirmedBooking.status}
                  </span>
                </div>

                {confirmedBooking.bookingType === 'dining' ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block">Guest Name</span>
                      <strong className="text-slate-900">{confirmedBooking.guestName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Dining Venue</span>
                      <strong className="text-slate-900">{confirmedBooking.venueName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Table Reserved</span>
                      <strong className="text-amber-900 font-mono">Table {confirmedBooking.tableNumber}</strong>
                      <span className="text-[10px] text-stone-500 block truncate">{confirmedBooking.tableName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Date & Time</span>
                      <strong className="text-slate-900">{confirmedBooking.date} at {confirmedBooking.timeSlot}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-400 block">Location</span>
                      <span className="text-stone-700 font-medium">{confirmedBooking.tableLocation} ({confirmedBooking.venueLocation})</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block">Guest Name</span>
                      <strong className="text-slate-900">{confirmedBooking.guestName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Suite Reserved</span>
                      <strong className="text-slate-900">{confirmedBooking.roomName}</strong>
                      <span className="text-[10px] text-amber-800 font-semibold block">{confirmedBooking.quantity || 1} Suite(s)</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Dates</span>
                      <strong className="text-slate-900">{confirmedBooking.checkIn} → {confirmedBooking.checkOut}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Total Folio</span>
                      <strong className="font-serif text-sm text-slate-900">{theme.currency}{confirmedBooking.totalAmount}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-400 block">Resort Location</span>
                      <span className="text-stone-700 font-medium">{confirmedBooking.roomLocation}</span>
                    </div>
                  </div>
                )}

                {confirmedBooking.addons && confirmedBooking.addons.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 text-xs">
                    <span className="text-stone-400 block mb-1">Inclusions & Add-ons:</span>
                    <p className="text-stone-700 font-medium">{confirmedBooking.addons.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Automated Status Email Alert */}
              <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left flex items-start gap-3 text-xs text-amber-950 shadow-sm">
                <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Status Email Dispatched</strong>
                  <span className="text-amber-900 leading-relaxed block mt-0.5">
                    An automated confirmation notice has been sent to <strong>{confirmedBooking.guestEmail}</strong>. You can track this reservation anytime using your reference code.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeBookingModal();
                    if (openTrackerModal) {
                      openTrackerModal(confirmedBooking.id);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-amber-400 bg-amber-100 hover:bg-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Status & Email Logs</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Return to Resort
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Action Footer for Steps 1-3 */}
        {step < 4 && (
          <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                  {bookingMode === 'dining' ? 'Table Reservation' : 'Total Estimated'}
                </span>
                <span className="font-serif text-lg font-bold text-slate-900">
                  {bookingMode === 'dining' 
                    ? (diningTotalAmount > 0 ? `${theme.currency}${diningTotalAmount}` : 'Complimentary') 
                    : `${theme.currency}${stayGrandTotal}`}
                </span>
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  disabled={bookingMode === 'stay' ? !roomAvailability.isAvailable : !selectedTable}
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:shadow-xl transition-all flex items-center gap-1 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  form={bookingMode === 'stay' ? 'stay-booking-form' : 'dining-booking-form'}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  {isSubmitting 
                    ? 'Securing Folio...' 
                    : (bookingMode === 'dining' ? 'Confirm Table Reservation' : 'Complete & Confirm Stay')}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

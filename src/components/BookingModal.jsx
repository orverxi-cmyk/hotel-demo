'use client';

import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { availableAddons } from '../data/initialData';
import { X, Calendar, Users, Check, Sparkles, ChevronRight, ChevronLeft, ShieldCheck, Printer, Mail, Search } from 'lucide-react';

export const BookingModal = () => {
  const { 
    isBookingModalOpen, 
    closeBookingModal, 
    selectedRoom, 
    rooms, 
    searchParams,
    createReservation,
    openTrackerModal
  } = useBooking();
  const { theme } = useTheme();

  const [step, setStep] = useState(1);
  const [activeRoom, setActiveRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    specialRequests: ''
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal opens or selected room changes
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setConfirmedBooking(null);
      setActiveRoom(selectedRoom || rooms[0] || null);
      setCheckIn(searchParams.checkIn || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
      setCheckOut(searchParams.checkOut || new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]);
      setGuestCount(searchParams.guests || 2);
      setSelectedAddons([]);
      setGuestDetails({
        name: '',
        email: '',
        phone: '',
        country: '',
        specialRequests: ''
      });
    }
  }, [isBookingModalOpen, selectedRoom, rooms, searchParams]);

  if (!isBookingModalOpen || !activeRoom) return null;

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomBaseTotal = activeRoom.price * nights;

  // Calculate Add-ons
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = availableAddons.find(a => a.id === addonId);
    if (!addon) return sum;
    if (addon.priceType.includes('per guest / day')) {
      return sum + (addon.price * guestCount * nights);
    }
    return sum + addon.price;
  }, 0);

  const subtotal = roomBaseTotal + addonsTotal;
  const luxuryTax = Math.round(subtotal * 0.10); // 10% tax
  const grandTotal = subtotal + luxuryTax;

  const toggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reservationPayload = {
      guestName: guestDetails.name,
      guestEmail: guestDetails.email,
      guestPhone: guestDetails.phone,
      country: guestDetails.country,
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      checkIn,
      checkOut,
      nights,
      guests: guestCount,
      roomPrice: activeRoom.price,
      totalAmount: grandTotal,
      addons: selectedAddons.map(id => availableAddons.find(a => a.id === id)?.name).filter(Boolean),
      specialRequests: guestDetails.specialRequests
    };

    try {
      const res = await createReservation(reservationPayload);
      setConfirmedBooking(res);
      setStep(4);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div 
          className="p-5 sm:p-6 text-white flex items-center justify-between shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold block">
              {theme.hotelName} • Official Reservation
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
              {step === 4 ? 'Reservation Confirmed' : 'Book Your Sanctuary'}
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

        {/* Step Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between text-xs font-semibold shrink-0">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-amber-400 text-slate-950' : 'bg-stone-200 text-stone-600'}`}>1</span>
              <span>Stay & Suite</span>
            </div>
            <div className="w-8 h-px bg-stone-300" />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-amber-400 text-slate-950' : 'bg-stone-200 text-stone-600'}`}>2</span>
              <span>Luxury Add-Ons</span>
            </div>
            <div className="w-8 h-px bg-stone-300" />
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-amber-400 text-slate-950' : 'bg-stone-200 text-stone-600'}`}>3</span>
              <span>Guest Details</span>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Dates & Suite Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Selected Suite Preview & Switcher */}
              <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-stone-50 border border-stone-200 items-center">
                <img 
                  src={activeRoom.image} 
                  alt={activeRoom.name} 
                  className="w-full sm:w-36 h-28 object-cover rounded-xl"
                />
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {activeRoom.category}
                    </span>
                    <span className="font-serif text-lg font-bold text-slate-900">
                      {theme.currency}{activeRoom.price} <span className="text-xs font-normal text-stone-500">/ night</span>
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">{activeRoom.name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{activeRoom.size} • Up to {activeRoom.guests} Guests</p>

                  {/* Room Switcher Dropdown */}
                  <div className="mt-3">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Change Suite Selection</label>
                    <select
                      value={activeRoom.id}
                      onChange={(e) => {
                        const found = rooms.find(r => r.id === e.target.value);
                        if (found) setActiveRoom(found);
                      }}
                      className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 focus:outline-none"
                    >
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {theme.currency}{r.price}/night ({r.category})
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

              {/* Live Stay Summary */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Duration: {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </span>
                  <span className="text-stone-500 text-xs">
                    {checkIn} to {checkOut}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold text-slate-950">
                    {theme.currency}{roomBaseTotal}
                  </span>
                  <span className="text-[11px] text-stone-500 block">Room Subtotal</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Luxury Add-ons */}
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

              {/* Total Summary */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                <span>Add-ons selected: <strong>{selectedAddons.length}</strong></span>
                <span>Add-ons Subtotal: <strong className="font-serif text-sm">{theme.currency}{addonsTotal}</strong></span>
              </div>
            </div>
          )}

          {/* STEP 3: Guest Details & Pricing Breakdown */}
          {step === 3 && (
            <form onSubmit={handleConfirmReservation} id="booking-form" className="space-y-6 animate-fade-in">
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
                  <span>{activeRoom.name} ({nights} nights × {theme.currency}{activeRoom.price})</span>
                  <span>{theme.currency}{roomBaseTotal}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Selected Luxury Add-ons</span>
                    <span>+{theme.currency}{addonsTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Hospitality & Resort Tax (10%)</span>
                  <span>+{theme.currency}{luxuryTax}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-serif text-base font-bold text-slate-950">
                  <span>Total Amount Due</span>
                  <span>{theme.currency}{grandTotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Demo Guarantee: No credit card charge. Booking will be logged directly into Firebase CMS.</span>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation Screen */}
          {step === 4 && confirmedBooking && (
            <div className="text-center py-4 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold block mb-1">
                  Reservation Confirmed & Guaranteed
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
                    Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block">Guest Name</span>
                    <strong className="text-slate-900">{confirmedBooking.guestName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Suite</span>
                    <strong className="text-slate-900">{confirmedBooking.roomName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Dates</span>
                    <strong className="text-slate-900">{confirmedBooking.checkIn} → {confirmedBooking.checkOut}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Total</span>
                    <strong className="font-serif text-sm text-slate-900">{theme.currency}{confirmedBooking.totalAmount}</strong>
                  </div>
                </div>

                {confirmedBooking.addons && confirmedBooking.addons.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 text-xs">
                    <span className="text-stone-400 block mb-1">Add-ons:</span>
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
                    An initial status notification has been delivered to <strong>{confirmedBooking.guestEmail}</strong>. You will automatically receive real-time status emails whenever your reservation is confirmed or updated.
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
                  className="px-5 py-2.5 rounded-xl border border-amber-400 bg-amber-100 hover:bg-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Status & Email Logs</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 transition-all shadow-md hover:scale-105 active:scale-95"
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
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-slate-900 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Total Estimated</span>
                <span className="font-serif text-lg font-bold text-slate-900">
                  {theme.currency}{grandTotal}
                </span>
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:shadow-xl transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="booking-form"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  {isSubmitting ? 'Recording Reservation...' : 'Complete & Confirm Stay'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


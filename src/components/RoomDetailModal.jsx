'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { X, Users, Maximize2, Bed, Check, Sparkles, Calendar, ShieldCheck } from 'lucide-react';

export const RoomDetailModal = ({ room, onClose }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-72 sm:h-96 w-full">
          <img 
            src={room.image} 
            alt={room.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex gap-2 mb-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {room.category}
              </span>
              {room.featured && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-slate-950 flex items-center gap-1"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Sparkles className="w-3 h-3" />
                  Signature Suite
                </span>
              )}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">{room.name}</h2>
            <p className="text-stone-300 text-sm mt-1">{room.view}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">Capacity</span>
              <span className="font-serif text-lg font-bold text-slate-900 mt-0.5 block">{room.guests} Guests</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">Dimensions</span>
              <span className="font-serif text-lg font-bold text-slate-900 mt-0.5 block">{room.size}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">Bedding</span>
              <span className="font-serif text-base font-bold text-slate-900 mt-0.5 block">{room.beds}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">Price / Night</span>
              <span className="font-serif text-lg font-bold text-slate-900 mt-0.5 block">{theme.currency}{room.price}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-serif text-xl font-bold text-slate-900 mb-2">Suite Experience</h4>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              {room.description}
            </p>
          </div>

          {/* All Amenities */}
          <div>
            <h4 className="font-serif text-xl font-bold text-slate-900 mb-4">Included Luxury Amenities & Privileges</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50/70 border border-stone-100">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Action Footer */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider block font-semibold">Nightly Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-slate-950">
                  {theme.currency}{room.price}
                </span>
                <span className="text-xs text-stone-500 font-medium">/ night + taxes</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                openBookingModal(room);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve {room.name}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};


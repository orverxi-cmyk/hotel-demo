'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Users, Maximize2, Bed, Check, Sparkles, ChevronRight, Eye, MapPin } from 'lucide-react';

export const RoomCard = ({ room, onSelectDetail }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-stone-200/80 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => onSelectDetail(room)}>
        <img 
          src={room.image} 
          alt={room.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category & Featured Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span 
            className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-white shadow-md backdrop-blur-sm"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {room.category}
          </span>
          {room.featured && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-slate-950 flex items-center gap-1 shadow-md"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <Sparkles className="w-3 h-3" />
              Signature
            </span>
          )}
        </div>

        {/* View / Perspective Tag */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
          <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
            {room.view}
          </span>
          <Link 
            href={`/rooms/${room.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-white transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          {/* Room Specs Header */}
          <div className="flex items-center gap-4 text-xs text-stone-500 font-medium mb-2.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-600" />
              Up to {room.guests} Guests
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-stone-600" />
              {room.size}
            </span>
          </div>

          {/* Room Title */}
          <Link 
            href={`/rooms/${room.id}`}
            className="font-serif text-2xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors mb-1.5 cursor-pointer line-clamp-1 block"
          >
            {room.name}
          </Link>

          {/* Location Badge */}
          {room.location && (
            <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 mb-3">
              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate font-medium">{room.location}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-stone-600 text-sm leading-relaxed mb-5 line-clamp-2">
            {room.description}
          </p>

          {/* Key Amenities */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Book Footer */}
        <div className="pt-5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 block font-semibold">From</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-slate-950">
                {theme.currency}{room.price}
              </span>
              <span className="text-xs text-stone-500 font-medium">/ night</span>
            </div>
          </div>

          <button
            onClick={() => openBookingModal(room)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            <span>Book Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};


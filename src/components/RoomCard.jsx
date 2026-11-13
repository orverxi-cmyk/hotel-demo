'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { Users, Maximize2, Bed, Check, ChevronRight, Eye, MapPin } from 'lucide-react';

export const RoomCard = ({ room, onSelectDetail }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group bg-slate-900/90 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 border border-white/10 hover:border-amber-400/40 flex flex-col backdrop-blur-sm"
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

        {/* View / Perspective Tag */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
          <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
            {room.view}
          </span>
          <Link 
            href={`/rooms/${room.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-white transition-all cursor-pointer"
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
          <div className="flex items-center gap-4 text-xs text-stone-400 font-medium mb-2.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              Up to {room.guests} Guests
            </span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              {room.size}
            </span>
          </div>

          {/* Room Title */}
          <Link 
            href={`/rooms/${room.id}`}
            className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 transition-colors mb-1.5 cursor-pointer line-clamp-1 block"
          >
            {room.name}
          </Link>

          {/* Location Badge */}
          {room.location && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 mb-3">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate font-medium">{room.location}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-stone-300 text-sm leading-relaxed mb-5 line-clamp-2 font-light">
            {room.description}
          </p>

          {/* Key Amenities */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-300">
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-amber-400 border border-white/10"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Book Footer */}
        <div className="pt-5 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold">From</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-white">
                {theme.currency}{room.price}
              </span>
              <span className="text-xs text-stone-400 font-medium">/ night</span>
            </div>
          </div>

          <Link
            href={`/book?room=${room.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            <span>Book Now</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
};


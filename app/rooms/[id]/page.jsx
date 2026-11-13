'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBooking } from '../../../src/context/BookingContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { Navbar } from '../../../src/components/Navbar';
import { Footer } from '../../../src/components/Footer';
import { ArrowLeft, Users, Maximize2, Bed, Check, Sparkles, Calendar, MapPin } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { rooms, openBookingModal } = useBooking();
  const { theme } = useTheme();

  const roomId = params?.id;
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  if (!room) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">Suite Not Found</h2>
        <Link href="/" className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
          Return to All Suites
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col">
      <Navbar onOpenCMS={() => router.push('/admin')} />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <div className="mb-6">
            <Link 
              href="/rooms"
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-slate-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Residences</span>
            </Link>
          </div>

          {/* Hero Image & Title */}
          <div className="relative h-[450px] sm:h-[550px] rounded-3xl overflow-hidden shadow-2xl mb-12">
            <img 
              src={room.image} 
              alt={room.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="flex gap-2 mb-3">
                  <span 
                    className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-white shadow"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {room.category}
                  </span>
                  {room.featured && (
                    <span 
                      className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-slate-950 flex items-center gap-1 shadow"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Signature Residence
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold">{room.name}</h1>
                <p className="text-stone-300 text-sm sm:text-base mt-1 font-light">{room.view}</p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-right shrink-0">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold">Nightly Rate</span>
                <span className="font-serif text-3xl font-bold text-white">
                  {theme.currency}{room.price}
                </span>
                <span className="text-xs text-stone-400 block">/ night + taxes</span>
              </div>
            </div>
          </div>

          {/* Specs & Description Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-10">
              
              {/* Key Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm text-center">
                <div>
                  <span className="text-xs uppercase text-stone-400 font-semibold block">Maximum Capacity</span>
                  <span className="font-serif text-lg font-bold text-slate-900 mt-1 block">{room.guests} Guests</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-stone-400 font-semibold block">Floor Area</span>
                  <span className="font-serif text-lg font-bold text-slate-900 mt-1 block">{room.size}</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-stone-400 font-semibold block">Bed Layout</span>
                  <span className="font-serif text-base font-bold text-slate-900 mt-1 block">{room.beds}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
                <h3 className="font-serif text-2xl font-bold text-slate-900">The Residence Experience</h3>
                <p className="text-stone-600 leading-relaxed text-base">
                  {room.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
                <h3 className="font-serif text-2xl font-bold text-slate-900">Curated Amenities & Privileges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Reservation Action Card */}
            <div>
              <div className="sticky top-28 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
                <div className="border-b border-stone-100 pb-5">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">Guaranteed Best Rate</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-serif text-4xl font-bold text-slate-950">
                      {theme.currency}{room.price}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">/ night</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-stone-600">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Resort Location:</span>
                    <strong className="text-slate-900 text-right max-w-[200px]">{room.location || theme.location}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Total Inventory:</span>
                    <strong className="text-slate-900">{room.quantity || 2} Units Portfolio</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Check-In Time:</span>
                    <strong className="text-slate-900">{theme.checkInTime || '15:00'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Check-Out Time:</span>
                    <strong className="text-slate-900">{theme.checkOutTime || '11:00'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Cancellation:</span>
                    <strong className="text-emerald-700">Free up to 48 hrs prior</strong>
                  </div>
                </div>

                <Link
                  href={`/book?room=${room.id}`}
                  className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve This Residence</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer onOpenCMS={() => router.push('/admin')} />
    </div>
  );
}


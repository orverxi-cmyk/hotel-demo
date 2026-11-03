'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Phone, Mail, Clock, Send, Plane, Compass, CheckCircle } from 'lucide-react';
import { initialSectionHeaders, getCachedSectionHeaders, subscribeSectionHeaders } from '../services/storageService';

export const LocationSection = () => {
  const { theme } = useTheme();
  const [inquirySent, setInquirySent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sectionHeaders, setSectionHeaders] = useState(initialSectionHeaders.location);

  useEffect(() => {
    const cached = getCachedSectionHeaders();
    if (cached && cached.location) {
      setSectionHeaders(cached.location);
    }
    const unsub = subscribeSectionHeaders((all) => {
      if (all && all.location) setSectionHeaders(all.location);
    });
    return () => unsub();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-24 bg-stone-100/70 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span 
            className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
          >
            {sectionHeaders?.eyebrow || "Location & Concierge"}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            {sectionHeaders?.title || "Arrive in Absolute Tranquility"}
          </h2>
          <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
            {sectionHeaders?.subtitle || "Nestled along the emerald coast, easily reachable by helicopter transfer, private yacht dock, or luxury chauffeur."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Details & Map Card */}
          <div className="space-y-6">
            
            {/* Contact cards */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                >
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">Resort Sanctuary Address</h4>
                  <p className="text-stone-600 text-sm mt-1 leading-relaxed">{theme.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                >
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">24/7 Royal Concierge</h4>
                  <p className="text-stone-600 text-sm mt-1">{theme.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                >
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">Direct Inquiries</h4>
                  <p className="text-stone-600 text-sm mt-1">{theme.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                >
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">Check-in / Check-out Times</h4>
                  <p className="text-stone-600 text-sm mt-1">
                    Check-in: <strong>{theme.checkInTime || '15:00'}</strong> • Check-out: <strong>{theme.checkOutTime || '11:00'}</strong>
                  </p>
                </div>
              </div>

            </div>

            {/* Arrival Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
                <Plane className="w-8 h-8 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Private Helipad</span>
                  <span className="text-stone-500">Coordinates: 41°08'N 9°32'E</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
                <Compass className="w-8 h-8 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Deepwater Berth</span>
                  <span className="text-stone-500">Accommodates yachts up to 65m</span>
                </div>
              </div>
            </div>

          </div>

          {/* Direct Concierge Inquiry Form */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl">
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
              Speak with the Royal Concierge
            </h3>
            <p className="text-stone-600 text-sm mb-6">
              Have specific travel requirements, yacht charter inquiries, or bespoke dining requests? Our concierge team will respond within 60 minutes.
            </p>

            {inquirySent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-emerald-900">Inquiry Received</h4>
                <p className="text-emerald-700 text-sm mt-1">
                  Thank you! Our head concierge has received your request and will contact you promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lady Vivienne Montgomery"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Bespoke Request or Inquiry
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your upcoming stay, private event, dietary restrictions, or transport needs..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry to Concierge</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};


'use client';

import React, { useState, useEffect } from 'react';
import { guestReviews } from '../data/initialData';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { getCachedSectionHeaders, subscribeSectionHeaders } from '../services/storageService';

export const ReviewsSection = () => {
  const [sectionHeaders, setSectionHeaders] = useState(getCachedSectionHeaders().reviews);

  useEffect(() => {
    const unsub = subscribeSectionHeaders((all) => {
      if (all && all.reviews) setSectionHeaders(all.reviews);
    });
    return () => unsub();
  }, []);
  return (
    <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span 
          className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
        >
          {sectionHeaders?.eyebrow || "Guest Acclaim"}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          {sectionHeaders?.title || "Praised by Discerning Travelers"}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <span className="font-serif text-xl font-bold text-slate-900 ml-2">
            {sectionHeaders?.ratingScore || "4.98 / 5.0"}
          </span>
          <span className="text-xs text-stone-500 font-medium">
            {sectionHeaders?.ratingCount || "(420+ Verified Residencies)"}
          </span>
        </div>
      </div>

      {/* Reviews Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {guestReviews.map((rev) => (
          <div 
            key={rev.id}
            className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
          >
            <div>
              {/* Quote Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
              >
                <Quote className="w-5 h-5" />
              </div>

              {/* Rating */}
              <div className="flex text-amber-400 mb-3">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Title & Comment */}
              <h4 className="font-serif text-lg font-bold text-slate-900 mb-3">
                "{rev.title}"
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Author info */}
            <div className="pt-6 border-t border-stone-100 flex items-center gap-4">
              <img 
                src={rev.avatar} 
                alt={rev.author} 
                className="w-12 h-12 rounded-full object-cover border-2 border-stone-200"
              />
              <div>
                <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{rev.author}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </h5>
                <p className="text-xs text-stone-500">{rev.location}</p>
                <p className="text-[11px] text-amber-800 font-medium mt-0.5">Stayed at {rev.roomStayed}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};


'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  Images, 
  ArrowRight,
  Share2,
  Check
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const ArticleDetailModal = ({ article, isOpen, onClose }) => {
  const { openBookingModal } = useBooking();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Reset active photo index when article changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [article?.id]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const photos = Array.isArray(article.photos) && article.photos.length > 0
    ? article.photos
    : article.coverImage ? [article.coverImage] : [];

  const nextPhoto = () => {
    if (photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReserve = () => {
    onClose();
    openBookingModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
              {article.category || 'Curated Story'}
            </span>
            {photos.length > 1 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/10 text-stone-300 border border-white/10 font-mono">
                <Images className="w-3.5 h-3.5 text-amber-400" />
                <span>{photos.length} Photos</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
              title="Copy Story Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
              aria-label="Close story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Story Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8 custom-scrollbar">
          
          {/* Article Header & Typography */}
          <div className="space-y-4">
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {article.title}
            </h1>
            
            {article.subtitle && (
              <p className="text-base sm:text-lg text-stone-300 font-light leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {/* Author & Read Time Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-400 pt-2 border-t border-white/10">
              {article.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{article.author}</span>
                </div>
              )}
              {article.date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{article.date}</span>
                </div>
              )}
              {article.readTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{article.readTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* MULTI-PHOTO INTERACTIVE GALLERY VIEW */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-xl group">
                <img
                  src={photos[activePhotoIndex]}
                  alt={`${article.title} - photo ${activePhotoIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {/* Floating photo index badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-xs font-mono text-amber-300">
                  {activePhotoIndex + 1} / {photos.length}
                </div>

                {/* Left/Right Prev/Next Controls */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-lg"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-lg"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Multi-Photo Thumbnail Row (if more than 1 photo) */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {photos.map((photoUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        idx === activePhotoIndex 
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20' 
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photoUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Story Paragraphs */}
          <div className="space-y-5 text-stone-200 text-sm sm:text-base leading-relaxed font-light">
            {article.content ? (
              article.content.split('\n\n').map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p className="italic text-stone-400">Story details coming soon.</p>
            )}
          </div>

          {/* Editorial Inclusions / Highlights */}
          {Array.isArray(article.highlights) && article.highlights.length > 0 && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-semibold block">
                Featured Highlights & Inclusions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-200">
                {article.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-800 to-amber-950/30 border border-amber-400/25 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif text-lg font-bold text-white">Experience This Firsthand</h4>
              <p className="text-xs text-stone-300">Reserve your suite or curate an exclusive bespoke itinerary with our white-glove concierge.</p>
            </div>
            <button
              onClick={handleReserve}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-lg hover:scale-105 transition-all"
            >
              <span>Book Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

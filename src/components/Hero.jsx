'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { BookingSearchBar } from './BookingSearchBar';
import { 
  Star, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  BedDouble, 
  UtensilsCrossed, 
  Sparkles, 
  Ship, 
  Wine, 
  ArrowRight,
  ShieldCheck,
  Award,
  Calendar,
  Maximize2
} from 'lucide-react';
import { 
  loadSliderSlides, 
  initialSliderSlides, 
  getCachedSliderSlides, 
  subscribeSliderSlides 
} from '../services/storageService';

export const Hero = ({ onSelectArticleById }) => {
  const { theme } = useTheme();
  const { openBookingModal } = useBooking();
  
  const [slides, setSlides] = useState(initialSliderSlides);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoPlayDuration = 6500; // 6.5s per slide

  // Load dynamic slides from Firestore / Storage with instant real-time sync
  useEffect(() => {
    // 1. Immediately apply cached slides from localStorage (0 ms)
    const cached = getCachedSliderSlides();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setSlides(cached);
    }
    setMounted(true);

    // 2. Real-time subscription: Firestore onSnapshot + BroadcastChannel + Events
    const unsubscribe = subscribeSliderSlides((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setSlides(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const intervalTime = 50;
    const step = (intervalTime / autoPlayDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, slides.length, autoPlayDuration]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const active = slides[currentSlide] || slides[0] || initialSliderSlides[0];

  return (
    <section 
      className="relative pt-28 pb-16 bg-slate-950 text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glow */}
      <div 
        className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 pointer-events-none"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      />
      <div 
        className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      <div className="w-full px-3 sm:px-6 lg:px-8 relative z-10">

        {/* FULL WIDTH SPLIT HERO: Photo/Video on Left (75%), Text on Right (25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
          
          {/* LEFT COLUMN: 100% CLEAN, UNOBSTRUCTED HIGH-RES PHOTO OR VIDEO (3/4 WIDTH = 75% -> col-span-9) */}
          <div className="lg:col-span-9 relative min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group bg-slate-900 order-1">
            
            {/* Clean Media Container (Supports both Photography and High-Definition Video) */}
            {slides.map((slide, idx) => {
              const isVideo = slide.mediaType === 'video' || (slide.image && (slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') || slide.image.includes('/video/')));
              const isCurrent = idx === currentSlide;

              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
                  }`}
                >
                  {isVideo ? (
                    <video
                      src={slide.videoUrl || slide.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${slide.image})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Subtle Prev / Next Floating Trigger On Photo Sides */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* RIGHT COLUMN: Editorial Details (1/4 WIDTH = 25% -> col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-between bg-slate-900/75 p-5 sm:p-6 lg:p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md order-2">
            
            <div className={`space-y-4 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Hotel & Slide Kicker */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] text-amber-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-mono">{active.number} / {String(slides.length).padStart(2, '0')}</span>
                </div>

                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>

              {/* Service Category Tag */}
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/90 font-bold block">
                {active.badge}
              </span>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug tracking-tight text-white line-clamp-3">
                  {active.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed line-clamp-4">
                  {active.subtitle}
                </p>
              </div>

              {/* Curated Highlights List */}
              <div className="pt-2 space-y-1.5 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase text-stone-400 block tracking-wider">
                  Bespoke Inclusions
                </span>
                <div className="grid grid-cols-1 gap-1 text-xs text-stone-200">
                  {active.highlights?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions & Controls */}
            <div className="space-y-4 pt-4 border-t border-white/10 mt-4">
              
              {/* Primary Call to Action */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (active.ctaAction === 'article' && active.ctaArticleId) {
                      if (onSelectArticleById) {
                        onSelectArticleById(active.ctaArticleId);
                        return;
                      }
                    }
                    if (active.ctaAction === 'url' && active.ctaUrl) {
                      window.location.href = active.ctaUrl;
                      return;
                    }
                    openBookingModal();
                  }}
                  className="w-full py-3 px-4 rounded-xl text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <span>{active.ctaLabel || 'Reserve Experience'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    const isArticle = active.actionType === 'article' || active.actionTarget?.startsWith('article:');
                    if (isArticle) {
                      const artId = active.actionArticleId || active.actionTarget?.replace('article:', '');
                      if (artId && onSelectArticleById) {
                        onSelectArticleById(artId);
                        return;
                      }
                    }
                    if (active.actionTarget) {
                      if (active.actionTarget.startsWith('#')) {
                        const el = document.querySelector(active.actionTarget);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                          return;
                        }
                      }
                      window.location.href = active.actionTarget;
                    } else {
                      const el = document.querySelector('#rooms');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10 text-center cursor-pointer"
                >
                  <span>{active.actionLabel || 'Explore More'}</span>
                </button>
              </div>

              {/* Mini Carousel Controls & Slide indicator */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-stone-400 ml-1">
                    {active.number} <span className="text-stone-600">/</span> {String(slides.length).padStart(2, '0')}
                  </span>
                </div>

                <span className="text-[10px] text-stone-400 italic truncate max-w-[100px]">
                  {theme?.hotelName || 'The Grand Aurelia'}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* AVAILABILITY SEARCH BAR DOCKED BELOW THE SLIDER */}
        <div className="mt-8">
          <BookingSearchBar />
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-stone-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Best Direct Rate Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span>2026 World Luxury Hotel Award</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Flexible Free Cancellation up to 48h</span>
          </div>
        </div>

      </div>

    </section>
  );
};

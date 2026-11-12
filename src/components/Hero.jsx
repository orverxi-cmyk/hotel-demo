'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BookingSearchBar } from './BookingSearchBar';
import {
  initialSliderSlides,
  getCachedSliderSlides,
  subscribeSliderSlides
} from '../services/storageService';

export const Hero = ({ onSelectArticleById: _onSelectArticleById }) => {
  const { theme } = useTheme();
  const [slides, setSlides] = useState(initialSliderSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadingOutSlide, setFadingOutSlide] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const fadeTimerRef = useRef(null);

  const autoPlayDuration = 6500; // 6.5s per slide
  const crossfadeDuration = 1000; // 1s crossfade

  // Load dynamic slides from Firestore / Storage with instant real-time sync
  useEffect(() => {
    const cached = getCachedSliderSlides();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setSlides(cached);
    }

    const unsubscribe = subscribeSliderSlides((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setSlides(updated);
      }
    });

    return () => {
      unsubscribe();
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // Keep slide index within bounds when slides update dynamically
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const transitionToSlide = useCallback((nextIdxOrUpdater) => {
    setCurrentSlide((prevIdx) => {
      const nextIdx = typeof nextIdxOrUpdater === 'function'
        ? nextIdxOrUpdater(prevIdx)
        : nextIdxOrUpdater;

      if (nextIdx === prevIdx) return prevIdx;

      setFadingOutSlide(prevIdx);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        setFadingOutSlide(null);
      }, crossfadeDuration + 50);

      return nextIdx;
    });
  }, []);

  // Auto-play timer (resets cleanly on each slide change)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setTimeout(() => {
      transitionToSlide((curr) => (curr + 1) % slides.length);
    }, autoPlayDuration);

    return () => clearTimeout(timer);
  }, [isPaused, slides.length, currentSlide, autoPlayDuration, transitionToSlide]);

  const goToSlide = (index) => transitionToSlide(index);
  const nextSlide = () => transitionToSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => transitionToSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const isLightPageBg = (() => {
    const bg = theme?.backgroundColor || '#fdfbf7';
    if (typeof bg !== 'string') return true;
    const c = bg.replace('#', '');
    if (c.length !== 6) return true;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return true;
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 >= 160;
  })();

  return (
    <section id="hero-section" className="relative w-full pb-8 sm:pb-12">
      {/* FULL-WIDTH EDGE-TO-EDGE SLIDER (Sits behind fixed Top Navbar) */}
      <div className="relative w-full h-[72vh] sm:h-[82vh] lg:h-[86vh] min-h-[500px] overflow-hidden bg-slate-950 group">
        {slides.map((slide, idx) => {
          const isVideo =
            slide.mediaType === 'video' ||
            (slide.image &&
              (slide.image.endsWith('.mp4') ||
                slide.image.endsWith('.webm') ||
                slide.image.includes('/video/')));
          const isCurrent = idx === currentSlide;
          const isFadingOut = idx === fadingOutSlide && !isCurrent;
          const shouldZoom = isCurrent || isFadingOut;

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent
                  ? 'opacity-100 z-10'
                  : isFadingOut
                    ? 'opacity-0 z-[5] pointer-events-none'
                    : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div
                className={`w-full h-full ${shouldZoom ? 'animate-hero-ken-burns' : ''}`}
                style={
                  shouldZoom
                    ? {
                        animationDuration:
                          slides.length > 1 ? `${autoPlayDuration + crossfadeDuration}ms` : '14000ms',
                        animationIterationCount: slides.length === 1 ? 'infinite' : '1',
                        animationDirection: slides.length === 1 ? 'alternate' : 'normal'
                      }
                    : undefined
                }
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
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Subtle Top & Bottom Scrim for Top Navbar & Indicator Legibility */}
        <div className="absolute inset-0 pointer-events-none z-[15] bg-gradient-to-b from-black/45 via-transparent to-black/40" />

        {/* Minimal Prev / Next Arrow Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="absolute left-4 sm:left-6 top-[46%] -translate-y-1/2 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="absolute right-4 sm:right-6 top-[46%] -translate-y-1/2 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Subtle Bottom Indicator Pills (Above Booking Bar) */}
            <div
              className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide
                      ? 'w-7 bg-amber-400'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* AVAILABILITY & BOOKING SECTION DOCKED AT THE BOTTOM OF THE SLIDER */}
      <div id="booking" className="-mt-12 sm:-mt-16 px-3 sm:px-6 lg:px-8 relative z-20 scroll-mt-28">
        <BookingSearchBar />

        {/* Trust Guarantees */}
        <div className={`mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-medium tracking-wide ${isLightPageBg ? 'text-stone-600' : 'text-stone-400'}`}>
          <span>Best Direct Rate Guaranteed</span>
          <span className="opacity-30">&bull;</span>
          <span>2026 World Luxury Hotel Award</span>
          <span className="opacity-30">&bull;</span>
          <span>Flexible Free Cancellation up to 48h</span>
        </div>
      </div>
    </section>
  );
};

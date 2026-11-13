'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  initialSliderSlides,
  getCachedSliderSlides,
  subscribeSliderSlides
} from '../services/storageService';

export const Hero = ({ onSelectArticleById: _onSelectArticleById }) => {
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

  return (
    <section
      id="hero-section"
      className="relative w-full h-[85vh] sm:h-[92vh] lg:h-screen min-h-[560px] overflow-hidden bg-slate-950 group"
    >
      {/* Full-Width Edge-to-Edge Slides (Sits behind fixed Top Navbar) */}
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

            {/* Dark Scrim overlay for contrast */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Centered Caption Overlay (Fixed crisp typography, does not zoom) */}
            {(slide.title || slide.subtitle || slide.description) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-16 pointer-events-none z-10">
                <div className="max-w-3xl sm:max-w-4xl mx-auto space-y-3 sm:space-y-4">
                  {slide.title && (
                    <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] leading-[1.2]">
                      {slide.title}
                    </h1>
                  )}
                  {(slide.subtitle || slide.description) && (
                    <p className="text-xs sm:text-base md:text-lg text-stone-200/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] line-clamp-3">
                      {slide.subtitle || slide.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Subtle Top & Bottom Scrim for Top Navbar & Indicator Legibility */}
      <div className="absolute inset-0 pointer-events-none z-[15] bg-gradient-to-b from-black/45 via-transparent to-black/35" />

      {/* Minimal Prev / Next Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Subtle Bottom Indicator Pills */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
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
    </section>
  );
};

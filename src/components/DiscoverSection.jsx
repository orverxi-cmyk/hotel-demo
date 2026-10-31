'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Images, 
  BookOpen, 
  ChevronRight,
  Compass
} from 'lucide-react';
import { 
  getCachedArticles, 
  subscribeArticles, 
  initialArticles 
} from '../services/storageService';

export const DiscoverSection = ({ onSelectArticle }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Immediately hydrate with cached articles (0 ms flash-free)
    const cached = getCachedArticles();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setArticles(cached);
    }
    setMounted(true);

    // 2. Real-time subscription to cloud & localStorage updates
    const unsubscribe = subscribeArticles((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setArticles(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleArticles = articles.filter(a => a.visible !== false);

  return (
    <section id="discover" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background ambient accents */}
      <div 
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <div 
        className="absolute bottom-0 right-10 w-96 h-96 rounded-full blur-[180px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-widest text-amber-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Discover & Editorial Stories</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Curated Chronicles of Mediterranean Living
          </h2>

          <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
            Unveil the secrets of our estate: Michelin-starred culinary artistry, Riva yacht charters, ancient subterranean cellars, and holistic botanical wellness.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((article, idx) => {
            const photosCount = Array.isArray(article.photos) ? article.photos.length : 1;
            const isFeatured = idx === 0;

            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle && onSelectArticle(article)}
                className={`group cursor-pointer flex flex-col bg-slate-900/80 rounded-3xl border border-white/10 overflow-hidden hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Cover Image & Photo Count Pill */}
                <div className={`relative overflow-hidden bg-slate-950 ${isFeatured ? 'h-72 sm:h-80' : 'h-60'}`}>
                  <img
                    src={article.coverImage || (article.photos && article.photos[0])}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-slate-950/70 backdrop-blur-md text-amber-300 border border-white/20">
                      {article.category || 'Editorial'}
                    </span>

                    {photosCount > 1 && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-950/70 backdrop-blur-md text-stone-200 border border-white/20">
                        <Images className="w-3.5 h-3.5 text-amber-400" />
                        <span>{photosCount} Photos</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Meta on Image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-xs text-stone-300 font-medium">
                    {article.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{article.readTime}</span>
                      </span>
                    )}
                    {article.date && (
                      <span>• {article.date}</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className={`font-serif font-bold text-white group-hover:text-amber-300 transition-colors leading-snug ${
                      isFeatured ? 'text-2xl sm:text-3xl' : 'text-xl'
                    }`}>
                      {article.title}
                    </h3>
                    <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-3">
                      {article.subtitle}
                    </p>
                  </div>

                  {/* Read Article CTA Link */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Read Story & View Gallery</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};

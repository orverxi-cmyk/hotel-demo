'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../src/components/Navbar';
import { Footer } from '../../src/components/Footer';
import { ArticleDetailModal } from '../../src/components/ArticleDetailModal';
import { 
  getCachedArticles, 
  subscribeArticles, 
  initialArticles 
} from '../../src/services/storageService';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  User, 
  ArrowRight, 
  Images, 
  BookOpen, 
  Search, 
  Compass,
  Filter
} from 'lucide-react';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const queryArticleId = searchParams.get('article');

  const [articles, setArticles] = useState(initialArticles);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Hydrate articles and subscribe to updates
  useEffect(() => {
    const cached = getCachedArticles();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setArticles(cached);
    }

    const unsubscribe = subscribeArticles((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setArticles(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  // If URL has ?article=<articleId>, auto-open that article modal
  useEffect(() => {
    if (queryArticleId && articles.length > 0) {
      const match = articles.find(a => a.id === queryArticleId) || initialArticles.find(a => a.id === queryArticleId);
      if (match) {
        setSelectedArticle(match);
      }
    }
  }, [queryArticleId, articles]);

  // Extract unique categories
  const categories = ['All', ...new Set(articles.map(a => a.category).filter(Boolean))];

  // Filtered articles list
  const filteredArticles = articles.filter(article => {
    if (article.visible === false) return false;
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative">
        {/* Ambient atmospheric glows */}
        <div 
          className="absolute top-10 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px] opacity-15 pointer-events-none"
          style={{ backgroundColor: 'var(--color-secondary, #c5a059)' }}
        />
        <div 
          className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full blur-[180px] opacity-10 pointer-events-none"
          style={{ backgroundColor: 'var(--color-primary, #0f2b48)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4 pt-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-widest text-amber-300">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>The Grand Aurelia Discoveries</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Curated Chronicles of Mediterranean Living
            </h1>

            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
              Immerse yourself in intimate chronicles: Michelin-starred gastronomy, private Riva yacht expeditions, 18th-century subterranean vaults, and botanical wellbeing.
            </p>

            {/* Search and Category Filters */}
            <div className="pt-6 space-y-4 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles, chefs, marine charters, sommeliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 backdrop-blur-md shadow-xl"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, idx) => {
                const photosCount = Array.isArray(article.photos) ? article.photos.length : 1;
                const isFeatured = idx === 0 && activeCategory === 'All' && !searchQuery;

                return (
                  <article
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`group cursor-pointer flex flex-col bg-slate-900/80 rounded-3xl border border-white/10 overflow-hidden hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm ${
                      isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
                    }`}
                  >
                    {/* Cover Image & Multi-Photo Pill */}
                    <div className={`relative overflow-hidden bg-slate-950 ${isFeatured ? 'h-72 sm:h-84' : 'h-64'}`}>
                      <img
                        src={article.coverImage || (article.photos && article.photos[0])}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-slate-950/75 backdrop-blur-md text-amber-300 border border-white/20">
                          {article.category || 'Editorial'}
                        </span>

                        {photosCount > 1 && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-950/75 backdrop-blur-md text-stone-200 border border-white/20">
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

                    {/* Card Content */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className={`font-serif font-bold text-white group-hover:text-amber-300 transition-colors leading-snug ${
                          isFeatured ? 'text-2xl sm:text-3xl' : 'text-xl'
                        }`}>
                          {article.title}
                        </h2>
                        <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-3">
                          {article.subtitle}
                        </p>
                      </div>

                      {/* Footer Link */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Read Full Story & View {photosCount} Photos</span>
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <p className="text-stone-400 text-base">No articles found matching your criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="text-amber-400 hover:text-amber-300 text-xs font-semibold underline"
              >
                Clear search & filters
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Interactive Story Modal with Multi-Photo Gallery */}
      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300 font-mono text-sm">
        Loading Discover Chronicles...
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}


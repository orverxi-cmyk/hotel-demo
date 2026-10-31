'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../src/components/Navbar';
import { Hero } from '../src/components/Hero';
import { RoomsSection } from '../src/components/RoomsSection';
import { AmenitiesSection } from '../src/components/AmenitiesSection';
import { DiningSection } from '../src/components/DiningSection';
import { DiscoverSection } from '../src/components/DiscoverSection';
import { GallerySection } from '../src/components/GallerySection';
import { ReviewsSection } from '../src/components/ReviewsSection';
import { LocationSection } from '../src/components/LocationSection';
import { Footer } from '../src/components/Footer';
import { ArticleDetailModal } from '../src/components/ArticleDetailModal';
import { getCachedArticles, subscribeArticles, initialArticles } from '../src/services/storageService';

export default function HomePage() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState(initialArticles);

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

  const handleSelectArticleById = (articleId) => {
    if (!articleId) return;
    const found = articles.find(a => a.id === articleId) || initialArticles.find(a => a.id === articleId);
    if (found) {
      setSelectedArticle(found);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col relative">
      <Navbar />
      <main className="flex-1">
        <Hero onSelectArticleById={handleSelectArticleById} />
        <RoomsSection />
        <AmenitiesSection />
        <DiningSection />
        <DiscoverSection onSelectArticle={setSelectedArticle} />
        <GallerySection />
        <ReviewsSection />
        <LocationSection />
      </main>
      <Footer />

      {/* Interactive Luxury Article Reader with Multi-Photo Gallery */}
      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

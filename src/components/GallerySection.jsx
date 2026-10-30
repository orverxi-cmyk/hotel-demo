'use client';

import React, { useState } from 'react';
import { X, Eye, Maximize2 } from 'lucide-react';

export const GallerySection = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      title: "Resort Facade at Sunset",
      category: "Grounds"
    },
    {
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      title: "Oceanfront Villa Pool Deck",
      category: "Suites"
    },
    {
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      title: "Thermal Botanical Spa Pools",
      category: "Wellness"
    },
    {
      url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      title: "Michelin-Starred Degustation",
      category: "Gastronomy"
    },
    {
      url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      title: "Penthouse Suite Living Lounge",
      category: "Suites"
    },
    {
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
      title: "Historic Wine Vault & Tastings",
      category: "Gastronomy"
    }
  ];

  const filtered = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  const filters = ['All', 'Suites', 'Grounds', 'Gastronomy', 'Wellness'];

  return (
    <section id="gallery" className="py-24 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/20 mb-3">
            Visual Story
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Moments of Sublime Beauty
          </h2>
          <p className="text-stone-400 text-base sm:text-lg font-light leading-relaxed">
            Immerse yourself in snapshots of idyllic afternoons, sunset champagne toasts, and serene botanical spaces.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-amber-300 text-slate-950 shadow-lg'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(item)}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-1">
                  {item.category}
                </span>
                <h4 className="font-serif text-lg font-bold text-white">{item.title}</h4>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-stone-300">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to expand</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-20"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl" onClick={e => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[75vh] object-contain mx-auto rounded-xl"
            />
            <div className="text-center mt-4">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">{selectedImage.category}</span>
              <h3 className="font-serif text-xl font-bold text-white mt-0.5">{selectedImage.title}</h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


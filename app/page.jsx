'use client';

import { Navbar } from '../src/components/Navbar';
import { Hero } from '../src/components/Hero';
import { RoomsSection } from '../src/components/RoomsSection';
import { AmenitiesSection } from '../src/components/AmenitiesSection';
import { DiningSection } from '../src/components/DiningSection';
import { GallerySection } from '../src/components/GallerySection';
import { ReviewsSection } from '../src/components/ReviewsSection';
import { LocationSection } from '../src/components/LocationSection';
import { Footer } from '../src/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col relative">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <RoomsSection />
        <AmenitiesSection />
        <DiningSection />
        <GallerySection />
        <ReviewsSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}

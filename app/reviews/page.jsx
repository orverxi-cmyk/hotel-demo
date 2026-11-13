'use client';

import React from 'react';
import { Navbar } from '../../src/components/Navbar';
import { ReviewsSection } from '../../src/components/ReviewsSection';
import { Footer } from '../../src/components/Footer';

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}

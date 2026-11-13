'use client';

import React from 'react';
import { Navbar } from '../../src/components/Navbar';
import { AmenitiesSection } from '../../src/components/AmenitiesSection';
import { Footer } from '../../src/components/Footer';

export default function AmenitiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <AmenitiesSection />
      </main>
      <Footer />
    </div>
  );
}

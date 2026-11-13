'use client';

import React from 'react';
import { Navbar } from '../../src/components/Navbar';
import { DiningSection } from '../../src/components/DiningSection';
import { Footer } from '../../src/components/Footer';

export default function DiningPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <DiningSection />
      </main>
      <Footer />
    </div>
  );
}

'use client';

import React from 'react';
import { Navbar } from '../../src/components/Navbar';
import { RoomsSection } from '../../src/components/RoomsSection';
import { Footer } from '../../src/components/Footer';

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-amber-400 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 pt-20">
        <RoomsSection />
      </main>
      <Footer />
    </div>
  );
}

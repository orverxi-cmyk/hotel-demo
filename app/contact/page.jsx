'use client';

import React from 'react';
import { Navbar } from '../../src/components/Navbar';
import { LocationSection } from '../../src/components/LocationSection';
import { Footer } from '../../src/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white selection:bg-amber-400 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}

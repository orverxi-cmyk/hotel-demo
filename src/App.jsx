import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RoomsSection } from './components/RoomsSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { DiningSection } from './components/DiningSection';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { BookingTrackerModal } from './components/BookingTrackerModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { DemoToolbar } from './components/DemoToolbar';
import { NotificationToast } from './components/NotificationToast';

function HotelApp() {
  const [isCMSOpen, setIsCMSOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col relative selection:bg-amber-100 selection:text-amber-900">
      
      {/* Toast notifications */}
      <NotificationToast />

      {/* Main Guest Website */}
      <Navbar onOpenCMS={() => setIsCMSOpen(true)} />
      
      <main className="flex-1">
        <Hero />
        <RoomsSection />
        <AmenitiesSection />
        <DiningSection />
        <GallerySection />
        <ReviewsSection />
        <LocationSection />
      </main>

      <Footer onOpenCMS={() => setIsCMSOpen(true)} />

      {/* Booking Modals */}
      <BookingModal />
      <BookingTrackerModal />

      {/* Demo Floating Toolbar */}
      <DemoToolbar onOpenCMS={() => setIsCMSOpen(true)} />

      {/* Admin CMS Portal Overlay */}
      {isCMSOpen && (
        <AdminPortal onClose={() => setIsCMSOpen(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <HotelApp />
      </BookingProvider>
    </ThemeProvider>
  );
}


'use client';

import React from 'react';
import { ThemeProvider } from '../src/context/ThemeContext';
import { BookingProvider } from '../src/context/BookingContext';
import { BookingModal } from '../src/components/BookingModal';
import { BookingTrackerModal } from '../src/components/BookingTrackerModal';
import { DemoToolbar } from '../src/components/DemoToolbar';
import { NotificationToast } from '../src/components/NotificationToast';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <BookingProvider>
        <NotificationToast />
        {children}
        <BookingModal />
        <BookingTrackerModal />
      </BookingProvider>
    </ThemeProvider>
  );
}


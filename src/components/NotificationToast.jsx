'use client';

import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const NotificationToast = () => {
  const { activeNotification } = useBooking();

  if (!activeNotification) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-fade-in">
      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-xs font-semibold">{activeNotification.message}</span>
    </div>
  );
};


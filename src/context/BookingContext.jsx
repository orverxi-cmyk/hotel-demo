'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRooms, initialBookings } from '../data/initialData';
import { useTheme } from './ThemeContext';
import {
  loadRooms,
  saveRoom,
  deleteRoomById,
  loadBookings,
  saveBooking,
  updateBookingStatus,
  resetAllDemoData,
  getCachedRooms,
  subscribeRooms
} from '../services/storageService';
import { sendBookingStatusEmail, getBookingEmailLogs } from '../services/emailService';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search parameters from Hero search bar
  const [searchParams, setSearchParams] = useState({
    checkIn: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    guests: 2,
    roomType: 'all'
  });

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackedBookingCode, setTrackedBookingCode] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setActiveNotification({ message, type });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  // Load initial data with instant cache & real-time sync
  useEffect(() => {
    // 1. Immediately apply cached rooms in 0ms (no flash)
    const cachedRooms = getCachedRooms();
    if (cachedRooms && cachedRooms.length > 0) {
      setRooms(cachedRooms);
    }

    // 2. Real-time subscription to rooms
    const unsubscribeRooms = subscribeRooms((newRooms) => {
      if (newRooms && newRooms.length > 0) {
        setRooms(newRooms);
      }
      setIsLoading(false);
    });

    // 3. Load bookings
    const fetchBookings = async () => {
      try {
        const loadedBookings = await loadBookings();
        setBookings(loadedBookings || initialBookings);
      } catch (err) {
        console.error("Bookings load error:", err);
        setBookings(initialBookings);
      }
    };
    fetchBookings();

    return () => unsubscribeRooms();
  }, []);

  const openBookingModal = (room = null) => {
    setSelectedRoom(room || rooms[0] || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const openTrackerModal = (code = '') => {
    if (code) {
      setTrackedBookingCode(code.trim().toUpperCase());
    }
    setIsTrackerModalOpen(true);
  };

  // Create new reservation with automated status email dispatch
  const createReservation = async (reservationData) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `AUR-${randomNum}`;
    const initialStatus = reservationData.status || 'Confirmed';

    const newBooking = {
      ...reservationData,
      id: bookingId,
      status: initialStatus,
      paymentStatus: 'Paid (Demo Guarantee)',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    await saveBooking(newBooking);

    // 1. Immediately send BOOKING_SENT status email
    try {
      await sendBookingStatusEmail({
        type: 'BOOKING_SENT',
        booking: newBooking,
        theme
      });
    } catch (err) {
      console.warn("Automated BOOKING_SENT email notice:", err);
    }

    // 2. If initially Confirmed, also dispatch BOOKING_CONFIRMED email
    if (initialStatus === 'Confirmed') {
      try {
        await sendBookingStatusEmail({
          type: 'BOOKING_CONFIRMED',
          booking: newBooking,
          theme
        });
      } catch (err) {
        console.warn("Automated BOOKING_CONFIRMED email notice:", err);
      }
    }

    showNotification(`Reservation ${bookingId} submitted! Status email delivered to ${newBooking.guestEmail}`);
    return newBooking;
  };

  // Update booking status from CMS with automated status email dispatch
  const changeBookingStatus = async (bookingId, newStatus) => {
    let targetBooking = bookings.find(b => b.id.toUpperCase() === bookingId.toUpperCase());
    const updatedBooking = targetBooking ? { ...targetBooking, status: newStatus } : null;

    setBookings(prev =>
      prev.map(b => (b.id.toUpperCase() === bookingId.toUpperCase() ? { ...b, status: newStatus } : b))
    );
    await updateBookingStatus(bookingId, newStatus);

    if (updatedBooking && updatedBooking.guestEmail) {
      let emailType = null;
      if (newStatus === 'Confirmed') {
        emailType = 'BOOKING_CONFIRMED';
      } else if (newStatus === 'Cancelled') {
        emailType = 'BOOKING_CANCELLED';
      } else if (newStatus === 'Pending') {
        emailType = 'BOOKING_SENT';
      }

      if (emailType) {
        try {
          await sendBookingStatusEmail({
            type: emailType,
            booking: updatedBooking,
            theme
          });
          showNotification(`Booking ${bookingId} status is now "${newStatus}". Status email sent to ${updatedBooking.guestEmail}!`);
        } catch (err) {
          console.warn("Email dispatch error on status change:", err);
          showNotification(`Booking ${bookingId} marked as ${newStatus}`);
        }
      } else {
        showNotification(`Booking ${bookingId} marked as ${newStatus}`);
      }
    } else {
      showNotification(`Booking ${bookingId} marked as ${newStatus}`);
    }
  };

  // Explicitly resend or trigger a status email for a booking
  const resendBookingEmail = async (bookingId, explicitType = null) => {
    const booking = bookings.find(b => b.id.toUpperCase() === bookingId.toUpperCase());
    if (!booking) {
      showNotification("Booking not found", "error");
      return { success: false, error: "Booking not found" };
    }

    let emailType = explicitType;
    if (!emailType) {
      if (booking.status === 'Confirmed') emailType = 'BOOKING_CONFIRMED';
      else if (booking.status === 'Cancelled') emailType = 'BOOKING_CANCELLED';
      else emailType = 'BOOKING_SENT';
    }

    try {
      const res = await sendBookingStatusEmail({
        type: emailType,
        booking,
        theme
      });
      showNotification(`Status email (${emailType}) resent to ${booking.guestEmail}!`);
      return res;
    } catch (err) {
      showNotification(`Failed to resend email: ${err.message}`, "error");
      return { success: false, error: err.message };
    }
  };

  // Room Management
  const addRoom = async (roomData) => {
    const newRoom = {
      ...roomData,
      id: `room-${Date.now()}`
    };
    setRooms(prev => [newRoom, ...prev]);
    await saveRoom(newRoom);
    showNotification(`Room "${newRoom.name}" added successfully`);
  };

  const updateRoom = async (roomData) => {
    setRooms(prev => prev.map(r => (r.id === roomData.id ? roomData : r)));
    await saveRoom(roomData);
    showNotification(`Room "${roomData.name}" updated successfully`);
  };

  const deleteRoom = async (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    await deleteRoomById(roomId);
    showNotification(`Room removed successfully`);
  };

  // Reset demo
  const resetDemo = async () => {
    const res = await resetAllDemoData();
    setRooms(res.rooms);
    setBookings(res.bookings);
    showNotification("All demo data, rooms, and bookings reset to defaults!");
  };

  // Lookup booking
  const findBooking = (code) => {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return bookings.find(b => b.id.toUpperCase() === clean);
  };

  return (
    <BookingContext.Provider value={{
      rooms,
      bookings,
      isLoading,
      searchParams,
      setSearchParams,
      isBookingModalOpen,
      selectedRoom,
      openBookingModal,
      closeBookingModal,
      isTrackerModalOpen,
      setIsTrackerModalOpen,
      trackedBookingCode,
      setTrackedBookingCode,
      openTrackerModal,
      createReservation,
      changeBookingStatus,
      resendBookingEmail,
      getBookingEmailLogs,
      addRoom,
      updateRoom,
      deleteRoom,
      resetDemo,
      findBooking,
      activeNotification,
      showNotification
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

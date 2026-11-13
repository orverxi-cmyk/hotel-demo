'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRooms, initialBookings, initialDiningVenues } from '../data/initialData';
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
  subscribeRooms,
  getCachedDiningVenues,
  subscribeDiningVenues
} from '../services/storageService';
import { sendBookingStatusEmail, getBookingEmailLogs } from '../services/emailService';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [diningVenues, setDiningVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search parameters from Hero search bar
  const [searchParams, setSearchParams] = useState({
    checkIn: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    guests: 2,
    roomType: 'all'
  });

  // Dining search parameters for dinner table reservation
  const [diningSearchParams, setDiningSearchParams] = useState({
    venueId: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '19:30',
    guests: 2
  });

  // Modal & Mode states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState('stay'); // 'stay' | 'dining'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);

  // Tracker & Notification states
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

    // 3. Load & subscribe dining venues
    const cachedVenues = getCachedDiningVenues();
    if (cachedVenues && cachedVenues.length > 0) {
      setDiningVenues(cachedVenues);
    }
    const unsubscribeDining = subscribeDiningVenues((newVenues) => {
      if (newVenues && newVenues.length > 0) {
        setDiningVenues(newVenues);
      }
    });

    // 4. Load bookings
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

    return () => {
      unsubscribeRooms();
      unsubscribeDining();
    };
  }, []);

  // --- AVAILABILITY ENGINES ---

  /**
   * Calculates room availability for a given date range by checking
   * overlapping active stay bookings against the room's total inventory quantity.
   */
  const getRoomAvailability = (roomId, checkIn, checkOut) => {
    const room = rooms.find(r => r.id === roomId);
    const totalQuantity = (room && typeof room.quantity === 'number' && room.quantity > 0) ? room.quantity : 2;

    if (!roomId || !checkIn || !checkOut) {
      return {
        totalQuantity,
        bookedCount: 0,
        remainingCount: totalQuantity,
        isAvailable: totalQuantity > 0
      };
    }

    // Find active overlapping stay reservations
    const activeBookings = bookings.filter(b => {
      const isStay = b.bookingType !== 'dining' && (!b.type || b.type !== 'dining');
      if (!isStay || b.roomId !== roomId) return false;
      if (!['Confirmed', 'Checked In', 'Pending'].includes(b.status)) return false;
      // Overlap condition: booking starts before requested checkout AND ends after requested checkin
      return (b.checkIn < checkOut && b.checkOut > checkIn);
    });

    // Calculate peak units booked on any single night in requested range
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    let peakBooked = 0;

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      let bookedForNight = 0;

      for (const b of activeBookings) {
        if (b.checkIn <= dateStr && b.checkOut > dateStr) {
          const qty = (typeof b.quantity === 'number' && b.quantity > 0) ? b.quantity : 1;
          bookedForNight += qty;
        }
      }

      if (bookedForNight > peakBooked) {
        peakBooked = bookedForNight;
      }
    }

    const remainingCount = Math.max(0, totalQuantity - peakBooked);

    return {
      totalQuantity,
      bookedCount: peakBooked,
      remainingCount,
      isAvailable: remainingCount > 0
    };
  };

  /**
   * Calculates dining table availability for a specific venue, date, and time slot.
   */
  const getDiningAvailability = (venueId, date, timeSlot) => {
    const venue = diningVenues.find(v => v.id === venueId) || initialDiningVenues.find(v => v.id === venueId);
    const tables = venue?.tables || [];
    const totalTables = tables.length;

    if (!venueId || !date || !timeSlot) {
      return {
        reservedTableNumbers: [],
        availableTables: tables,
        totalTables,
        isFullyBooked: false
      };
    }

    // Find active dining reservations matching venueId, date, timeSlot
    const activeDining = bookings.filter(b => {
      const isDining = b.bookingType === 'dining' || b.type === 'dining';
      if (!isDining) return false;
      if (b.venueId !== venueId || b.date !== date || b.timeSlot !== timeSlot) return false;
      return ['Confirmed', 'Checked In', 'Pending'].includes(b.status);
    });

    const reservedTableNumbers = activeDining.map(b => b.tableNumber).filter(Boolean);
    const availableTables = tables.filter(t => !reservedTableNumbers.includes(t.number));

    return {
      reservedTableNumbers,
      availableTables,
      totalTables,
      isFullyBooked: totalTables > 0 && availableTables.length === 0
    };
  };

  const isTableAvailable = (venueId, date, timeSlot, tableNumber) => {
    if (!venueId || !date || !timeSlot || !tableNumber) return true;
    const { reservedTableNumbers } = getDiningAvailability(venueId, date, timeSlot);
    return !reservedTableNumbers.includes(tableNumber);
  };

  // --- MODAL CONTROLS ---

  const openBookingModal = (item = null, mode = 'stay', initialParams = null) => {
    if (typeof window !== 'undefined') {
      const isDining = mode === 'dining' || item?.tables || item?.accolade || (item?.id && item.id.startsWith('dining-'));
      if (isDining) {
        const venueParam = item?.id ? `&venue=${item.id}` : '';
        window.location.href = `/book?type=dining${venueParam}`;
      } else {
        const roomParam = item?.id ? `?room=${item.id}` : '';
        window.location.href = `/book${roomParam}`;
      }
      return;
    }
    setIsBookingModalOpen(false);
  };

  const openDiningModal = (venue = null, tableNumber = null, initialParams = null) => {
    if (typeof window !== 'undefined') {
      const venueParam = venue?.id ? `&venue=${venue.id}` : '';
      window.location.href = `/book?type=dining${venueParam}`;
      return;
    }
    setIsBookingModalOpen(false);
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

  // Create new reservation (Stay or Dining) with inventory & table constraint checks
  const createReservation = async (reservationData) => {
    const isDining = reservationData.bookingType === 'dining' || reservationData.type === 'dining';

    // 1. Inventory & Availability Pre-flight Validation
    if (isDining) {
      const { venueId, date, timeSlot, tableNumber } = reservationData;
      if (!isTableAvailable(venueId, date, timeSlot, tableNumber)) {
        const errorMsg = `Table ${tableNumber} has just been reserved for ${timeSlot} on ${date}. Please select another table.`;
        showNotification(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } else {
      const { roomId, checkIn, checkOut, quantity = 1 } = reservationData;
      const { remainingCount, isAvailable } = getRoomAvailability(roomId, checkIn, checkOut);
      if (!isAvailable || remainingCount < quantity) {
        const errorMsg = remainingCount === 0 
          ? `This suite is completely booked for the selected dates. Please choose another suite or alternative dates.` 
          : `Only ${remainingCount} suite(s) available for your selected dates (requested: ${quantity}).`;
        showNotification(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `AUR-${randomNum}`;
    const initialStatus = reservationData.status || 'Confirmed';

    const newBooking = {
      ...reservationData,
      id: bookingId,
      bookingType: isDining ? 'dining' : 'stay',
      status: initialStatus,
      paymentStatus: 'Paid (Demo Guarantee)',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    await saveBooking(newBooking);

    // 1. Send initial BOOKING_SENT status email
    try {
      await sendBookingStatusEmail({
        type: 'BOOKING_SENT',
        booking: newBooking,
        theme
      });
    } catch (err) {
      console.warn("Automated BOOKING_SENT email notice:", err);
    }

    // 2. If Confirmed, dispatch BOOKING_CONFIRMED email
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

    const desc = isDining ? `Table reservation ${bookingId} confirmed!` : `Stay reservation ${bookingId} confirmed!`;
    showNotification(`${desc} Status email delivered to ${newBooking.guestEmail}`);
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
      id: `room-${Date.now()}`,
      quantity: Number(roomData.quantity) || 2,
      location: roomData.location || "Resort Wing Suite"
    };
    setRooms(prev => [newRoom, ...prev]);
    await saveRoom(newRoom);
    showNotification(`Room "${newRoom.name}" added successfully`);
  };

  const updateRoom = async (roomData) => {
    const sanitized = {
      ...roomData,
      quantity: Number(roomData.quantity) || 2,
      location: roomData.location || "Resort Wing Suite"
    };
    setRooms(prev => prev.map(r => (r.id === sanitized.id ? sanitized : r)));
    await saveRoom(sanitized);
    showNotification(`Room "${sanitized.name}" updated successfully`);
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
      diningVenues,
      bookings,
      isLoading,
      searchParams,
      setSearchParams,
      diningSearchParams,
      setDiningSearchParams,
      bookingMode,
      setBookingMode,
      isBookingModalOpen,
      selectedRoom,
      setSelectedRoom,
      selectedVenue,
      setSelectedVenue,
      selectedTableNumber,
      setSelectedTableNumber,
      openBookingModal,
      openDiningModal,
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
      getRoomAvailability,
      getDiningAvailability,
      isTableAvailable,
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

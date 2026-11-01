'use client';

import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User, 
  Phone, 
  Sparkles,
  Mail,
  Send,
  Eye,
  RotateCw,
  Printer,
  ShieldCheck,
  Check
} from 'lucide-react';

export const BookingTrackerModal = () => {
  const { 
    isTrackerModalOpen, 
    setIsTrackerModalOpen, 
    trackedBookingCode,
    setTrackedBookingCode,
    findBooking, 
    bookings,
    getBookingEmailLogs,
    resendBookingEmail,
    showNotification
  } = useBooking();
  const { theme } = useTheme();

  const [searchCode, setSearchCode] = useState('');
  const [searchedBooking, setSearchedBooking] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [previewingEmail, setPreviewingEmail] = useState(null);
  const [isResending, setIsResending] = useState(false);

  // Sync when opened or when trackedBookingCode changes
  useEffect(() => {
    if (isTrackerModalOpen) {
      const codeToUse = trackedBookingCode || searchCode;
      if (codeToUse) {
        setSearchCode(codeToUse);
        const result = findBooking(codeToUse);
        if (result) {
          setSearchedBooking(result);
          setHasSearched(true);
          loadEmailHistory(result);
        }
      }
    }
  }, [isTrackerModalOpen, trackedBookingCode]);

  const loadEmailHistory = async (booking) => {
    if (!booking) return;
    setIsLoadingEmails(true);
    try {
      const logs = await getBookingEmailLogs(booking.id, booking, theme);
      setEmailLogs(logs || []);
    } catch (err) {
      console.warn("Could not load email logs:", err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  if (!isTrackerModalOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchCode) return;
    const result = findBooking(searchCode);
    setSearchedBooking(result || null);
    setHasSearched(true);
    if (result) {
      await loadEmailHistory(result);
    } else {
      setEmailLogs([]);
    }
  };

  const loadSample = async (code) => {
    setSearchCode(code);
    if (setTrackedBookingCode) setTrackedBookingCode(code);
    const result = findBooking(code);
    setSearchedBooking(result || null);
    setHasSearched(true);
    if (result) {
      await loadEmailHistory(result);
    } else {
      setEmailLogs([]);
    }
  };

  const handleResend = async (emailType = null) => {
    if (!searchedBooking) return;
    setIsResending(true);
    try {
      await resendBookingEmail(searchedBooking.id, emailType);
      await loadEmailHistory(searchedBooking);
    } finally {
      setIsResending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Confirmed & Guaranteed</span>;
      case 'Checked In':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Currently Checked In</span>;
      case 'Completed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">Completed Residency</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Received & Pending</span>;
    }
  };

  // Stepper calculations
  const isCancelled = searchedBooking?.status === 'Cancelled';
  const getStepProgress = () => {
    if (!searchedBooking) return 0;
    if (isCancelled) return -1;
    switch (searchedBooking.status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Checked In': return 3;
      case 'Completed': return 4;
      default: return 1;
    }
  };

  const currentStep = getStepProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div 
          className="p-5 sm:p-6 text-white flex items-center justify-between shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold block">
              {theme.hotelName} • Concierge Services
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">Reservation & Email Tracker</h3>
          </div>
          <button
            onClick={() => {
              setIsTrackerModalOpen(false);
              setSearchedBooking(null);
              setHasSearched(false);
              setSearchCode('');
              if (setTrackedBookingCode) setTrackedBookingCode('');
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. AUR-89214"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-slate-950 flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <Search className="w-4 h-4" />
              <span>Lookup</span>
            </button>
          </form>

          {/* Quick Demo Sample Badges */}
          <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
            <span className="font-medium">Quick Demo Samples:</span>
            <div className="inline-flex flex-wrap gap-1.5">
              {bookings.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => loadSample(b.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                    searchedBooking?.id === b.id
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                >
                  {b.id} ({b.status})
                </button>
              ))}
            </div>
          </div>

          {/* Search Result */}
          {hasSearched && (
            searchedBooking ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Status Stepper / Pipeline */}
                {isCancelled ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>Reservation Cancelled</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      This reservation has been cancelled. An official cancellation notice email has been dispatched to <strong>{searchedBooking.guestEmail}</strong>. Zero penalties have been applied in accordance with our guarantee.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-3 font-semibold">
                      Live Reservation Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { step: 1, label: 'Received', sub: 'Request Sent' },
                        { step: 2, label: 'Confirmed', sub: 'Guaranteed' },
                        { step: 3, label: 'Checked In', sub: 'In Sanctuary' },
                        { step: 4, label: 'Completed', sub: 'Departure' }
                      ].map((s) => {
                        const isDone = currentStep >= s.step;
                        const isCurrent = currentStep === s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1.5 shadow-sm ${
                                isDone 
                                  ? 'bg-emerald-600 text-white' 
                                  : isCurrent 
                                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100' 
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                            </div>
                            <span className={`text-[11px] font-bold block ${isDone ? 'text-slate-900' : 'text-stone-400'}`}>
                              {s.label}
                            </span>
                            <span className="text-[9px] text-stone-400 hidden sm:block">
                              {s.sub}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Folio Summary Card */}
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Booking Reference</span>
                      <strong className="font-mono text-xl text-amber-800 tracking-wider">{searchedBooking.id}</strong>
                    </div>
                    <div>{getStatusBadge(searchedBooking.status)}</div>
                  </div>

                  {searchedBooking.bookingType === 'dining' ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 block">Primary Guest</span>
                        <strong className="text-slate-900 text-sm">{searchedBooking.guestName}</strong>
                        <span className="text-stone-500 text-[11px] block">{searchedBooking.guestEmail}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Dining Venue</span>
                        <strong className="text-slate-900 text-sm">{searchedBooking.venueName}</strong>
                        <span className="text-stone-500 text-[11px] block">{searchedBooking.guests} Guests</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Table Reserved</span>
                        <strong className="text-amber-900 font-mono text-sm">Table {searchedBooking.tableNumber}</strong>
                        <span className="text-stone-500 text-[11px] block">{searchedBooking.tableName}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Date & Seating</span>
                        <strong className="text-slate-900">{searchedBooking.date} at {searchedBooking.timeSlot}</strong>
                        <span className="text-emerald-700 text-[10px] font-semibold block">{searchedBooking.paymentStatus || 'Guaranteed'}</span>
                      </div>
                      <div className="col-span-2 text-[11px] bg-stone-100 p-2 rounded-lg text-stone-600">
                        <span><strong>Table Location:</strong> {searchedBooking.tableLocation} ({searchedBooking.venueLocation})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 block">Primary Guest</span>
                        <strong className="text-slate-900 text-sm">{searchedBooking.guestName}</strong>
                        <span className="text-stone-500 text-[11px] block">{searchedBooking.guestEmail}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Reserved Suite</span>
                        <strong className="text-slate-900 text-sm">{searchedBooking.roomName}</strong>
                        <span className="text-amber-800 text-[11px] font-semibold block">{searchedBooking.quantity || 1} Suite(s) • {searchedBooking.guests} Guests</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Stay Dates</span>
                        <strong className="text-slate-900">{searchedBooking.checkIn} → {searchedBooking.checkOut}</strong>
                        <span className="text-stone-500 text-[11px] block">{searchedBooking.nights} Nights</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Total Folio</span>
                        <strong className="font-serif text-base text-slate-900">{theme.currency}{searchedBooking.totalAmount}</strong>
                        <span className="text-emerald-700 text-[10px] font-semibold block">{searchedBooking.paymentStatus || 'Guaranteed'}</span>
                      </div>
                      {searchedBooking.roomLocation && (
                        <div className="col-span-2 text-[11px] bg-stone-100 p-2 rounded-lg text-stone-600">
                          <span><strong>Resort Location:</strong> {searchedBooking.roomLocation}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {searchedBooking.addons && searchedBooking.addons.length > 0 && (
                    <div className="pt-2 border-t border-stone-200 text-xs">
                      <span className="text-stone-400 block mb-1">Privileges & Add-ons:</span>
                      <p className="text-stone-700 font-medium">{searchedBooking.addons.join(', ')}</p>
                    </div>
                  )}

                  {searchedBooking.specialRequests && (
                    <div className="pt-2 border-t border-stone-200 text-xs">
                      <span className="text-stone-400 block mb-1">Special Requests:</span>
                      <p className="text-stone-600 italic">"{searchedBooking.specialRequests}"</p>
                    </div>
                  )}
                </div>

                {/* AUTOMATED STATUS EMAILS SECTION */}
                <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-slate-900">
                          Automated Status Email Logs ({emailLogs.length})
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Status notifications dispatched to <strong className="text-slate-700">{searchedBooking.guestEmail}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleResend()}
                      disabled={isResending}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="Resend latest status email"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      <span>{isResending ? 'Sending...' : 'Resend Email'}</span>
                    </button>
                  </div>

                  {isLoadingEmails ? (
                    <div className="p-4 text-center text-xs text-stone-400">Loading email dispatch history...</div>
                  ) : emailLogs.length > 0 ? (
                    <div className="space-y-3">
                      {emailLogs.map((log) => {
                        const isSent = log.type === 'BOOKING_SENT';
                        const isConf = log.type === 'BOOKING_CONFIRMED';
                        const isCanc = log.type === 'BOOKING_CANCELLED';

                        return (
                          <div 
                            key={log.id} 
                            className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isConf 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : isCanc 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {isConf ? 'Confirmation' : isCanc ? 'Cancellation Notice' : 'Request Received'}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {new Date(log.sentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Delivered</span>
                                </span>
                              </div>
                              <p className="font-semibold text-slate-900 line-clamp-1">{log.subject}</p>
                              <p className="text-[11px] text-stone-500">Delivered to: {log.recipientEmail}</p>
                            </div>

                            <button
                              onClick={() => setPreviewingEmail(log)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-start sm:self-center"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>Preview Email</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                      No status emails logged yet. Click "Resend Email" above to trigger an immediate status dispatch.
                    </div>
                  )}
                </div>

                {/* Concierge Assistance Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>Concierge Line: <strong>{theme.phone}</strong></span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Summary</span>
                    </button>
                    <a 
                      href={`mailto:${theme.email}?subject=Inquiry for Ref ${searchedBooking.id}`}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800"
                    >
                      Contact Concierge
                    </a>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 text-rose-800">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                <h4 className="font-bold text-sm">No Reservation Found</h4>
                <p className="text-xs mt-1 text-rose-600">
                  Could not find a reservation matching reference "<strong>{searchCode}</strong>". Please verify your reference number or choose one of the sample references above.
                </p>
              </div>
            )
          )}

        </div>

      </div>

      {/* LUXURY EMAIL HTML PREVIEW MODAL */}
      {previewingEmail && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-300 my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  @
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dispatched Luxury Email Preview</h4>
                  <p className="text-[10px] text-stone-400 font-mono">
                    Subject: {previewingEmail.subject}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewingEmail(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Envelope Meta Details */}
            <div className="bg-stone-100 border-b border-stone-200 px-6 py-2.5 text-[11px] text-stone-600 flex flex-wrap justify-between gap-2 shrink-0">
              <div>
                <span className="text-stone-400 font-medium">To: </span>
                <strong className="text-slate-900">{previewingEmail.recipientName} &lt;{previewingEmail.recipientEmail}&gt;</strong>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Delivered: </span>
                <span className="font-mono">{new Date(previewingEmail.sentAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Rendered Email HTML in Sandbox */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
              <iframe
                title="Email Preview"
                srcDoc={previewingEmail.html}
                className="w-full max-w-[620px] h-[550px] bg-white rounded-2xl shadow-xl border-0"
              />
            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
              <button
                onClick={() => setPreviewingEmail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};



import { db } from "../firebase.js";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";

const LS_EMAILS_KEY = "hotel_demo_dispatched_emails";
const isClient = typeof window !== "undefined";

// Generate responsive, luxury HTML email templates
export const generateEmailTemplate = ({ type, booking, theme }) => {
  const primaryColor = theme?.primaryColor || '#0f2b48';
  const secondaryColor = theme?.secondaryColor || '#c5a059';
  const hotelName = theme?.hotelName || 'The Grand Aurelia';
  const hotelSubtitle = theme?.hotelSubtitle || 'Luxury Resort & Spa';
  const phone = theme?.phone || '+1 (800) 555-0199';
  const hotelEmail = theme?.email || 'concierge@thegrandaurelia.com';
  const currency = theme?.currency || '$';

  let headerTitle = '';
  let statusBadgeText = '';
  let statusBadgeBg = '';
  let statusBadgeColor = '';
  let introMessage = '';
  let actionCallout = '';

  switch (type) {
    case 'BOOKING_SENT':
      headerTitle = 'Reservation Received & Processing';
      statusBadgeText = 'Status: Received & In Review';
      statusBadgeBg = '#fef3c7';
      statusBadgeColor = '#92400e';
      introMessage = `Thank you for choosing ${hotelName}. We have successfully received your reservation request. Our concierge desk is reviewing your folio, and your confirmation is being processed.`;
      actionCallout = 'You can track your reservation at any time using your booking reference code below.';
      break;

    case 'BOOKING_CONFIRMED':
      headerTitle = 'Official Reservation Confirmation';
      statusBadgeText = 'Status: Confirmed & Guaranteed';
      statusBadgeBg = '#d1fae5';
      statusBadgeColor = '#065f46';
      introMessage = `We are delighted to confirm your upcoming sanctuary stay at ${hotelName}. Your suite and bespoke amenities have been reserved and guaranteed.`;
      actionCallout = `Check-in commences at ${theme?.checkInTime || '15:00'}. Our private chauffeur and concierge team eagerly await your arrival.`;
      break;

    case 'BOOKING_CANCELLED':
      headerTitle = 'Reservation Cancellation Notice';
      statusBadgeText = 'Status: Cancelled';
      statusBadgeBg = '#ffe4e6';
      statusBadgeColor = '#9f1239';
      introMessage = `Your reservation at ${hotelName} has been cancelled in accordance with our flexible reservation terms.`;
      actionCallout = 'No cancellation penalties have been charged. If this cancellation was made in error or if you wish to reschedule, our concierge team is at your immediate service.';
      break;

    default:
      headerTitle = 'Reservation Status Update';
      statusBadgeText = `Status: ${booking.status}`;
      statusBadgeBg = '#e0f2fe';
      statusBadgeColor = '#075985';
      introMessage = `We have an update regarding your stay at ${hotelName}.`;
      actionCallout = 'Please review your reservation details below.';
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${headerTitle} - ${hotelName}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid #e2e8f0; }
    .header { background-color: ${primaryColor}; padding: 36px 30px; text-align: center; color: #ffffff; }
    .monogram { width: 48px; height: 48px; margin: 0 auto 12px; background-color: ${secondaryColor}; color: #0b1120; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-size: 22px; font-weight: bold; line-height: 48px; }
    .hotel-name { font-family: Georgia, serif; font-size: 24px; font-weight: bold; letter-spacing: 0.5px; margin: 0; }
    .hotel-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${secondaryColor}; margin-top: 4px; }
    .content { padding: 32px 30px; }
    .title { font-family: Georgia, serif; font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .status-badge { display: inline-block; padding: 6px 14px; background-color: ${statusBadgeBg}; color: ${statusBadgeColor}; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    .ref-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; text-align: center; }
    .ref-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .ref-code { font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: bold; color: ${secondaryColor}; letter-spacing: 2px; margin: 0; }
    .folio-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .folio-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .folio-table td.label { color: #64748b; font-weight: 500; width: 40%; }
    .folio-table td.value { color: #0f172a; font-weight: 600; text-align: right; }
    .total-row td { padding-top: 14px; border-bottom: none; font-size: 15px; }
    .total-row td.value { color: ${secondaryColor}; font-weight: bold; font-family: Georgia, serif; font-size: 18px; }
    .action-box { background: linear-gradient(135deg, ${primaryColor} 0%, #1e3a5f 100%); color: #ffffff; padding: 20px; border-radius: 14px; margin-bottom: 24px; text-align: center; }
    .action-text { font-size: 12px; line-height: 1.5; color: #e2e8f0; margin-bottom: 14px; }
    .track-btn { display: inline-block; padding: 10px 24px; background-color: ${secondaryColor}; color: #0b1120; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 9999px; }
    .footer { background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.6; }
    .footer a { color: ${secondaryColor}; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="monogram">${hotelName.charAt(0)}</div>
      <h1 class="hotel-name">${hotelName}</h1>
      <div class="hotel-sub">${hotelSubtitle}</div>
    </div>
    <div class="content">
      <div class="status-badge">${statusBadgeText}</div>
      <h2 class="title">${headerTitle}</h2>
      <p class="intro">Dear <strong>${booking.guestName || 'Distinguished Guest'}</strong>,<br><br>${introMessage}</p>

      <div class="ref-card">
        <div class="ref-label">Booking Reference Code</div>
        <div class="ref-code">${booking.id}</div>
      </div>

      <table class="folio-table">
        <tr>
          <td class="label">Accommodation:</td>
          <td class="value">${booking.roomName || 'Luxury Suite'}</td>
        </tr>
        <tr>
          <td class="label">Arrival & Departure:</td>
          <td class="value">${booking.checkIn} → ${booking.checkOut} (${booking.nights || 1} nights)</td>
        </tr>
        <tr>
          <td class="label">Guests:</td>
          <td class="value">${booking.guests || 2} Registered Guest(s)</td>
        </tr>
        ${booking.addons && booking.addons.length > 0 ? `
        <tr>
          <td class="label">Selected Inclusions:</td>
          <td class="value">${booking.addons.join(', ')}</td>
        </tr>` : ''}
        ${booking.specialRequests ? `
        <tr>
          <td class="label">Special Requests:</td>
          <td class="value"><em>"${booking.specialRequests}"</em></td>
        </tr>` : ''}
        <tr class="total-row">
          <td class="label">Total Amount:</td>
          <td class="value">${currency}${booking.totalAmount}</td>
        </tr>
      </table>

      <div class="action-box">
        <div class="action-text">${actionCallout}</div>
        <a href="http://localhost:3000/#track" class="track-btn">Track Reservation Online</a>
      </div>
    </div>
    <div class="footer">
      <p>Need assistance or wish to arrange an airport private chauffeur?<br>
      Concierge Desk: <strong>${phone}</strong> • <a href="mailto:${hotelEmail}">${hotelEmail}</a></p>
      <p>© ${new Date().getFullYear()} ${hotelName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  let subject = '';
  switch (type) {
    case 'BOOKING_SENT':
      subject = `[Received] Reservation Ref: ${booking.id} - ${hotelName}`;
      break;
    case 'BOOKING_CONFIRMED':
      subject = `[Confirmed] Official Confirmation: Stay at ${hotelName} (Ref: ${booking.id})`;
      break;
    case 'BOOKING_CANCELLED':
      subject = `[Notice] Reservation Cancelled: Ref ${booking.id} - ${hotelName}`;
      break;
    default:
      subject = `Reservation Status Update: Ref ${booking.id} - ${hotelName}`;
  }

  return { subject, html, headerTitle, statusBadgeText };
};

// Dispatch an automated status email
export const sendBookingStatusEmail = async ({ type, booking, theme }) => {
  if (!booking || !booking.guestEmail) {
    console.warn("Cannot send email: missing booking or guestEmail.");
    return { success: false, error: "Missing guest email address" };
  }

  const { subject, html, headerTitle, statusBadgeText } = generateEmailTemplate({ type, booking, theme });

  const emailRecord = {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    bookingId: booking.id,
    type,
    recipientEmail: booking.guestEmail,
    recipientName: booking.guestName,
    subject,
    statusBadge: statusBadgeText,
    sentAt: new Date().toISOString(),
    status: 'Delivered',
    html
  };

  // 1. Cache to localStorage for instantaneous demo & tracker access
  if (isClient) {
    try {
      const cached = localStorage.getItem(LS_EMAILS_KEY);
      const emailList = cached ? JSON.parse(cached) : [];
      emailList.unshift(emailRecord);
      localStorage.setItem(LS_EMAILS_KEY, JSON.stringify(emailList));
    } catch (err) {
      console.warn("Local email log storage error:", err);
    }
  }

  // 2. Write to Firebase Firestore standard 'mail' collection
  // (Compatible with Firebase Trigger Email extension / SendGrid / SMTP)
  try {
    const mailDocRef = doc(db, "mail", emailRecord.id);
    await setDoc(mailDocRef, {
      to: [booking.guestEmail],
      message: {
        subject,
        html
      },
      bookingId: booking.id,
      guestName: booking.guestName,
      type,
      sentAt: emailRecord.sentAt,
      delivered: true
    }, { merge: true });
    emailRecord.syncedToCloud = true;
  } catch (err) {
    console.warn("Firestore mail queue notice:", err?.message);
    emailRecord.syncedToCloud = false;
  }

  return {
    success: true,
    emailRecord
  };
};

// Retrieve email dispatch logs for a specific booking
export const getBookingEmailLogs = async (bookingId, bookingData = null, theme = null) => {
  if (!bookingId) return [];
  const cleanId = bookingId.trim().toUpperCase();

  let logs = [];
  if (isClient) {
    try {
      const cached = localStorage.getItem(LS_EMAILS_KEY);
      if (cached) {
        const all = JSON.parse(cached);
        logs = all.filter(e => e.bookingId?.toUpperCase() === cleanId);
      }
    } catch (_) {}
  }

  try {
    const q = query(collection(db, "mail"), where("bookingId", "==", cleanId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const cloudLogs = [];
      snapshot.forEach(d => cloudLogs.push({ id: d.id, ...d.data() }));
      // Merge unique
      const ids = new Set(logs.map(l => l.id));
      for (const cl of cloudLogs) {
        if (!ids.has(cl.id)) {
          logs.push({
            id: cl.id,
            bookingId: cl.bookingId,
            type: cl.type,
            recipientEmail: cl.to?.[0],
            recipientName: cl.guestName,
            subject: cl.message?.subject,
            sentAt: cl.sentAt,
            status: 'Delivered',
            html: cl.message?.html
          });
        }
      }
    }
  } catch (err) {
    // Falls back seamlessly to local logs
  }

  // If no logs found but bookingData is provided (or sample demo booking), generate initial logs
  if (logs.length === 0 && bookingData) {
    const syntheticLogs = [];
    
    // Every booking gets a BOOKING_SENT record
    const sentTpl = generateEmailTemplate({ type: 'BOOKING_SENT', booking: bookingData, theme });
    syntheticLogs.push({
      id: `seed-sent-${cleanId}`,
      bookingId: cleanId,
      type: 'BOOKING_SENT',
      recipientEmail: bookingData.guestEmail,
      recipientName: bookingData.guestName,
      subject: sentTpl.subject,
      statusBadge: sentTpl.statusBadgeText,
      sentAt: bookingData.createdAt || new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'Delivered',
      html: sentTpl.html
    });

    // If confirmed, also add BOOKING_CONFIRMED
    if (bookingData.status === 'Confirmed' || bookingData.status === 'Checked In' || bookingData.status === 'Completed') {
      const confTpl = generateEmailTemplate({ type: 'BOOKING_CONFIRMED', booking: bookingData, theme });
      syntheticLogs.unshift({
        id: `seed-conf-${cleanId}`,
        bookingId: cleanId,
        type: 'BOOKING_CONFIRMED',
        recipientEmail: bookingData.guestEmail,
        recipientName: bookingData.guestName,
        subject: confTpl.subject,
        statusBadge: confTpl.statusBadgeText,
        sentAt: new Date(new Date(bookingData.createdAt || Date.now()).getTime() + 1000 * 60 * 15).toISOString(),
        status: 'Delivered',
        html: confTpl.html
      });
    }

    // If cancelled, add BOOKING_CANCELLED
    if (bookingData.status === 'Cancelled') {
      const cancTpl = generateEmailTemplate({ type: 'BOOKING_CANCELLED', booking: bookingData, theme });
      syntheticLogs.unshift({
        id: `seed-canc-${cleanId}`,
        bookingId: cleanId,
        type: 'BOOKING_CANCELLED',
        recipientEmail: bookingData.guestEmail,
        recipientName: bookingData.guestName,
        subject: cancTpl.subject,
        statusBadge: cancTpl.statusBadgeText,
        sentAt: new Date(new Date(bookingData.createdAt || Date.now()).getTime() + 1000 * 60 * 60).toISOString(),
        status: 'Delivered',
        html: cancTpl.html
      });
    }

    logs = syntheticLogs;
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  return logs;
};

# 🏨 Luxury Hotel Website & Admin CMS (Next.js App Router)

A modern, production-grade Hotel Website and Content Management System (CMS) designed specifically for client sales demonstrations, boutique hotels, and luxury resorts.

Built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, **Lucide Icons**, and **Firebase SDK** (Firestore & Analytics), featuring instant real-time dynamic color theming, suite inventory management, multi-step reservation booking engine, and booking reference lookup.

---

## ⚡ Modern Architecture: Next.js App Router

This project is built using the **modern Next.js App Router (`app/` directory)**:

| Route | Type | Description |
|---|---|---|
| `/` | `app/page.jsx` | Guest-facing luxury hotel showcase (Hero, Suites, Amenities, Dining, Reviews, Location) |
| `/admin` | `app/admin/page.jsx` | Dedicated Admin CMS (Branding & Theme Studio, Bookings Pipeline, Suites & Inventory, Revenue Analytics) |
| `/rooms/[id]` | `app/rooms/[id]/page.jsx` | Dynamic suite detail pages with direct shareable URLs |
| Root Layout | `app/layout.jsx` | Global root layout with SEO metadata and Google Fonts |
| Providers | `app/providers.jsx` | Client-side provider wrapper for Theme, Booking, and Modal Context |

---

## 🌟 Key Features

### 1. 🎨 Dynamic Theme & Branding CMS Studio
- **Primary (Main) Color Customizer**: Live color picker & HEX input. Controls the navbar, hero ambiance, primary headers, suite badges, and main cards.
- **Secondary (Accent) Color Customizer**: Live color picker & HEX input. Controls "Book Now" CTA buttons, star ratings, price tags, and highlight elements.
- **6 One-Click Luxury Presets**:
  - 💎 *Royal Sapphire & Gold* (Deep Navy `#0f2b48` & Champagne Gold `#c5a059`)
  - 🌿 *Emerald Haven & Champagne* (Botanical Forest `#143d2b` & Gold `#d4af37`)
  - 🍷 *Bordeaux Heritage & Bronze* (Vintage Red `#481123` & Bronze `#bf8a48`)
  - 🌊 *Amalfi Azure & Terracotta* (Coastal Ocean `#034a74` & Terracotta `#d46a4e`)
  - 🖤 *Monaco Noir & Platinum* (Metropolitan Black `#161a1d` & Platinum `#ba9e6e`)
  - 🌸 *Santorini Mist & Sunset* (Aegean `#1d3557` & Sunset Coral `#e76f51`)
- **Hotel Identity Customization**: Hotel name, tagline, address, concierge phone, email, currency symbol (`$`, `€`, `£`, `¥`, `AED`, `CHF`), seasonal announcement banners, and hero photography.
- **Live Firestore Sync + Offline Fallback**: Settings are saved directly to Firebase Firestore with seamless local backup so your pitch demo **never fails** even in offline or restricted environments.

### 2. 📋 Admin Bookings Management Portal (`/admin`)
- **Real-Time Booking Status Pipeline**: Update reservations between `Confirmed`, `Checked In`, `Completed`, `Pending`, and `Cancelled`.
- **Search & Filter**: Search by guest name, reservation reference (e.g. `AUR-89214`), or suite type.
- **Guest Folio Modal**: View guest contacts, stay dates, selected luxury add-ons, price breakdowns, and bespoke requests (e.g. airport jet transfer, dietary needs).
- **Suites & Inventory**: Instant nightly rate editor, suite availability, and new suite creator.
- **Revenue & Analytics**: KPI metric cards for Gross Revenue, Resort Occupancy %, Active Bookings, and Average Daily Rate (ADR).

### 3. 🛎️ Full Guest Experience & Reservation Engine
- **Floating Availability Search Bar**: Check-in & check-out dates, guest count, and suite categories.
- **Suite Showcase & Dynamic Pages**: Filterable grid on `/` plus dedicated deep-dive dynamic routes at `/rooms/[id]`.
- **Interactive Multi-Step Booking Modal**:
  - *Step 1*: Dates & Suite selection with live night count calculation.
  - *Step 2*: Bespoke Add-ons (VIP Chauffeur, Dom Pérignon & Caviar, Couple's Botanical Spa, Champagne Breakfast).
  - *Step 3*: Guest information & special requests.
  - *Step 4*: Instant confirmation with generated Reference Code, status badge, and printable voucher receipt.
- **"Track Booking" Portal**: Guests or staff can enter their reference code (e.g. `AUR-89214`) to view their reservation summary anytime.

---

## 🚀 Quick Start Guide

### 1. Launch Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Production Build
```bash
npm run build
npm start
```

---

## 💼 How to Pitch This to a Client (Sales Meeting Script)

1. **Step 1: Open the website (`http://localhost:3000`) in front of the client**
   - Show the client the homepage. Point out the luxury typography, smooth navigation, and booking bar.
2. **Step 2: Rebrand the site in 5 seconds to match their hotel**
   - Click the **Admin CMS** button in the top navbar (or navigate directly to `/admin`).
   - In the **Branding & Theme Studio**, change the **Hotel Name** to their hotel's name.
   - Click one of the **1-Click Brand Themes** or use the color pickers to match their brand colors.
   - Return to the website — the entire site transforms to their brand identity in real-time!
3. **Step 3: Show the reservation experience**
   - Click **Book Stay**, pick a suite, select dates, toggle an add-on (like *VIP Airport Chauffeur*), and confirm the booking.
   - Show the generated confirmation voucher and reference code.
4. **Step 4: Demonstrate staff control in the CMS**
   - Open `/admin` and click **Bookings Manager**.
   - Show the newly created reservation appearing immediately at the top of the table.
   - Change the status from `Confirmed` to `Checked In`.
   - Open **Suites & Inventory** to demonstrate how easily they can modify nightly rates.
   - Show the **Revenue & Analytics** dashboard for occupancy and revenue insights.

---

## 🔒 Firebase Configuration

The project is pre-configured with the provided Firebase project credentials in `src/firebase.js`:
- **Project ID**: `hotel-demo-8b71d`
- **Auth Domain**: `hotel-demo-8b71d.firebaseapp.com`
- **Storage Bucket**: `hotel-demo-8b71d.firebasestorage.app`

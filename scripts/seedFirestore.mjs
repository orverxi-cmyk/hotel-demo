import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { defaultTheme, initialRooms, initialBookings, hotelAmenities, guestReviews } from "../src/data/initialData.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8P4bhQfpCj7w69olTS0OfrZbLKXFFdgc",
  authDomain: "hotel-demo-8b71d.firebaseapp.com",
  projectId: "hotel-demo-8b71d",
  storageBucket: "hotel-demo-8b71d.firebasestorage.app",
  messagingSenderId: "147315228890",
  appId: "1:147315228890:web:56a864b3dc95118e2da5e3",
  measurementId: "G-FZTXZE1VDX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const servicesSlides = [
  {
    id: 'suites',
    badge: 'ACCOMMODATIONS & RESIDENCES',
    number: '01',
    title: 'Palatial Suites & Private Oceanfront Villas',
    subtitle: 'Secluded architectural sanctuaries with private heated plunge pools, panoramic terraces, and 24/7 dedicated butler service.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Private Heated Plunge Pools', '24/7 Dedicated Butler', 'Direct Beach Access', 'Diptyque Bath Amenities'],
    actionLabel: 'Explore Suites & Villas',
    actionTarget: '#rooms',
    ctaLabel: 'Reserve Residence'
  },
  {
    id: 'dining',
    badge: 'MICHELIN GASTRONOMY & EATERY',
    number: '02',
    title: 'Michelin-Starred Dining & Sunset Terrazza',
    subtitle: 'An extraordinary epicurean journey guided by Master Chef Marco Valenti across three destinations, from seafood crudo to candlelit cellar tastings.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80',
    highlights: ['2 Michelin Stars', 'Cliffside Seafood Raw Bar', 'Sommelier Wine Pairings', 'Private Beach Dinners'],
    actionLabel: 'Explore Dining Venues',
    actionTarget: '#dining',
    ctaLabel: 'Book Tasting Table'
  },
  {
    id: 'spa',
    badge: 'THE BOTANICAL SPA & WELLNESS',
    number: '03',
    title: 'Holistic Thermal Spa & Herbal Lavender Baths',
    subtitle: 'Restorative cedar saunas, natural thermal mineral plunge pools, and organic estate aromatherapy designed for deep cellular renewal.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Thermal Mineral Pools', 'Private Cedar Saunas', 'Organic Aromatherapy', 'Cliffside Yoga Pavilion'],
    actionLabel: 'Discover Spa Rituals',
    actionTarget: '#amenities',
    ctaLabel: 'Book Spa Experience'
  },
  {
    id: 'yachts',
    badge: 'MARITIME FLEET & YACHT CHARTERS',
    number: '04',
    title: 'Private Riva Yacht & Island Catamaran Fleet',
    subtitle: 'Embark on private captained voyages to secret emerald coves, secluded archipelago beaches, and sunset champagne cruises across turquoise waters.',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Custom Riva Yacht Fleet', 'Sunset Champagne Cruises', 'Secluded Cove Expeditions', 'Private Skipper & Chef'],
    actionLabel: 'View Maritime Charters',
    actionTarget: '#amenities',
    ctaLabel: 'Inquire Yacht Charter'
  },
  {
    id: 'cellar',
    badge: 'SOMMELIER CELLAR & VINTAGES',
    number: '05',
    title: 'Historic 12,000 Vintage Sommelier Wine Vault',
    subtitle: 'An 18th-century subterranean cavern harboring legendary vintages, curated for intimate sommelier masterclasses and artisanal pairings.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80',
    highlights: ['12,000 Rare Bottles', 'Master Sommelier Hosted', 'Private Subterranean Vault', 'Aged Grand Crus'],
    actionLabel: 'Explore Wine Vault',
    actionTarget: '#dining',
    ctaLabel: 'Private Tasting Reservation'
  }
];

async function seed() {
  console.log("Seeding all content to Firestore project hotel-demo-8b71d...");

  // 1. Theme and branding
  await setDoc(doc(db, "settings", "theme"), defaultTheme);
  console.log("✓ Uploaded settings/theme");

  // 2. Services for hero slider
  for (const s of servicesSlides) {
    await setDoc(doc(db, "services", s.id), s);
  }
  console.log("✓ Uploaded services (5 slides)");

  // 3. Rooms
  for (const r of initialRooms) {
    await setDoc(doc(db, "rooms", r.id), r);
  }
  console.log(`✓ Uploaded ${initialRooms.length} rooms`);

  // 4. Bookings
  for (const b of initialBookings) {
    await setDoc(doc(db, "bookings", b.id), b);
  }
  console.log(`✓ Uploaded ${initialBookings.length} bookings`);

  // 5. Amenities
  await setDoc(doc(db, "content", "amenities"), { items: hotelAmenities });
  console.log("✓ Uploaded content/amenities");

  // 6. Reviews
  await setDoc(doc(db, "content", "reviews"), { items: guestReviews });
  console.log("✓ Uploaded content/reviews");

  // 7. Admin Users
  await setDoc(doc(db, "settings", "admin_users"), {
    users: [
      {
        id: "admin-super",
        name: "Super Administrator",
        email: "tharushyamagara@gmail.com",
        role: "SUPER_ADMIN",
        createdAt: "2026-10-01"
      },
      {
        id: "admin-normal-1",
        name: "Front Desk Operator",
        email: "operator@hotel.com",
        password: "Operator#2026",
        role: "NORMAL_ADMIN",
        createdAt: "2026-10-15"
      }
    ]
  });
  console.log("✓ Uploaded settings/admin_users");

  console.log("All hotel content successfully synced to Firestore!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Firestore error:", err);
  process.exit(1);
});


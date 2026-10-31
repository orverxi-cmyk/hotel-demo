import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  const usersToConfigure = [
    { email: 'tharushyamagara@gmail.com', name: 'Super Administrator', password: 'Gavyn#123@Olga' },
    { email: 'admin@hotel.com', name: 'Hotel Administrator', password: 'Gavyn#123@Olga' }
  ];

  for (const u of usersToConfigure) {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(u.email);
      console.log(`Found existing user ${u.email} (UID: ${userRecord.uid})`);
      // Update password to ensure it matches
      await auth.updateUser(userRecord.uid, {
        password: u.password,
        displayName: u.name
      });
      console.log(`Updated password for ${u.email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.name
        });
        console.log(`Created user ${u.email} (UID: ${userRecord.uid})`);
      } else {
        throw err;
      }
    }

    // Set custom claims: role=SUPER_ADMIN, admin=true
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'SUPER_ADMIN',
      admin: true
    });
    console.log(`Assigned SUPER_ADMIN custom claims to ${u.email}`);

    // Create / update doc in Firestore /admins/{uid}
    await db.collection('admins').doc(userRecord.uid).set({
      email: u.email,
      name: u.name,
      role: 'SUPER_ADMIN',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`Saved /admins/${userRecord.uid} in Firestore`);
  }

  // Also seed initial services in Firestore so collection is populated
  const servicesSlides = [
    {
      id: 'suites',
      badge: 'ACCOMMODATIONS & RESIDENCES',
      number: '01',
      title: 'Palatial Suites & Private Oceanfront Villas',
      subtitle: 'Secluded architectural sanctuaries with private heated plunge pools, panoramic terraces, and 24/7 dedicated butler service.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
      mediaType: 'image',
      videoUrl: '',
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
      mediaType: 'image',
      videoUrl: '',
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
      mediaType: 'image',
      videoUrl: '',
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
      mediaType: 'image',
      videoUrl: '',
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
      mediaType: 'image',
      videoUrl: '',
      highlights: ['12,000 Rare Bottles', 'Master Sommelier Hosted', 'Private Subterranean Vault', 'Aged Grand Crus'],
      actionLabel: 'Explore Wine Vault',
      actionTarget: '#dining',
      ctaLabel: 'Private Tasting Reservation'
    }
  ];

  for (const s of servicesSlides) {
    await db.collection('services').doc(s.id).set(s, { merge: true });
    console.log(`Seeded slide /services/${s.id}`);
  }

  console.log("ALL SUPER ADMINS AND SLIDES CONFIGURED SUCCESSFULLY!");
  process.exit(0);
}

run().catch(err => {
  console.error("Execution error:", err);
  process.exit(1);
});

import { db, storage } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { defaultTheme, initialRooms, initialBookings, hotelAmenities, guestReviews } from "../data/initialData";

const LS_THEME_KEY = "hotel_demo_theme";
const LS_ROOMS_KEY = "hotel_demo_rooms";
const LS_BOOKINGS_KEY = "hotel_demo_bookings";

const isClient = typeof window !== "undefined";

let firestoreAvailable = null;

// Test Firestore connection safely
export const testFirestoreConnection = async () => {
  if (firestoreAvailable !== null) return firestoreAvailable;
  try {
    const testDoc = doc(db, "_health", "ping");
    await getDoc(testDoc);
    firestoreAvailable = true;
  } catch (err) {
    console.warn("Firestore not reachable or permissions restricted. Using seamless local storage mode.", err?.message);
    firestoreAvailable = false;
  }
  return firestoreAvailable;
};

// --- THEME SETTINGS ---
export const loadThemeSettings = async () => {
  const cached = isClient ? localStorage.getItem(LS_THEME_KEY) : null;
  let currentTheme = cached ? JSON.parse(cached) : defaultTheme;

  try {
    const themeDocRef = doc(db, "settings", "theme");
    const snapshot = await getDoc(themeDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      currentTheme = { ...defaultTheme, ...data };
      if (isClient) {
        localStorage.setItem(LS_THEME_KEY, JSON.stringify(currentTheme));
      }
    } else {
      await setDoc(themeDocRef, defaultTheme).catch(() => {});
    }
  } catch (err) {
    console.warn("Using cached/default theme settings:", err?.message);
  }

  return currentTheme;
};

export const saveThemeSettings = async (settings) => {
  if (isClient) {
    localStorage.setItem(LS_THEME_KEY, JSON.stringify(settings));
  }

  try {
    const themeDocRef = doc(db, "settings", "theme");
    await setDoc(themeDocRef, settings, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Saved to local storage, Firestore sync skipped:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

// --- ROOMS ---
export const loadRooms = async () => {
  const cached = isClient ? localStorage.getItem(LS_ROOMS_KEY) : null;
  let rooms = cached ? JSON.parse(cached) : initialRooms;

  try {
    const roomsCol = collection(db, "rooms");
    const snapshot = await getDocs(roomsCol);
    if (!snapshot.empty) {
      rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (isClient) {
        localStorage.setItem(LS_ROOMS_KEY, JSON.stringify(rooms));
      }
    } else {
      for (const room of initialRooms) {
        await setDoc(doc(db, "rooms", room.id), room).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Using cached/default rooms:", err?.message);
  }

  return rooms;
};

export const saveRoom = async (roomData) => {
  const cached = isClient ? localStorage.getItem(LS_ROOMS_KEY) : null;
  let rooms = cached ? JSON.parse(cached) : initialRooms;
  const index = rooms.findIndex(r => r.id === roomData.id);

  if (index >= 0) {
    rooms[index] = roomData;
  } else {
    rooms.unshift(roomData);
  }
  if (isClient) {
    localStorage.setItem(LS_ROOMS_KEY, JSON.stringify(rooms));
  }

  try {
    await setDoc(doc(db, "rooms", roomData.id), roomData, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
};

export const deleteRoomById = async (roomId) => {
  const cached = isClient ? localStorage.getItem(LS_ROOMS_KEY) : null;
  let rooms = cached ? JSON.parse(cached) : initialRooms;
  rooms = rooms.filter(r => r.id !== roomId);
  if (isClient) {
    localStorage.setItem(LS_ROOMS_KEY, JSON.stringify(rooms));
  }

  try {
    await deleteDoc(doc(db, "rooms", roomId));
  } catch (err) {
    console.warn("Firestore delete failed, updated locally:", err?.message);
  }
  return true;
};

// --- BOOKINGS ---
export const loadBookings = async () => {
  const cached = isClient ? localStorage.getItem(LS_BOOKINGS_KEY) : null;
  let bookings = cached ? JSON.parse(cached) : initialBookings;

  try {
    const bookingsCol = collection(db, "bookings");
    const snapshot = await getDocs(bookingsCol);
    if (!snapshot.empty) {
      bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (isClient) {
        localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(bookings));
      }
    } else {
      for (const b of initialBookings) {
        await setDoc(doc(db, "bookings", b.id), b).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Using cached/default bookings:", err?.message);
  }

  return bookings;
};

export const saveBooking = async (bookingData) => {
  const cached = isClient ? localStorage.getItem(LS_BOOKINGS_KEY) : null;
  let bookings = cached ? JSON.parse(cached) : initialBookings;
  
  const index = bookings.findIndex(b => b.id === bookingData.id);
  if (index >= 0) {
    bookings[index] = bookingData;
  } else {
    bookings.unshift(bookingData);
  }
  if (isClient) {
    localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(bookings));
  }

  try {
    await setDoc(doc(db, "bookings", bookingData.id), bookingData, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
};

export const updateBookingStatus = async (bookingId, newStatus) => {
  const cached = isClient ? localStorage.getItem(LS_BOOKINGS_KEY) : null;
  let bookings = cached ? JSON.parse(cached) : initialBookings;
  
  const b = bookings.find(item => item.id === bookingId);
  if (b) {
    b.status = newStatus;
    if (isClient) {
      localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(bookings));
    }
  }

  try {
    await updateDoc(doc(db, "bookings", bookingId), { status: newStatus });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
};

// --- RESET DEMO DATA ---
export const resetAllDemoData = async () => {
  if (isClient) {
    localStorage.setItem(LS_THEME_KEY, JSON.stringify(defaultTheme));
    localStorage.setItem(LS_ROOMS_KEY, JSON.stringify(initialRooms));
    localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(initialBookings));
  }

  try {
    await setDoc(doc(db, "settings", "theme"), defaultTheme);
    for (const r of initialRooms) {
      await setDoc(doc(db, "rooms", r.id), r);
    }
    for (const b of initialBookings) {
      await setDoc(doc(db, "bookings", b.id), b);
    }
  } catch (err) {
    console.warn("Demo reset done locally:", err?.message);
  }

  return { theme: defaultTheme, rooms: initialRooms, bookings: initialBookings };
};

// --- SYNC ALL CONTENT TO FIRESTORE ---
export const syncAllContentToFirestore = async () => {
  const currentTheme = await loadThemeSettings();
  const currentRooms = await loadRooms();
  const currentBookings = await loadBookings();

  const results = {
    theme: false,
    rooms: 0,
    bookings: 0,
    amenities: false,
    reviews: false,
    error: null
  };

  try {
    // 1. Theme
    await setDoc(doc(db, "settings", "theme"), currentTheme, { merge: true });
    results.theme = true;

    // 2. Rooms
    for (const r of currentRooms) {
      await setDoc(doc(db, "rooms", r.id), r, { merge: true });
      results.rooms++;
    }

    // 3. Bookings
    for (const b of currentBookings) {
      await setDoc(doc(db, "bookings", b.id), b, { merge: true });
      results.bookings++;
    }

    // 4. Amenities
    await setDoc(doc(db, "content", "amenities"), { items: hotelAmenities });
    results.amenities = true;

    // 5. Reviews
    await setDoc(doc(db, "content", "reviews"), { items: guestReviews });
    results.reviews = true;

    return { success: true, results };
  } catch (err) {
    console.error("Firestore sync error:", err);
    return { success: false, error: err.message, results };
  }
};

// --- ADMIN USERS & ROLE MANAGEMENT ---
const LS_ADMINS_KEY = "hotel_demo_admin_users";

export const initialAdminUsers = [
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
];

export const loadAdminUsers = async () => {
  const cached = isClient ? localStorage.getItem(LS_ADMINS_KEY) : null;
  let admins = cached ? JSON.parse(cached) : initialAdminUsers;

  try {
    const docRef = doc(db, "settings", "admin_users");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data?.users && Array.isArray(data.users)) {
        admins = data.users;
        if (isClient) localStorage.setItem(LS_ADMINS_KEY, JSON.stringify(admins));
      }
    }
  } catch (err) {
    console.warn("Using local admin users list:", err?.message);
  }

  return admins;
};

export const saveAdminUsers = async (users) => {
  if (isClient) localStorage.setItem(LS_ADMINS_KEY, JSON.stringify(users));
  try {
    await setDoc(doc(db, "settings", "admin_users"), { users }, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
};

// --- HERO SLIDER & MEDIA MANAGEMENT ---
export const initialSliderSlides = [
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

const LS_SLIDER_KEY = "hotel_demo_slider_slides";

export const loadSliderSlides = async () => {
  const cached = isClient ? localStorage.getItem(LS_SLIDER_KEY) : null;
  let slides = cached ? JSON.parse(cached) : initialSliderSlides;

  try {
    const q = collection(db, "services");
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const remote = [];
      snapshot.forEach(docSnap => {
        remote.push({ id: docSnap.id, ...docSnap.data() });
      });
      remote.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
      slides = remote;
      if (isClient) localStorage.setItem(LS_SLIDER_KEY, JSON.stringify(slides));
    }
  } catch (err) {
    console.warn("Using local slider slides:", err?.message);
  }

  return slides;
};

export const saveSliderSlide = async (slide) => {
  const cached = isClient ? localStorage.getItem(LS_SLIDER_KEY) : null;
  let slides = cached ? JSON.parse(cached) : initialSliderSlides;
  const idx = slides.findIndex(s => s.id === slide.id);
  if (idx >= 0) {
    slides[idx] = slide;
  } else {
    slides.push(slide);
  }
  if (isClient) localStorage.setItem(LS_SLIDER_KEY, JSON.stringify(slides));

  try {
    await setDoc(doc(db, "services", slide.id), slide, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

// Upload media file (photo or video) to Firebase Storage
export const uploadMediaFile = async (file, folder = 'slider', onProgress = null) => {
  if (!file) throw new Error("No file selected.");

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  if (!isImage && !isVideo) {
    throw new Error("Invalid format. Please select an image (.jpg, .png, .webp) or video (.mp4, .webm).");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
  const filePath = `${folder}/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, filePath);

  try {
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.warn("Firebase Storage cloud upload error, falling back to local object URL:", error?.message);
          const localUrl = URL.createObjectURL(file);
          resolve({
            success: true,
            url: localUrl,
            mediaType: isVideo ? "video" : "image",
            isLocal: true,
            error: error.message
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadUrl,
              mediaType: isVideo ? "video" : "image",
              path: filePath,
              isLocal: false
            });
          } catch (err) {
            const localUrl = URL.createObjectURL(file);
            resolve({
              success: true,
              url: localUrl,
              mediaType: isVideo ? "video" : "image",
              isLocal: true,
              error: err.message
            });
          }
        }
      );
    });
  } catch (err) {
    const localUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: localUrl,
      mediaType: isVideo ? "video" : "image",
      isLocal: true,
      error: err.message
    };
  }
};

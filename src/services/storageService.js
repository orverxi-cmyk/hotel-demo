import { db, storage } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { defaultTheme, initialRooms, initialBookings, hotelAmenities, guestReviews, initialNavMenus, initialDiningVenues, availableDiningAddons, initialArticles, initialSectionHeaders } from "../data/initialData";

const LS_THEME_KEY = "hotel_demo_theme";
const LS_ROOMS_KEY = "hotel_demo_rooms";
const LS_BOOKINGS_KEY = "hotel_demo_bookings";
const LS_NAV_MENUS_KEY = "hotel_demo_navigation_menus";
const LS_DINING_KEY = "hotel_demo_dining_venues";
const LS_ARTICLES_KEY = "hotel_demo_articles";
const LS_SECTION_HEADERS_KEY = "hotel_demo_section_headers";

export { initialNavMenus, initialDiningVenues, availableDiningAddons, initialArticles, initialSectionHeaders };

const isClient = typeof window !== "undefined";

const CMS_BROADCAST_CHANNEL = "hotel_cms_realtime_sync";

export const broadcastUpdate = (type, payload) => {
  if (!isClient) return;
  try {
    const bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.postMessage({ type, payload });
    bc.close();
  } catch (_) {}
  try {
    window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  } catch (_) {}
};

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
export const getCachedTheme = () => {
  if (!isClient) return defaultTheme;
  try {
    const cached = localStorage.getItem(LS_THEME_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        // Clear legacy unsplash demo photo unless user explicitly configured 'photo' mode
        if (parsed.heroBgMode !== 'photo' && parsed.heroImage && (parsed.heroImage.includes('unsplash.com') || parsed.heroImage.includes('photo-'))) {
          parsed.heroImage = '';
          try { localStorage.setItem(LS_THEME_KEY, JSON.stringify(parsed)); } catch (_) {}
        }
        return { ...defaultTheme, ...parsed };
      }
    }
  } catch (_) {}
  return defaultTheme;
};

export const subscribeThemeSettings = (callback) => {
  const initial = getCachedTheme();
  if (initial) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const themeDocRef = doc(db, "settings", "theme");
    unsubscribeFirestore = onSnapshot(themeDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentTheme = { ...defaultTheme, ...data };
        if (currentTheme.heroBgMode !== 'photo' && currentTheme.heroImage && (currentTheme.heroImage.includes('unsplash.com') || currentTheme.heroImage.includes('photo-'))) {
          currentTheme.heroImage = '';
        }
        if (isClient) {
          localStorage.setItem(LS_THEME_KEY, JSON.stringify(currentTheme));
        }
        callback(currentTheme);
      }
    }, (err) => {
      console.warn("Theme onSnapshot note:", err?.message);
    });
  } catch (_) {}

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_theme_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_THEME_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed) callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_theme_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_theme_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadThemeSettings = async () => {
  const cached = getCachedTheme();
  let currentTheme = cached;

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
    broadcastUpdate("hotel_theme_updated", settings);
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
export const getCachedRooms = () => {
  if (!isClient) return initialRooms;
  try {
    const cached = localStorage.getItem(LS_ROOMS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r) => {
          const init = initialRooms.find((ir) => ir.id === r.id);
          return {
            ...r,
            quantity: typeof r.quantity === 'number' && r.quantity > 0 ? r.quantity : (init?.quantity || 2),
            location: r.location || init?.location || "Resort Wing Suite"
          };
        });
      }
    }
  } catch (_) {}
  return initialRooms;
};

export const subscribeRooms = (callback) => {
  const initial = getCachedRooms();
  if (initial && initial.length > 0) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const roomsCol = collection(db, "rooms");
    unsubscribeFirestore = onSnapshot(roomsCol, (snapshot) => {
      if (!snapshot.empty) {
        const remote = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        if (isClient) {
          localStorage.setItem(LS_ROOMS_KEY, JSON.stringify(remote));
        }
        callback(remote);
      }
    }, (err) => {
      console.warn("Rooms onSnapshot note:", err?.message);
    });
  } catch (_) {}

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_rooms_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail && Array.isArray(e.detail)) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_ROOMS_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_rooms_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_rooms_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadRooms = async () => {
  const cached = getCachedRooms();
  let rooms = cached;

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
    broadcastUpdate("hotel_rooms_updated", rooms);
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
    broadcastUpdate("hotel_rooms_updated", rooms);
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
    articles: false,
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

    // 6. Discover Articles
    const currentArticles = await loadArticles();
    await setDoc(doc(db, "content", "articles"), { items: currentArticles, updatedAt: new Date().toISOString() });
    results.articles = true;

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
    title: 'Palatial Suites & Private Oceanfront Villas',
    subtitle: 'Secluded architectural sanctuaries with private heated plunge pools, panoramic terraces, and 24/7 dedicated butler service.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    mediaType: 'image',
    videoUrl: '',
    highlights: ['Private Heated Plunge Pools', '24/7 Dedicated Butler', 'Direct Beach Access', 'Diptyque Bath Amenities'],
    ctaLabel: 'Reserve Residence',
    destinationLink: '/discover?article=article-villas-architecture',
    actionLabel: 'Explore Suites & Villas',
    actionTarget: '/rooms'
  },
  {
    id: 'dining',
    title: 'Michelin-Starred Dining & Sunset Terrazza',
    subtitle: 'An extraordinary epicurean journey guided by Master Chef Marco Valenti across three destinations, from seafood crudo to candlelit cellar tastings.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80',
    mediaType: 'image',
    videoUrl: '',
    highlights: ['2 Michelin Stars', 'Cliffside Seafood Raw Bar', 'Sommelier Wine Pairings', 'Private Beach Dinners'],
    ctaLabel: 'Book Tasting Table',
    destinationLink: '/discover?article=article-michelin-story',
    actionLabel: 'Explore Dining Venues',
    actionTarget: '/dining'
  },
  {
    id: 'spa',
    title: 'Holistic Thermal Spa & Herbal Lavender Baths',
    subtitle: 'Restorative cedar saunas, natural thermal mineral plunge pools, and organic estate aromatherapy designed for deep cellular renewal.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
    mediaType: 'image',
    videoUrl: '',
    highlights: ['Thermal Mineral Pools', 'Private Cedar Saunas', 'Organic Aromatherapy', 'Cliffside Yoga Pavilion'],
    ctaLabel: 'Book Spa Experience',
    destinationLink: '/discover?article=article-botanical-spa',
    actionLabel: 'Discover Spa Rituals',
    actionTarget: '/amenities'
  },
  {
    id: 'yachts',
    title: 'Private Riva Yacht & Island Catamaran Fleet',
    subtitle: 'Embark on private captained voyages to secret emerald coves, secluded archipelago beaches, and sunset champagne cruises across turquoise waters.',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1600&q=80',
    mediaType: 'image',
    videoUrl: '',
    highlights: ['Custom Riva Yacht Fleet', 'Sunset Champagne Cruises', 'Secluded Cove Expeditions', 'Private Skipper & Chef'],
    ctaLabel: 'Inquire Yacht Charter',
    destinationLink: '/discover?article=article-yacht-expeditions',
    actionLabel: 'View Maritime Charters',
    actionTarget: '/amenities'
  },
  {
    id: 'cellar',
    title: 'Historic 12,000 Vintage Sommelier Wine Vault',
    subtitle: 'An 18th-century subterranean cavern harboring legendary vintages, curated for intimate sommelier masterclasses and artisanal pairings.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80',
    mediaType: 'image',
    videoUrl: '',
    highlights: ['12,000 Rare Bottles', 'Master Sommelier Hosted', 'Private Subterranean Vault', 'Aged Grand Crus'],
    ctaLabel: 'Private Tasting Reservation',
    destinationLink: '/discover?article=article-wine-vault',
    actionLabel: 'Explore Wine Vault',
    actionTarget: '/dining'
  }
];

const LS_SLIDER_KEY = "hotel_demo_slider_slides";

export const getCachedSliderSlides = () => {
  if (!isClient) return initialSliderSlides;
  try {
    const cached = localStorage.getItem(LS_SLIDER_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return initialSliderSlides;
};

export const subscribeSliderSlides = (callback) => {
  const initial = getCachedSliderSlides();
  if (initial && initial.length > 0) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const q = collection(db, "services");
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remote = [];
        snapshot.forEach(docSnap => {
          remote.push({ id: docSnap.id, ...docSnap.data() });
        });
        remote.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
        if (isClient) {
          localStorage.setItem(LS_SLIDER_KEY, JSON.stringify(remote));
        }
        callback(remote);
      }
    }, (err) => {
      console.warn("Firestore slider onSnapshot note:", err?.message);
    });
  } catch (err) {
    console.warn("Could not attach Firestore onSnapshot:", err?.message);
  }

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_slider_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail && Array.isArray(e.detail)) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_SLIDER_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_slider_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_slider_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadSliderSlides = async () => {
  const cached = getCachedSliderSlides();
  let slides = cached;

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
  if (isClient) {
    localStorage.setItem(LS_SLIDER_KEY, JSON.stringify(slides));
    broadcastUpdate("hotel_slider_updated", slides);
  }

  try {
    await setDoc(doc(db, "services", slide.id), slide, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore saveSliderSlide note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

export const saveSliderSlides = async (slidesList) => {
  if (isClient) {
    localStorage.setItem(LS_SLIDER_KEY, JSON.stringify(slidesList));
    broadcastUpdate("hotel_slider_updated", slidesList);
  }

  try {
    const promises = slidesList.map(s => setDoc(doc(db, "services", s.id), s, { merge: true }));
    await Promise.all(promises);
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore saveSliderSlides note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

export const deleteSliderSlide = async (slideId) => {
  const cached = isClient ? localStorage.getItem(LS_SLIDER_KEY) : null;
  let slides = cached ? JSON.parse(cached) : initialSliderSlides;
  slides = slides.filter(s => s.id !== slideId);

  if (isClient) {
    localStorage.setItem(LS_SLIDER_KEY, JSON.stringify(slides));
    broadcastUpdate("hotel_slider_updated", slides);
  }

  try {
    await deleteDoc(doc(db, "services", slideId));
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore deleteSliderSlide note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

export const resetSliderSlides = async () => {
  return await saveSliderSlides(initialSliderSlides);
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

// --- WEBSITE NAVIGATION MENUS MANAGEMENT ---
const sanitizeNavMenuItems = (items) => {
  if (!Array.isArray(items)) return items;
  return items.map(m => {
    if (m && typeof m.href === 'string' && m.href.includes('/#')) {
      return {
        ...m,
        href: m.href.replace('/#', '/')
      };
    }
    return m;
  });
};

export const getCachedNavMenus = () => {
  if (!isClient) return initialNavMenus;
  try {
    const cached = localStorage.getItem(LS_NAV_MENUS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return sanitizeNavMenuItems(parsed);
    }
  } catch (_) {}
  return initialNavMenus;
};

export const subscribeNavMenus = (callback) => {
  const initial = getCachedNavMenus();
  if (initial && initial.length > 0) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const menusDocRef = doc(db, "settings", "menus");
    unsubscribeFirestore = onSnapshot(menusDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const sanitized = sanitizeNavMenuItems(data.items);
          if (isClient) {
            localStorage.setItem(LS_NAV_MENUS_KEY, JSON.stringify(sanitized));
          }
          callback(sanitized);
        }
      }
    }, (err) => {
      console.warn("Firestore nav menus onSnapshot note:", err?.message);
    });
  } catch (_) {}

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_menus_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail && Array.isArray(e.detail)) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_NAV_MENUS_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_menus_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_menus_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadNavMenus = async () => {
  const cached = getCachedNavMenus();
  let menus = cached;

  try {
    const menusDocRef = doc(db, "settings", "menus");
    const snapshot = await getDoc(menusDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data.items)) {
        menus = data.items;
        if (isClient) localStorage.setItem(LS_NAV_MENUS_KEY, JSON.stringify(menus));
      }
    } else {
      await setDoc(menusDocRef, { items: initialNavMenus }).catch(() => {});
    }
  } catch (err) {
    console.warn("Using local nav menus:", err?.message);
  }

  return menus;
};

export const saveNavMenus = async (menusList) => {
  if (isClient) {
    localStorage.setItem(LS_NAV_MENUS_KEY, JSON.stringify(menusList));
    broadcastUpdate("hotel_menus_updated", menusList);
  }

  try {
    const menusDocRef = doc(db, "settings", "menus");
    await setDoc(menusDocRef, { items: menusList, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore saveNavMenus note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

export const resetNavMenus = async () => {
  return await saveNavMenus(initialNavMenus);
};

// Maps a navigation menu item to its corresponding homepage landing section key
export const getRelatedSectionKey = (menu) => {
  if (!menu) return null;
  const href = (menu.href || '').toLowerCase().trim();
  const rawTarget = (menu.targetId || '').toLowerCase().replace(/^#+/, '').trim();
  const id = (menu.id || '').toLowerCase().trim();
  const label = (menu.label || '').toLowerCase().trim();

  // Extract hash anchor if present in href (e.g. "/#amenities", "#amenities", "/#amenities/")
  let hashAnchor = '';
  if (href.includes('#')) {
    const afterHash = href.split('#')[1].split('/')[0].split('?')[0].trim();
    if (afterHash) hashAnchor = afterHash;
  }

  // Anchor in href or explicit target takes the HIGHEST priority
  const candidate = hashAnchor || rawTarget;

  if (candidate) {
    if (candidate === 'rooms' || candidate.includes('room') || candidate.includes('suite')) return 'rooms';
    if (candidate === 'amenities' || candidate.includes('amenit') || candidate.includes('experience') || candidate.includes('spa')) return 'amenities';
    if (candidate === 'dining' || candidate.includes('dining') || candidate.includes('gastronomy') || candidate.includes('restaurant')) return 'dining';
    if (candidate === 'discover' || candidate.includes('discover') || candidate.includes('article') || candidate.includes('chronicle')) return 'discover';
    if (candidate === 'gallery' || candidate.includes('gallery') || candidate.includes('visual')) return 'gallery';
    if (candidate === 'reviews' || candidate.includes('review') || candidate.includes('testimonial') || candidate.includes('acclaim')) return 'reviews';
    if (candidate === 'contact' || candidate === 'location' || candidate.includes('contact') || candidate.includes('location') || candidate.includes('concierge')) return 'location';
  }

  // Check plain path slugs, e.g. "/amenities" or "amenities"
  const cleanPath = href.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (cleanPath === 'rooms' || cleanPath.includes('room')) return 'rooms';
  if (cleanPath === 'amenities' || cleanPath.includes('amenit')) return 'amenities';
  if (cleanPath === 'dining' || cleanPath.includes('dining')) return 'dining';
  if (cleanPath === 'discover' || cleanPath.includes('discover')) return 'discover';
  if (cleanPath === 'gallery' || cleanPath.includes('gallery')) return 'gallery';
  if (cleanPath === 'reviews' || cleanPath.includes('review')) return 'reviews';
  if (cleanPath === 'contact' || cleanPath === 'location') return 'location';

  // Fallback to menu label or id only if href/target has no explicit destination
  if (id.includes('rooms') || label.includes('room') || label.includes('suite')) return 'rooms';
  if (id.includes('amenities') || label.includes('amenit') || label.includes('experience') || label.includes('spa')) return 'amenities';
  if (id.includes('dining') || label.includes('dining') || label.includes('gastronomy') || label.includes('restaurant')) return 'dining';
  if (id.includes('discover') || label.includes('discover') || label.includes('article') || label.includes('chronicle')) return 'discover';
  if (id.includes('gallery') || label.includes('gallery') || label.includes('visual')) return 'gallery';
  if (id.includes('reviews') || label.includes('review') || label.includes('testimonial') || label.includes('acclaim')) return 'reviews';
  if (id.includes('contact') || id.includes('location') || label.includes('contact') || label.includes('location') || label.includes('concierge')) return 'location';

  return null;
};

// Returns true if all active navigation menus corresponding to the given section are hidden
export const isSectionHiddenByMenu = (sectionKey, navMenusList) => {
  if (!sectionKey || !Array.isArray(navMenusList) || navMenusList.length === 0) return false;
  const matchingMenus = navMenusList.filter((m) => getRelatedSectionKey(m) === sectionKey);
  if (matchingMenus.length === 0) return false;
  // If at least one matching menu is visible, the section MUST remain visible
  const hasVisibleMatch = matchingMenus.some((m) => m.visible !== false);
  if (hasVisibleMatch) return false;
  // Hidden only if all menus linked to this section are explicitly hidden
  return true;
};

// --- DINING MENUS & VENUES MANAGEMENT ---
export const getCachedDiningVenues = () => {
  if (!isClient) return initialDiningVenues;
  try {
    const cached = localStorage.getItem(LS_DINING_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((v) => {
          const init = initialDiningVenues.find((iv) => iv.id === v.id);
          return {
            ...v,
            location: v.location || init?.location || "Hotel Promenade",
            timeSlots: v.timeSlots || init?.timeSlots || ["19:00", "20:00", "21:00"],
            tables: Array.isArray(v.tables) && v.tables.length > 0 ? v.tables : (init?.tables || [])
          };
        });
      }
    }
  } catch (_) {}
  return initialDiningVenues;
};

export const subscribeDiningVenues = (callback) => {
  const initial = getCachedDiningVenues();
  if (initial && initial.length > 0) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const diningDocRef = doc(db, "content", "dining");
    unsubscribeFirestore = onSnapshot(diningDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          if (isClient) {
            localStorage.setItem(LS_DINING_KEY, JSON.stringify(data.items));
          }
          callback(data.items);
        }
      }
    }, (err) => {
      console.warn("Firestore dining onSnapshot note:", err?.message);
    });
  } catch (_) {}

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_dining_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail && Array.isArray(e.detail)) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_DINING_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_dining_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_dining_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadDiningVenues = async () => {
  const cached = getCachedDiningVenues();
  let venues = cached;

  try {
    const diningDocRef = doc(db, "content", "dining");
    const snapshot = await getDoc(diningDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data.items)) {
        venues = data.items;
        if (isClient) localStorage.setItem(LS_DINING_KEY, JSON.stringify(venues));
      }
    } else {
      await setDoc(diningDocRef, { items: initialDiningVenues }).catch(() => {});
    }
  } catch (err) {
    console.warn("Using local dining venues:", err?.message);
  }

  return venues;
};

export const saveDiningVenues = async (venuesList) => {
  if (isClient) {
    localStorage.setItem(LS_DINING_KEY, JSON.stringify(venuesList));
    broadcastUpdate("hotel_dining_updated", venuesList);
  }

  try {
    const diningDocRef = doc(db, "content", "dining");
    await setDoc(diningDocRef, { items: venuesList, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore saveDiningVenues note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

// --- DISCOVER ARTICLES & MULTI-PHOTO STORIES MANAGEMENT ---
export const getCachedArticles = () => {
  if (!isClient) return initialArticles;
  try {
    const cached = localStorage.getItem(LS_ARTICLES_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return initialArticles;
};

export const subscribeArticles = (callback) => {
  const initial = getCachedArticles();
  if (initial && initial.length > 0) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const articlesDocRef = doc(db, "content", "articles");
    unsubscribeFirestore = onSnapshot(articlesDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          if (isClient) {
            localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(data.items));
          }
          callback(data.items);
        }
      }
    }, (err) => {
      console.warn("Firestore articles onSnapshot note:", err?.message);
    });
  } catch (_) {}

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_articles_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail && Array.isArray(e.detail)) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_ARTICLES_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_articles_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_articles_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadArticles = async () => {
  const cached = getCachedArticles();
  let articles = cached;

  try {
    const articlesDocRef = doc(db, "content", "articles");
    const snapshot = await getDoc(articlesDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data.items)) {
        articles = data.items;
        if (isClient) localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(articles));
      }
    } else {
      await setDoc(articlesDocRef, { items: initialArticles, updatedAt: new Date().toISOString() }).catch(() => {});
    }
  } catch (err) {
    console.warn("Using local articles:", err?.message);
  }

  return articles;
};

export const saveArticles = async (articlesList) => {
  if (isClient) {
    localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(articlesList));
    broadcastUpdate("hotel_articles_updated", articlesList);
  }

  try {
    const articlesDocRef = doc(db, "content", "articles");
    await setDoc(articlesDocRef, { items: articlesList, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore saveArticles note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

export const saveArticle = async (article) => {
  const cached = isClient ? localStorage.getItem(LS_ARTICLES_KEY) : null;
  let articles = cached ? JSON.parse(cached) : initialArticles;
  const idx = articles.findIndex(a => a.id === article.id);
  if (idx >= 0) {
    articles[idx] = article;
  } else {
    articles.push(article);
  }
  return await saveArticles(articles);
};

export const deleteArticle = async (articleId) => {
  const cached = isClient ? localStorage.getItem(LS_ARTICLES_KEY) : null;
  let articles = cached ? JSON.parse(cached) : initialArticles;
  articles = articles.filter(a => a.id !== articleId);
  return await saveArticles(articles);
};

export const resetArticles = async () => {
  return await saveArticles(initialArticles);
};

// --- SECTION HEADERS & PAGE COPY MANAGEMENT ---
export const getCachedSectionHeaders = () => {
  if (!isClient) return initialSectionHeaders;
  try {
    const cached = localStorage.getItem(LS_SECTION_HEADERS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return {
          ...initialSectionHeaders,
          ...parsed,
          rooms: { ...initialSectionHeaders.rooms, ...(parsed.rooms || {}) },
          amenities: { ...initialSectionHeaders.amenities, ...(parsed.amenities || {}) },
          dining: { ...initialSectionHeaders.dining, ...(parsed.dining || {}) },
          discover: { ...initialSectionHeaders.discover, ...(parsed.discover || {}) },
          gallery: { ...initialSectionHeaders.gallery, ...(parsed.gallery || {}) },
          reviews: { ...initialSectionHeaders.reviews, ...(parsed.reviews || {}) },
          location: { ...initialSectionHeaders.location, ...(parsed.location || {}) }
        };
      }
    }
  } catch (_) {}
  return initialSectionHeaders;
};

export const subscribeSectionHeaders = (callback) => {
  const initial = getCachedSectionHeaders();
  if (initial) callback(initial);

  let unsubscribeFirestore = () => {};
  try {
    const headersDocRef = doc(db, "content", "section_headers");
    unsubscribeFirestore = onSnapshot(headersDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data === 'object') {
          const merged = {
            ...initialSectionHeaders,
            ...data,
            rooms: { ...initialSectionHeaders.rooms, ...(data.rooms || {}) },
            amenities: { ...initialSectionHeaders.amenities, ...(data.amenities || {}) },
            dining: { ...initialSectionHeaders.dining, ...(data.dining || {}) },
            discover: { ...initialSectionHeaders.discover, ...(data.discover || {}) },
            gallery: { ...initialSectionHeaders.gallery, ...(data.gallery || {}) },
            reviews: { ...initialSectionHeaders.reviews, ...(data.reviews || {}) },
            location: { ...initialSectionHeaders.location, ...(data.location || {}) }
          };
          if (isClient) {
            localStorage.setItem(LS_SECTION_HEADERS_KEY, JSON.stringify(merged));
          }
          callback(merged);
        }
      }
    }, (err) => {
      console.warn("Section headers onSnapshot note:", err?.message);
    });
  } catch (_) {}

  let bc = null;
  try {
    bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
    bc.onmessage = (e) => {
      if (e.data?.type === "hotel_section_headers_updated" && e.data?.payload) {
        callback(e.data.payload);
      }
    };
  } catch (_) {}

  const handleCustomEvent = (e) => {
    if (e.detail && typeof e.detail === 'object') callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === LS_SECTION_HEADERS_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && typeof parsed === 'object') callback(parsed);
      } catch (_) {}
    }
  };

  if (isClient) {
    window.addEventListener("hotel_section_headers_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (bc) { try { bc.close(); } catch (_) {} }
    if (isClient) {
      window.removeEventListener("hotel_section_headers_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const loadSectionHeaders = async () => {
  const cached = getCachedSectionHeaders();
  let headers = cached;

  try {
    const headersDocRef = doc(db, "content", "section_headers");
    const snapshot = await getDoc(headersDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && typeof data === 'object') {
        headers = {
          ...initialSectionHeaders,
          ...data,
          rooms: { ...initialSectionHeaders.rooms, ...(data.rooms || {}) },
          amenities: { ...initialSectionHeaders.amenities, ...(data.amenities || {}) },
          dining: { ...initialSectionHeaders.dining, ...(data.dining || {}) },
          discover: { ...initialSectionHeaders.discover, ...(data.discover || {}) },
          gallery: { ...initialSectionHeaders.gallery, ...(data.gallery || {}) },
          reviews: { ...initialSectionHeaders.reviews, ...(data.reviews || {}) },
          location: { ...initialSectionHeaders.location, ...(data.location || {}) }
        };
        if (isClient) {
          localStorage.setItem(LS_SECTION_HEADERS_KEY, JSON.stringify(headers));
        }
      }
    } else {
      await setDoc(headersDocRef, initialSectionHeaders).catch(() => {});
    }
  } catch (err) {
    console.warn("Using local section headers:", err?.message);
  }

  return headers;
};

export const saveSectionHeaders = async (headersData) => {
  const merged = {
    ...initialSectionHeaders,
    ...headersData,
    rooms: { ...initialSectionHeaders.rooms, ...(headersData.rooms || {}) },
    amenities: { ...initialSectionHeaders.amenities, ...(headersData.amenities || {}) },
    dining: { ...initialSectionHeaders.dining, ...(headersData.dining || {}) },
    discover: { ...initialSectionHeaders.discover, ...(headersData.discover || {}) },
    gallery: { ...initialSectionHeaders.gallery, ...(headersData.gallery || {}) },
    reviews: { ...initialSectionHeaders.reviews, ...(headersData.reviews || {}) },
    location: { ...initialSectionHeaders.location, ...(headersData.location || {}) }
  };

  if (isClient) {
    localStorage.setItem(LS_SECTION_HEADERS_KEY, JSON.stringify(merged));
    broadcastUpdate("hotel_section_headers_updated", merged);
  }

  try {
    const headersDocRef = doc(db, "content", "section_headers");
    await setDoc(headersDocRef, { ...merged, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, syncedToCloud: true };
  } catch (err) {
    console.warn("Firestore saveSectionHeaders note:", err?.message);
    return { success: true, syncedToCloud: false, error: err?.message };
  }
};

export const resetSectionHeaders = async () => {
  return await saveSectionHeaders(initialSectionHeaders);
};


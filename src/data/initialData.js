export const themePresets = [
  {
    id: "royal-sapphire",
    name: "Royal Sapphire & Gold",
    description: "Classic aristocratic Mediterranean luxury",
    primary: "#0f2b48",
    primaryHover: "#091b2e",
    secondary: "#c5a059",
    secondaryHover: "#a68442",
    backgroundColor: "#fdfbf7",
    surfaceColor: "#ffffff",
    activeColor: "#8e6f33",
    category: "Luxury Classic"
  },
  {
    id: "emerald-haven",
    name: "Emerald Haven & Champagne",
    description: "Eco-luxury, botanical retreats & alpine resorts",
    primary: "#143d2b",
    primaryHover: "#0d291d",
    secondary: "#d4af37",
    secondaryHover: "#b3922b",
    backgroundColor: "#fbfdfc",
    surfaceColor: "#ffffff",
    activeColor: "#93771f",
    category: "Botanical & Nature"
  },
  {
    id: "bordeaux-heritage",
    name: "Bordeaux Heritage & Bronze",
    description: "Rich vintage winery estates and heritage manors",
    primary: "#481123",
    primaryHover: "#300a16",
    secondary: "#bf8a48",
    secondaryHover: "#a07137",
    backgroundColor: "#fdfaf7",
    surfaceColor: "#ffffff",
    activeColor: "#825b29",
    category: "Heritage & Winery"
  },
  {
    id: "amalfi-azure",
    name: "Amalfi Azure & Terracotta",
    description: "Vibrant coastal charm & Mediterranean seaside resorts",
    primary: "#034a74",
    primaryHover: "#023350",
    secondary: "#d46a4e",
    secondaryHover: "#b8543a",
    backgroundColor: "#f7fbfe",
    surfaceColor: "#ffffff",
    activeColor: "#96422d",
    category: "Coastal & Resort"
  },
  {
    id: "monaco-noir",
    name: "Monaco Noir & Platinum",
    description: "Ultra-modern chic boutique hotel in metropolitan capitals",
    primary: "#161a1d",
    primaryHover: "#0b0d0e",
    secondary: "#ba9e6e",
    secondaryHover: "#9d8354",
    backgroundColor: "#0f141c",
    surfaceColor: "#1a202c",
    activeColor: "#826a40",
    category: "Modern Minimalist"
  },
  {
    id: "sunset-coral",
    name: "Santorini Mist & Sunset",
    description: "Warm sunset glow for island villas & serene getaways",
    primary: "#1d3557",
    primaryHover: "#112239",
    secondary: "#e76f51",
    secondaryHover: "#cc5437",
    backgroundColor: "#fdf8f5",
    surfaceColor: "#ffffff",
    activeColor: "#ad4128",
    category: "Island & Sunset"
  }
];

export const defaultTheme = {
  primaryColor: "#0f2b48",
  primaryHoverColor: "#091b2e",
  secondaryColor: "#c5a059",
  secondaryHoverColor: "#a68442",
  backgroundColor: "#fdfbf7",
  surfaceColor: "#ffffff",
  activeColor: "#8e6f33",
  hotelName: "The Grand Aurelia",
  hotelSubtitle: "Luxury Resort & Botanical Spa",
  location: "Costa Smeralda, Sardinia, Italy",
  email: "concierge@grandaurelia.com",
  phone: "+39 0789 98765",
  currency: "$",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80",
  heroBgColor: "#020617",
  heroOverlayOpacity: 0.65,
  heroBgBlur: 0,
  announcement: "Special Season: Complimentary Sunset Champagne Cruise with bookings over 3 nights"
};

export const initialRooms = [
  {
    id: "room-1",
    name: "Presidential Ocean Villa",
    category: "Villa",
    price: 890,
    quantity: 2,
    location: "North Cliffside Wing — Oceanfront Promontory (Level 1, Private Gates)",
    size: "180 m² / 1,940 sq ft",
    guests: 4,
    beds: "1 King Bed + 2 Queen Beds",
    view: "Direct Mediterranean Oceanfront",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    description: "Our signature jewel featuring an infinity plunge pool, private sun deck, personal 24-hour butler, and breathtaking panoramic sunset views over the bay.",
    amenities: [
      "Private Heated Plunge Pool",
      "Dedicated 24/7 Butler Service",
      "Direct Beach Access",
      "Bespoke Diptyque Bath Amenities",
      "Private Sun Deck & Daybeds",
      "Bang & Olufsen Sound System",
      "Complimentary Wine Cellar Selection",
      "High-Speed Fiber Wi-Fi"
    ],
    featured: true,
    available: true
  },
  {
    id: "room-2",
    name: "Royal Penthouse Suite",
    category: "Suite",
    price: 650,
    quantity: 3,
    location: "Crown Tower — Penthouse Floor 7 (Panoramic 360° Belvédère)",
    size: "125 m² / 1,345 sq ft",
    guests: 2,
    beds: "1 Ultra King Bed",
    view: "360° Panoramic Coast & Mountains",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    description: "Perched atop the highest tower, this penthouse offers an open-air heated jacuzzi on the private terrace, a custom marble fireplace, and exclusive executive lounge privileges.",
    amenities: [
      "Terrace Jacuzzi with Sea View",
      "VIP Executive Lounge Access",
      "Italian Marble Bathroom",
      "Walk-in Dressing Room",
      "Personalized Pillow Menu",
      "Champagne Bar & Nespresso",
      "Daily Chef's Canape Service"
    ],
    featured: true,
    available: true
  },
  {
    id: "room-3",
    name: "Deluxe Horizon Suite",
    category: "Suite",
    price: 440,
    quantity: 5,
    location: "West Sunset Wing — High Floors 3-5 (Direct Bay Overlook)",
    size: "85 m² / 915 sq ft",
    guests: 2,
    beds: "1 King Bed",
    view: "Sunset Bay & Coastal Garden",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
    description: "Designed for romantic tranquility, featuring floor-to-ceiling glass doors opening onto an oversized private balcony, deep soaking marble tub, and plush velvet seating.",
    amenities: [
      "Private Sunset Balcony",
      "Freestanding Soaking Tub",
      "Rainfall Shower for Two",
      "Smart Room Automation",
      "Artisan Tea & Coffee Bar",
      "Luxury Linen Robes & Slippers"
    ],
    featured: true,
    available: true
  },
  {
    id: "room-4",
    name: "Executive Botanical Villa",
    category: "Villa",
    price: 380,
    quantity: 4,
    location: "Garden Enclave — East Botanical Pavilions (Courtyard Level)",
    size: "105 m² / 1,130 sq ft",
    guests: 4,
    beds: "2 Queen Beds",
    view: "Secluded Fragrant Citrus Garden",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    description: "Immerse in nature within a private walled botanical sanctuary. Features an outdoor rain shower, private courtyard with lounging pergola, and handcrafted teak furnishings.",
    amenities: [
      "Private Courtyard Garden",
      "Outdoor Al Fresco Rain Shower",
      "Double Vanities & Dressing Space",
      "Family Friendly Layout",
      "Organic Herb Bar",
      "Garden Breakfast Dining Set"
    ],
    featured: false,
    available: true
  },
  {
    id: "room-5",
    name: "Signature Heritage Room",
    category: "Deluxe",
    price: 280,
    quantity: 6,
    location: "Historical Manor Wing — 2nd Floor (Central Courtyard Fountains)",
    size: "55 m² / 590 sq ft",
    guests: 2,
    beds: "1 King Bed",
    view: "Historic Courtyard & Fountains",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    description: "Honoring classical architectural elegance with vaulted ceilings, bespoke artisan woodwork, modern acoustics, and serene views overlooking the ancient courtyard fountains.",
    amenities: [
      "Historic Architecture Accents",
      "Acoustic Soundproofing",
      "Marble En-suite Bath",
      "Curated Art Collection",
      "Gourmet Mini Bar",
      "High-Speed Wi-Fi"
    ],
    featured: false,
    available: true
  },
  {
    id: "room-6",
    name: "Grand Classic Deluxe",
    category: "Deluxe",
    price: 195,
    quantity: 8,
    location: "Pine Ridge Wing — 1st & 2nd Floors (Forest & Ridge Vista)",
    size: "42 m² / 450 sq ft",
    guests: 2,
    beds: "1 Queen Bed",
    view: "Pine Forest & Mountain Ridges",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    description: "The quintessential luxury getaway room combining warm timber tones, a comfortable reading nook, ergonomic workspace, and calming vistas of the pine covered hillside.",
    amenities: [
      "Mountain View Balconette",
      "Ergonomic Work Desk",
      "Plush Memory Foam Mattress",
      "HD Smart Streaming TV",
      "Organic Toiletries",
      "Daily Turndown Service"
    ],
    featured: false,
    available: true
  }
];

export const initialBookings = [
  {
    id: "AUR-89214",
    bookingType: "stay",
    guestName: "Lord Alistair Sterling",
    guestEmail: "alistair.sterling@mayfairclub.co.uk",
    guestPhone: "+44 7700 900142",
    roomId: "room-1",
    roomName: "Presidential Ocean Villa",
    roomLocation: "North Cliffside Wing — Oceanfront Promontory (Level 1, Private Gates)",
    quantity: 1,
    checkIn: "2026-11-12",
    checkOut: "2026-11-16",
    nights: 4,
    guests: 3,
    roomPrice: 890,
    totalAmount: 3916, // including tax & addons
    status: "Confirmed",
    paymentStatus: "Paid",
    createdAt: "2026-10-28T09:30:00Z",
    addons: ["VIP Airport Chauffeur (Mercedes S-Class / Maybach)", "Chilled Dom Pérignon & Caviar on Arrival"],
    specialRequests: "Arriving by private jet at Olbia airport at 14:00. Please arrange chilled Dom Pérignon in room."
  },
  {
    id: "AUR-89215",
    bookingType: "stay",
    guestName: "Dr. Elena Rostova",
    guestEmail: "elena.rostova@geneva-med.ch",
    guestPhone: "+41 22 555 0192",
    roomId: "room-2",
    roomName: "Royal Penthouse Suite",
    roomLocation: "Crown Tower — Penthouse Floor 7 (Panoramic 360° Belvédère)",
    quantity: 1,
    checkIn: "2026-10-29",
    checkOut: "2026-11-03",
    nights: 5,
    guests: 2,
    roomPrice: 650,
    totalAmount: 3825,
    status: "Checked In",
    paymentStatus: "Paid",
    createdAt: "2026-10-20T14:15:00Z",
    addons: ["Couple's 90-Min Botanical Spa & Massage", "Daily Gourmet Champagne Breakfast"],
    specialRequests: "Anniversary celebration. Prefer high floor terrace with maximum privacy."
  },
  {
    id: "AUR-89216",
    bookingType: "stay",
    guestName: "Marcus Vance",
    guestEmail: "m.vance@vancetech.io",
    guestPhone: "+1 (415) 890-3411",
    roomId: "room-3",
    roomName: "Deluxe Horizon Suite",
    roomLocation: "West Sunset Wing — High Floors 3-5 (Direct Bay Overlook)",
    quantity: 1,
    checkIn: "2026-11-18",
    checkOut: "2026-11-21",
    nights: 3,
    guests: 2,
    roomPrice: 440,
    totalAmount: 1452,
    status: "Pending",
    paymentStatus: "Pending Arrival",
    createdAt: "2026-10-30T08:00:00Z",
    addons: ["Daily Gourmet Champagne Breakfast"],
    specialRequests: "Require quiet room with optimal desk setup for remote conference calls."
  },
  {
    id: "AUR-89217",
    bookingType: "stay",
    guestName: "Sofia & Mateo Rossi",
    guestEmail: "sofia.rossi@milanodesign.it",
    guestPhone: "+39 02 4890 2231",
    roomId: "room-4",
    roomName: "Executive Botanical Villa",
    roomLocation: "Garden Enclave — East Botanical Pavilions (Courtyard Level)",
    quantity: 1,
    checkIn: "2026-10-22",
    checkOut: "2026-10-26",
    nights: 4,
    guests: 4,
    roomPrice: 380,
    totalAmount: 1780,
    status: "Completed",
    paymentStatus: "Paid",
    createdAt: "2026-10-10T11:20:00Z",
    addons: ["VIP Airport Chauffeur (Mercedes S-Class / Maybach)", "Daily Gourmet Champagne Breakfast"],
    specialRequests: "High chair for our toddler and feather-free hypoallergenic pillows."
  },
  {
    id: "AUR-89218",
    bookingType: "stay",
    guestName: "James Tanaka",
    guestEmail: "j.tanaka@tokyocapital.jp",
    guestPhone: "+81 90 1234 5678",
    roomId: "room-6",
    roomName: "Grand Classic Deluxe",
    roomLocation: "Pine Ridge Wing — 1st & 2nd Floors (Forest & Ridge Vista)",
    quantity: 1,
    checkIn: "2026-11-01",
    checkOut: "2026-11-03",
    nights: 2,
    guests: 1,
    roomPrice: 195,
    totalAmount: 429,
    status: "Cancelled",
    paymentStatus: "Refunded",
    createdAt: "2026-10-15T16:45:00Z",
    addons: [],
    specialRequests: "Cancelled due to international flight schedule change."
  },
  {
    id: "AUR-91402",
    bookingType: "dining",
    guestName: "Contessa Isabella Farnese",
    guestEmail: "isabella.farnese@palazzofarnese.it",
    guestPhone: "+39 06 6987 4120",
    venueId: "dining-1",
    venueName: "L'Orangerie Gastronomique",
    venueLocation: "Central Palace Mezzanine — Glass Conservatory & Tasting Salon",
    tableNumber: "T-01",
    tableName: "Chef's Counter Front Row",
    tableLocation: "Counter Facing Master Kitchen",
    date: "2026-11-12",
    timeSlot: "20:00",
    guests: 2,
    totalAmount: 380,
    status: "Confirmed",
    paymentStatus: "Paid (Demo Guarantee)",
    createdAt: "2026-10-29T10:00:00Z",
    addons: ["Master Sommelier Grand Cru Degustation Pairing"],
    specialRequests: "Anniversary dinner. Shellfish allergy for guest 2."
  },
  {
    id: "AUR-91403",
    bookingType: "dining",
    guestName: "Jonathan Sterling",
    guestEmail: "j.sterling@sterlingcap.com",
    guestPhone: "+1 (212) 555-0819",
    venueId: "dining-2",
    venueName: "The Cliffside Terrace & Raw Bar",
    venueLocation: "North Promontory — 40m Above Sea Cliff Edge",
    tableNumber: "CT-01",
    tableName: "Front-Row Cliff Edge",
    tableLocation: "Directly Overhanging Ocean Waves",
    date: "2026-11-13",
    timeSlot: "19:00",
    guests: 2,
    totalAmount: 260,
    status: "Confirmed",
    paymentStatus: "Paid (Demo Guarantee)",
    createdAt: "2026-10-30T15:20:00Z",
    addons: ["Royal Osetra Caviar & Vintage Krug Prelude"],
    specialRequests: "Sunset photography vantage point preferred."
  }
];

export const hotelAmenities = [
  {
    icon: "Sparkles",
    title: "The Botanical Spa & Thermal Baths",
    description: "Holistic wellness therapies, private cedar saunas, cold plunge pools, and bespoke essential oil treatments derived from our organic estate gardens."
  },
  {
    icon: "Utensils",
    title: "Michelin-Starred Dining",
    description: "Three distinct culinary destinations led by Chef Marco Valenti, showcasing sustainable sea-to-table cuisine and world-class wine pairings."
  },
  {
    icon: "Waves",
    title: "Cliffside Infinity Pools",
    description: "Two cascading saltwater infinity pools seamlessly merging into the Mediterranean horizon with plush cabanas and poolside mixology."
  },
  {
    icon: "Anchor",
    title: "Private Yacht & Catamaran Fleet",
    description: "Charter our custom Riva yachts for sunset voyages, secluded cove explorations, and private dining on the turquoise waters."
  },
  {
    icon: "Wine",
    title: "Sommelier Wine Vault",
    description: "An subterranean cellar harboring over 12,000 vintage bottles, hosted by master sommeliers for private tastings and cheese pairings."
  },
  {
    icon: "ShieldCheck",
    title: "24/7 White-Glove Concierge",
    description: "Dedicated personalized assistance: private jet transfers, helicopter tours, priority reservations, and tailored island excursions."
  }
];

export const guestReviews = [
  {
    id: "rev-1",
    author: "Charlotte & Henry Beaumont",
    location: "London, United Kingdom",
    rating: 5,
    date: "October 2026",
    title: "An unforgettable sanctuary of pure luxury",
    comment: "From the moment the private chauffeur collected us until our farewell glass of vintage champagne, every single second was perfection. The Ocean Villa's private pool is heaven on earth.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    roomStayed: "Presidential Ocean Villa"
  },
  {
    id: "rev-2",
    author: "Alexander Lindqvist",
    location: "Stockholm, Sweden",
    rating: 5,
    date: "September 2026",
    title: "Beyond Michelin star hospitality",
    comment: "The staff anticipates every desire before you even speak it. The spa treatments were transcendent, and the seafood tasting menu rivaled the best restaurants in Paris or Tokyo.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    roomStayed: "Royal Penthouse Suite"
  },
  {
    id: "rev-3",
    author: "Camille DuPont",
    location: "Geneva, Switzerland",
    rating: 5,
    date: "September 2026",
    title: "The pinnacle of Mediterranean elegance",
    comment: "The architectural design, the scent of wild rosemary and lavender in the gardens, and the breathtaking views make this our new annual family tradition.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    roomStayed: "Executive Botanical Villa"
  }
];

export const availableAddons = [
  {
    id: "addon-chauffeur",
    name: "VIP Airport Chauffeur (Mercedes S-Class / Maybach)",
    price: 120,
    priceType: "per trip",
    description: "Round-trip luxury airport pickup and return with chilled refreshments and Wi-Fi."
  },
  {
    id: "addon-champagne",
    name: "Chilled Dom Pérignon & Caviar on Arrival",
    price: 240,
    priceType: "one-time",
    description: "Bottle of vintage champagne paired with Royal Osetra caviar and house-baked brioche."
  },
  {
    id: "addon-spa",
    name: "Couple's 90-Min Botanical Spa & Massage",
    price: 280,
    priceType: "one-time",
    description: "Custom aromatherapy relaxation massage followed by private jacuzzi & steam access."
  },
  {
    id: "addon-breakfast",
    name: "Daily Gourmet Champagne Breakfast",
    price: 45,
    priceType: "per guest / day",
    description: "Served on your private balcony or at the terrace restaurant with fresh local delicacies."
  }
];

// Website Header & Mobile Navigation Menus
export const initialNavMenus = [
  { id: 'nav-home', label: 'Home', href: '/', targetId: 'home', isExternal: false, visible: true, order: 1 },
  { id: 'nav-rooms', label: 'Rooms & Suites', href: '/#rooms', targetId: 'rooms', isExternal: false, visible: true, order: 2 },
  { id: 'nav-amenities', label: 'Experiences & Spa', href: '/#amenities', targetId: 'amenities', isExternal: false, visible: true, order: 3 },
  { id: 'nav-dining', label: 'Gastronomy', href: '/#dining', targetId: 'dining', isExternal: false, visible: true, order: 4 },
  { id: 'nav-discover', label: 'Discover', href: '/discover', targetId: '', isExternal: false, visible: true, order: 5 },
  { id: 'nav-gallery', label: 'Gallery', href: '/#gallery', targetId: 'gallery', isExternal: false, visible: true, order: 6 },
  { id: 'nav-reviews', label: 'Testimonials', href: '/#reviews', targetId: 'reviews', isExternal: false, visible: true, order: 7 },
  { id: 'nav-contact', label: 'Contact', href: '/#contact', targetId: 'contact', isExternal: false, visible: true, order: 8 }
];

// Curated Discover Articles & Editorial Stories (with Multi-Photo Galleries)
export const initialArticles = [
  {
    id: "article-yacht-expeditions",
    title: "The Emerald Coast by Riva: Private Yacht Charters & Archipelago Coves",
    subtitle: "An insider's captained journey through secret granite sea grottos, crystal lagoons, and sunset champagne cruises.",
    category: "Maritime Fleet",
    readTime: "4 min read",
    date: "October 2026",
    author: "Captain Matteo Rossi & Marine Concierge",
    coverImage: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1600&q=80",
    photos: [
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510525009512-ab7522cabb65?auto=format&fit=crop&w=1200&q=80"
    ],
    content: `From our private marina slip, step directly aboard the hand-crafted mahogany Riva Dolceriva. The morning air carries wild myrtle and sea salt as twin V8 engines purr smoothly into the turquoise bay.

Our maritime fleet offers bespoke private expeditions into the sheltered Maddalena Archipelago. Glide past pink granite sea sculptures that have guarded these waters for millennia, dropping anchor in secluded lagoons inaccessible by land.

Guests enjoy champagne pairings by our private sommelier, line-caught red snapper sashimi prepared on deck by our private chef, and seamless Seabob water propulsion exploration across kaleidoscopic marine reserves. As dusk paints the Mediterranean in shades of violet and amber, return to the resort's torchlit jetty for an unforgettable aperitivo.`,
    linkedSlideId: "yachts",
    visible: true,
    order: 1
  },
  {
    id: "article-michelin-story",
    title: "Inside L'Orangerie: Chef Marco Valenti's 2-Star Michelin Philosophy",
    subtitle: "From estate heirloom gardens to the cliffside raw bar: the artistry of Mediterranean haute gastronomy.",
    category: "Haute Gastronomy",
    readTime: "5 min read",
    date: "October 2026",
    author: "Chef Marco Valenti & Culinary Guild",
    coverImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80",
    photos: [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1200&q=80"
    ],
    content: `At L'Orangerie, dining is approached not as a meal, but as an orchestral sensory movement. Master Chef Marco Valenti blends centuries-old Sardinian culinary traditions with avant-garde French technique.

Every morning begins at sunrise in the hotel's 4-hectare organic botanical estate. Hand-plucked wild thyme, sea fennel, and citrus blossoms are infused into cold broths and delicately smoked butter. By midday, fishermen arrive at our private beach cove bearing wild turbot, spiny lobster, and scarlet red prawns.

The signature 9-course Tasting Degustation takes diners on an epicurean voyage from cliffside crudo to gold-leaf saffron risotto, accompanied by sommelier pairings drawn from our 12,000-bottle subterranean vault.`,
    linkedSlideId: "dining",
    visible: true,
    order: 2
  },
  {
    id: "article-wine-vault",
    title: "12,000 Legendary Vintages: Inside the 18th-Century Sommelier Vault",
    subtitle: "A subterranean cavern honoring rare Sassicaia, historic Barolo, and candlelit masterclasses.",
    category: "Sommelier Cellar",
    readTime: "4 min read",
    date: "October 2026",
    author: "Gianluca Moretti, Master Sommelier",
    coverImage: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80",
    photos: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&w=1200&q=80"
    ],
    content: `Carved deep into the coastal limestone bedrock beneath the estate, the wine vault maintains an unyielding temperature of 14°C and 75% natural humidity. Here lies one of Europe's most celebrated private cellars.

Housing over 12,000 bottles spanning three centuries, the collection includes vertical vintages of Château d'Yquem, rare Tenuta San Guido Sassicaia from 1968, and biodynamic natural producers reviving indigenous Cannonau grapes.

Every evening, our Master Sommelier leads intimate tastings by flickering candlelight. Guests explore forgotten varietals, learn the alchemy of cellar aging, and savor artisanal pecorino aged exclusively in mountain caves for the hotel.`,
    linkedSlideId: "cellar",
    visible: true,
    order: 3
  },
  {
    id: "article-botanical-spa",
    title: "Thermal Alchemy & Cedar Wellness: The Botanical Spa Rituals",
    subtitle: "Holistic herbal lavender immersions, volcanic mineral plunge pools, and cliffside yoga pavilions.",
    category: "Botanical Wellness",
    readTime: "3 min read",
    date: "October 2026",
    author: "Dr. Elena Alessi, Holistic Director",
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    photos: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
    ],
    content: `Surrounded by wild Mediterranean scrub and eucalyptus groves, The Botanical Spa was conceived as a sacred sanctuary for deep cellular restoration.

Mineral spring waters enriched with magnesium and volcanic minerals flow into tiered outdoor pools overlooking the sapphire sea. In the Finnish cedar saunas, steam is infused with organic lavender harvested each morning on the grounds.

Guests begin their wellness journey with an individual botanical consultation, followed by custom essential oil massages, lymphatic drainage hydrotherapy, and private sunset meditation sessions in our open-air cliffside pavilion.`,
    linkedSlideId: "spa",
    visible: true,
    order: 4
  },
  {
    id: "article-villas-architecture",
    title: "Sanctuaries of Solitude: The Architecture of Our Oceanfront Villas",
    subtitle: "Private heated infinity plunge pools, hand-carved Orosei marble, and 24/7 dedicated butler service.",
    category: "Architecture & Design",
    readTime: "4 min read",
    date: "October 2026",
    author: "Gianfranco Mattei, Lead Architect",
    coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    photos: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
    ],
    content: `Built in organic harmony with the sloping coastal terrain, each villa was designed to dissolve the boundary between luxurious interior sanctuary and panoramic Mediterranean horizon.

Natural materials take center stage: hand-cut local granite, creamy Orosei marble terraces, and bleached Sardinian oak ceilings. Floor-to-ceiling retractable glass walls open onto private heated plunge pools that seem to spill directly into the sea below.

Every residence features private gated beach access, secluded sun decks, and a dedicated 24/7 private butler trained in aristocratic European hospitality to attend to every detail of your stay.`,
    linkedSlideId: "suites",
    visible: true,
    order: 5
  }
];

// Gastronomy & Restaurant Venues / Tasting Menus & Private Tables
export const initialDiningVenues = [
  {
    id: "dining-1",
    name: "L'Orangerie Gastronomique",
    accolade: "2 Michelin Stars",
    type: "Haute Cuisine & Degustation Menus",
    hours: "19:00 - 23:00",
    location: "Central Palace Mezzanine — Glass Conservatory & Tasting Salon",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    description: "Under Executive Chef Marco Valenti, local organic sea treasures and estate herbs are transformed into sensory culinary art.",
    order: 1,
    visible: true,
    timeSlots: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
    tables: [
      { number: "T-01", name: "Chef's Counter Front Row", capacity: 2, location: "Counter Facing Master Kitchen", badge: "Kitchen View" },
      { number: "T-02", name: "Grand Conservatory Window", capacity: 2, location: "Perimeter Glasshouse Overlooking Bay", badge: "Sunset Panoramic" },
      { number: "T-03", name: "Imperial Round Salon", capacity: 4, location: "Mezzanine Centerpiece Alcove", badge: "Private Salon" },
      { number: "T-04", name: "Orangery Citrus Promenade", capacity: 4, location: "Citrus Garden Terrace Promenade", badge: "Al Fresco Breeze" },
      { number: "T-05", name: "Master Sommelier Long Table", capacity: 6, location: "Adjacent to Wine Chandelier Salon", badge: "Wine Pairing Suite" },
      { number: "T-06", name: "Intimate Corner Pergola", capacity: 2, location: "Secluded Private Bay Corner", badge: "Romantic Seclusion" }
    ]
  },
  {
    id: "dining-2",
    name: "The Cliffside Terrace & Raw Bar",
    accolade: "Oceanfront Vista",
    type: "Mediterranean Crudo & Sunset Aperitivo",
    hours: "12:00 - 22:30",
    location: "North Promontory — 40m Above Sea Cliff Edge",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    description: "Perched 40 meters above crashing waves, serving chilled oysters, wild turbot carpaccio, and vintage champagne as the sun melts into the sea.",
    order: 2,
    visible: true,
    timeSlots: ["12:30", "13:30", "18:00", "19:00", "20:00", "21:00"],
    tables: [
      { number: "CT-01", name: "Front-Row Cliff Edge", capacity: 2, location: "Directly Overhanging Ocean Waves", badge: "Ocean Drop" },
      { number: "CT-02", name: "Sunset Horizon Deck", capacity: 4, location: "West-Facing Terraced Balcony", badge: "Golden Hour Prime" },
      { number: "CT-03", name: "Raw Bar Marble High-Top", capacity: 2, location: "Adjacent to Oyster & Crudo Station", badge: "Live Shucking" },
      { number: "CT-04", name: "Promontory Family Pavilion", capacity: 6, location: "Sheltered Canopy with 270° Sea Panorama", badge: "Executive Group" },
      { number: "CT-05", name: "Torched Jetty Pergola", capacity: 4, location: "Lower Promenade Near Tide Rock", badge: "Ambient Flame" }
    ]
  },
  {
    id: "dining-3",
    name: "The Cellar Vault & Cigar Lounge",
    accolade: "12,000 Rare Bottles",
    type: "Sommelier Masterclasses & Aged Spirits",
    hours: "17:00 - 01:00",
    location: "Subterranean Level -1 — Historic 18th-Century Limestone Vault",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    description: "A subterranean cavern dating to the 18th century, offering private tastings of rare Sassicaia, Barolo, and hand-rolled Caribbean cigars.",
    order: 3,
    visible: true,
    timeSlots: ["17:30", "18:30", "20:00", "21:30", "23:00"],
    tables: [
      { number: "V-01", name: "The Sommelier Oak Cask", capacity: 4, location: "Restored French Oak Barrel Table", badge: "Cellar Centerpiece" },
      { number: "V-02", name: "Granite Archway Alcove", capacity: 2, location: "Historic Arch Under Chandelier", badge: "Candlelit Intimate" },
      { number: "V-03", name: "Sassicaia Collector's Table", capacity: 6, location: "Surrounded by Grand Cru Vertical Racks", badge: "Vintage Vault" },
      { number: "V-04", name: "Chesterfield Cigar Nook", capacity: 2, location: "Ventilated Leather Lounge Corner", badge: "Rare Spirits Salon" }
    ]
  }
];

export const availableDiningAddons = [
  {
    id: "addon-wine-pairing",
    name: "Master Sommelier Grand Cru Degustation Pairing",
    price: 180,
    priceType: "per guest",
    description: "Vertical vintage pairings from our 12,000-bottle subterranean vault curated by Master Sommelier."
  },
  {
    id: "addon-caviar-prelude",
    name: "Royal Osetra Caviar & Vintage Krug Prelude",
    price: 220,
    priceType: "one-time",
    description: "50g tin of Royal Osetra caviar with warm blinis and a half bottle of Krug Grande Cuvée on arrival."
  },
  {
    id: "addon-anniversary-cake",
    name: "Artisan Valrhona Chocolate & Gold Leaf Celebration Cake",
    price: 65,
    priceType: "one-time",
    description: "Handcrafted celebration centerpiece presented with champagne sparklers and personalized calligraphy."
  }
];

// Editable Section Titles, Eyebrows & Descriptions across Homepage
export const initialSectionHeaders = {
  rooms: {
    id: "rooms",
    sectionName: "Accommodations (Suites & Villas)",
    eyebrow: "Bespoke Accommodations",
    title: "Sanctuaries of Refined Elegance",
    subtitle: "Each residence is individually curated with natural materials, handcrafted Italian furnishings, and unobstructed Mediterranean vistas.",
    visible: true
  },
  amenities: {
    id: "amenities",
    sectionName: "Curated Hotel Experiences (Amenities)",
    eyebrow: "Curated Hotel Experiences",
    title: "Unrivaled World-Class Amenities",
    subtitle: "Every moment at our resort is tailored to exceed imagination — from thermal spa rituals to private yacht expeditions across the turquoise Mediterranean.",
    visible: true
  },
  dining: {
    id: "dining",
    sectionName: "Gastronomy & Libations (Dining)",
    eyebrow: "Gastronomy & Libations",
    title: "A Symphony of Epicurean Artistry",
    subtitle: "Embark on an unforgettable gastronomic journey guided by award-winning culinary masters and international sommeliers.",
    visible: true
  },
  discover: {
    id: "discover",
    sectionName: "Discover & Editorial Stories",
    eyebrow: "Discover & Editorial Stories",
    title: "Curated Chronicles of Mediterranean Living",
    subtitle: "Unveil the secrets of our estate: Michelin-starred culinary artistry, Riva yacht charters, ancient subterranean cellars, and holistic botanical wellness.",
    visible: true
  },
  gallery: {
    id: "gallery",
    sectionName: "Visual Story (Gallery)",
    eyebrow: "Visual Story",
    title: "Moments of Sublime Beauty",
    subtitle: "Immerse yourself in snapshots of idyllic afternoons, sunset champagne toasts, and serene botanical spaces.",
    visible: true
  },
  reviews: {
    id: "reviews",
    sectionName: "Guest Acclaim (Testimonials)",
    eyebrow: "Guest Acclaim",
    title: "Praised by Discerning Travelers",
    ratingScore: "4.98 / 5.0",
    ratingCount: "(420+ Verified Residencies)",
    stars: 5,
    subtitle: "Read authentic feedback and impressions from our esteemed international guests.",
    visible: true
  },
  location: {
    id: "location",
    sectionName: "Location & Concierge",
    eyebrow: "Location & Concierge",
    title: "Arrive in Absolute Tranquility",
    subtitle: "Nestled along the emerald coast, easily reachable by helicopter transfer, private yacht dock, or luxury chauffeur.",
    visible: true,
    // Contact Cards
    addressTitle: "Resort Sanctuary Address",
    addressValue: "Your Location",
    phoneTitle: "24/7 Royal Concierge",
    phoneValue: "+250 788 000 000",
    emailTitle: "Direct Inquiries",
    emailValue: "youremail@yourdomain.rw",
    checkInCheckOutTitle: "Check-in / Check-out Times",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    // Arrival / Transfer Badges
    arrivalOption1Title: "Private Helipad",
    arrivalOption1Subtitle: "Coordinates: 41°08'N 9°32'E",
    arrivalOption2Title: "Deepwater Berth",
    arrivalOption2Subtitle: "Accommodates yachts up to 65m",
    // Royal Concierge Inquiry Form
    formTitle: "Speak with the Royal Concierge",
    formSubtitle: "Have specific travel requirements, yacht charter inquiries, or bespoke dining requests? Our concierge team will respond within 60 minutes.",
    fieldNameLabel: "Your Full Name",
    fieldNamePlaceholder: "e.g. Lady Vivienne Montgomery",
    fieldEmailLabel: "Email Address",
    fieldEmailPlaceholder: "name@domain.com",
    fieldMessageLabel: "Bespoke Request or Inquiry",
    fieldMessagePlaceholder: "Tell us about your upcoming stay, private event, dietary restrictions, or transport needs...",
    buttonText: "Transmit Inquiry to Concierge",
    successTitle: "Inquiry Received",
    successMessage: "Thank you! Our head concierge has received your request and will contact you promptly."
  }
};





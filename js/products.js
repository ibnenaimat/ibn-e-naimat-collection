/**
 * Ibn e Naimat Collection - Product Catalog & Categories
 * 
 * HOW TO UPDATE PRODUCTS:
 * 1. To add a new product, copy any object block below and paste it into the PRODUCTS array.
 * 2. Update the 'id', 'name', 'category', 'price', and 'description'.
 * 3. Replace 'image' with your actual image path (e.g. "assets/images/my-watch.jpg").
 * 4. Save this file - your website will automatically update without touching any HTML!
 */

const CATEGORIES = [
  {
    id: "all",
    name: "All Collections",
    tagline: "Explore our complete curated catalog",
    icon: "bi-grid-fill"
  },
  {
    id: "watches",
    name: "Original Watches",
    tagline: "Authentic Branded Timepieces",
    badge: "Signature Collection",
    image: "assets/images/placeholders/watch-placeholder.svg",
    description: "Curated collection of 100% original branded watches for men and women with guaranteed authenticity and pre-dispatch inspection."
  },
  {
    id: "mobile-accessories",
    name: "Mobile Accessories",
    tagline: "Fast Chargers, Braided Cables & Mounts",
    badge: "Daily Essentials",
    image: "assets/images/placeholders/mobile-accessories-placeholder.svg",
    description: "High-grade GaN fast charging adapters, military-grade braided cables, MagSafe wireless chargers, and heavy-duty car mounts."
  },
  {
    id: "gadgets",
    name: "Tech Gadgets",
    tagline: "Wireless Audio & Smart Utility",
    badge: "Smart Life",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    description: "High-fidelity ANC wireless earbuds, bone conduction sports headphones, and multi-port aluminum expansion hubs."
  },
  {
    id: "gifts",
    name: "Luxury Gifts",
    tagline: "Thoughtful Hampers & Executive Boxes",
    badge: "Special Moments",
    image: "assets/images/placeholders/gift-placeholder.svg",
    description: "Elegantly packaged executive gift sets, his & hers couple watch boxes, and wholesome wellness hampers ready for gifting."
  },
  {
    id: "calligraphy",
    name: "Islamic Calligraphy",
    tagline: "Handcrafted Luxury Canvas & Art Frames",
    badge: "Spiritual Elegance",
    image: "assets/images/placeholders/calligraphy-placeholder.svg",
    description: "Exquisite Arabic calligraphy artwork featuring Ayatul Kursi, 4 Qul, and Surah Ar-Rahman crafted on premium framed canvas."
  },
  {
    id: "honey-nuts",
    name: "Honey Nuts",
    tagline: "Pure Raw Honey & Handpicked Dry Fruits",
    badge: "100% Pure & Organic",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    description: "Wholesome, unheated natural flower honey infused with hand-picked premium almonds, Kashmiri walnuts, cashews, and pistachios."
  }
];

/**
 * ============================================================================
 * CIRCULAR SHOWCASE CATEGORIES (AS PER HORIZONTAL SHOWCASE SPECIFICATION)
 * 12 dedicated categories organized under Watches, Honey Nuts, Gadgets & Gifts.
 * Watches are marked as isPrimary: true for visual luxury prominence.
 * ============================================================================
 */
const SHOWCASE_CATEGORIES = [
  // --- 1. WATCHES (PRIMARY VISUAL FOCUS) ---
  {
    id: "mens-formal-watches",
    name: "Men's Formal Watches",
    deptId: "watches",
    deptName: "Watches",
    image: "assets/images/categories/cat-mens-formal.svg",
    isPrimary: true,
    badge: "Formal Horology",
    filterCategory: "watches",
    filterQuery: "chronograph"
  },
  {
    id: "mens-sports-watches",
    name: "Men's Sports Watches",
    deptId: "watches",
    deptName: "Watches",
    image: "assets/images/categories/cat-mens-sports.svg",
    isPrimary: true,
    badge: "Sports Tachymeter",
    filterCategory: "watches",
    filterQuery: "sports"
  },
  {
    id: "womens-watches",
    name: "Women's Watches",
    deptId: "watches",
    deptName: "Watches",
    image: "assets/images/categories/cat-womens-watches.svg",
    isPrimary: true,
    badge: "Delicate Elegance",
    filterCategory: "watches",
    filterQuery: "women"
  },
  {
    id: "couple-watches",
    name: "Couple Watches",
    deptId: "watches",
    deptName: "Watches",
    image: "assets/images/categories/cat-couple-watches.svg",
    isPrimary: true,
    badge: "His & Hers Set",
    filterCategory: "gifts",
    filterQuery: "couple"
  },
  {
    id: "smart-watches",
    name: "Smart Watches",
    deptId: "watches",
    deptName: "Watches",
    image: "assets/images/categories/cat-smart-watches.svg",
    isPrimary: true,
    badge: "Connected AMOLED",
    filterCategory: "watches",
    filterQuery: "watch"
  },

  // --- 2. HONEY NUTS ---
  {
    id: "honey-nuts",
    name: "Honey Nuts",
    deptId: "honey-nuts",
    deptName: "Honey Nuts",
    image: "assets/images/categories/cat-honey-nuts.svg",
    isPrimary: false,
    badge: "Raw Wildflower",
    filterCategory: "honey-nuts",
    filterQuery: "honey"
  },
  {
    id: "premium-dry-fruits",
    name: "Premium Dry Fruits",
    deptId: "honey-nuts",
    deptName: "Honey Nuts",
    image: "assets/images/categories/cat-dry-fruits.svg",
    isPrimary: false,
    badge: "Roasted & Raw",
    filterCategory: "honey-nuts",
    filterQuery: "dry fruits"
  },

  // --- 3. GADGETS ---
  {
    id: "earbuds",
    name: "Earbuds",
    deptId: "gadgets",
    deptName: "Gadgets",
    image: "assets/images/categories/cat-earbuds.svg",
    isPrimary: false,
    badge: "Pro ANC Audio",
    filterCategory: "gadgets",
    filterQuery: "earbuds"
  },
  {
    id: "chargers-accessories",
    name: "Chargers & Accessories",
    deptId: "gadgets",
    deptName: "Gadgets",
    image: "assets/images/categories/cat-chargers.svg",
    isPrimary: false,
    badge: "65W GaN Fast Charge",
    filterCategory: "mobile-accessories",
    filterQuery: "charger"
  },
  {
    id: "mobile-gadgets",
    name: "Mobile Gadgets",
    deptId: "gadgets",
    deptName: "Gadgets",
    image: "assets/images/categories/cat-mobile-gadgets.svg",
    isPrimary: false,
    badge: "MagSafe & Smart Hubs",
    filterCategory: "gadgets",
    filterQuery: "gadgets"
  },

  // --- 4. GIFT ITEMS ---
  {
    id: "gift-sets",
    name: "Gift Sets",
    deptId: "gifts",
    deptName: "Gift Items",
    image: "assets/images/categories/cat-gift-sets.svg",
    isPrimary: false,
    badge: "Presentation Boxes",
    filterCategory: "gifts",
    filterQuery: "gift"
  },
  {
    id: "premium-gifts",
    name: "Premium Gifts",
    deptId: "gifts",
    deptName: "Gift Items",
    image: "assets/images/categories/cat-premium-gifts.svg",
    isPrimary: false,
    badge: "Executive Hampers",
    filterCategory: "gifts",
    filterQuery: "hampers"
  }
];

const PRODUCTS = [
  // ==========================================
  // 1. ORIGINAL BRANDED WATCHES
  // ==========================================
  {
    id: "INC-W101",
    name: "Classic Chronograph Men's Watch",
    category: "watches",
    categoryName: "Original Branded Watches",
    price: 9500,
    badge: "Flagship Choice",
    image: "assets/images/placeholders/hero-watch-editorial.svg",
    shortDesc: "Solid stainless steel casing, genuine stitched leather strap, and precision quartz chronograph movement.",
    specs: [
      "Strap Material: Genuine Stitched Leather",
      "Dial Diameter: 42mm Bold Case",
      "Movement: Precision Quartz Chronograph",
      "Water Resistance: 30M Splash Resistant",
      "Condition: Brand New in Original Box"
    ],
    featured: true
  },
  {
    id: "INC-W102",
    name: "Minimalist Executive Slim Watch",
    category: "watches",
    categoryName: "Original Branded Watches",
    price: 7800,
    badge: "Bestseller",
    image: "assets/images/placeholders/watch-placeholder.svg",
    shortDesc: "Ultra-thin stainless steel mesh strap with scratch-resistant sapphire-coated glass.",
    specs: [
      "Strap: Stainless Steel Mesh",
      "Dial Diameter: 40mm Slim Profile",
      "Glass: Sapphire Coated Hardlex",
      "Dial Color: Sunray Obsidian Black",
      "Includes: Official Presentation Box & Card"
    ],
    featured: true
  },
  {
    id: "INC-W103",
    name: "Luxury Dual-Tone Sports Watch",
    category: "watches",
    categoryName: "Original Branded Watches",
    price: 11500,
    badge: "Premium Edition",
    image: "assets/images/placeholders/watch-placeholder.svg",
    shortDesc: "Robust stainless steel two-tone finish with luminous hands and date display window.",
    specs: [
      "Material: Dual-Tone Gold & Steel",
      "Movement: Multi-function Quartz with Date",
      "Luminous Hands for Low Light",
      "Clasp: Folding Safety Clasp",
      "Authenticity Guarantee: 100% Genuine"
    ],
    featured: false
  },
  {
    id: "INC-W104",
    name: "Elegance Rose Gold Women's Watch",
    category: "watches",
    categoryName: "Original Branded Watches",
    price: 8400,
    badge: "Ladies Special",
    image: "assets/images/placeholders/watch-placeholder.svg",
    shortDesc: "Graceful rose gold bezel with subtle crystal hour markers and refined bracelet.",
    specs: [
      "Finish: Rose Gold Plated",
      "Dial Diameter: 32mm Delicate Bezel",
      "Strap: Adjustable Link Bracelet",
      "Jewel Accents: Subtle Crystal Markers",
      "Packaging: Premium Presentation Gift Box"
    ],
    featured: false
  },

  // ==========================================
  // 2. MOBILE ACCESSORIES
  // ==========================================
  {
    id: "INC-M201",
    name: "65W GaN Dual-Port Fast Charger",
    category: "mobile-accessories",
    categoryName: "Mobile Accessories",
    price: 3400,
    badge: "Super Fast PD",
    image: "assets/images/placeholders/mobile-accessories-placeholder.svg",
    shortDesc: "Compact gallium nitride (GaN) fast charger capable of powering laptops, tablets & smartphones.",
    specs: [
      "Output: 65W Max Power Delivery",
      "Ports: 1x Type-C PD, 1x USB-A QC 3.0",
      "Tech: GaN Low-Heat Technology",
      "Protection: Surge & Overcharge Protection",
      "Compatibility: iPhone, Samsung, MacBook & Android"
    ],
    featured: false
  },
  {
    id: "INC-M202",
    name: "Heavy-Duty Braided Fast Cable (Type-C to C)",
    category: "mobile-accessories",
    categoryName: "Mobile Accessories",
    price: 950,
    badge: "100W PD Compatible",
    image: "assets/images/placeholders/mobile-accessories-placeholder.svg",
    shortDesc: "2-meter ultra-durable nylon braided cable with reinforced connectors for high-speed charging.",
    specs: [
      "Length: 2.0 Meters (6.6 ft)",
      "Power Rating: Supports up to 100W PD",
      "Data Transfer: 480 Mbps Speed",
      "Durability: Tested 15,000+ Bend Lifespan",
      "Jacket: Double-Braided Military Grade Nylon"
    ],
    featured: false
  },
  {
    id: "INC-M203",
    name: "Magnetic Car Phone Mount (360° Rotation)",
    category: "mobile-accessories",
    categoryName: "Mobile Accessories",
    price: 1350,
    badge: "Strong Neodymium Grip",
    image: "assets/images/placeholders/mobile-accessories-placeholder.svg",
    shortDesc: "Strong neodymium magnets ensure zero wobble on bumpy roads. Fits all car air vents.",
    specs: [
      "Magnets: 6x Powerful N52 Neodymium",
      "Rotation: Full 360-Degree Ball Joint",
      "Mount Type: Reinforced Air Vent Clamp",
      "Includes: 2 Metal Plates for Phone or Case",
      "Universal fit for all mobile models"
    ],
    featured: false
  },
  {
    id: "INC-M204",
    name: "MagSafe 15W Fast Wireless Charging Stand",
    category: "mobile-accessories",
    categoryName: "Mobile Accessories",
    price: 3900,
    badge: "Magnetic Alignment",
    image: "assets/images/placeholders/mobile-accessories-placeholder.svg",
    shortDesc: "Ergonomic aluminum desktop wireless charger stand with instant magnetic auto-alignment.",
    specs: [
      "Output: 15W Fast Wireless Charging",
      "Material: CNC Machined Matte Aluminum",
      "Orientation: Landscape & Portrait Viewing",
      "Cable: Integrated 1.5m Type-C Braided Cable",
      "Compatibility: iPhone 12/13/14/15/16 & Qi Devices"
    ],
    featured: false
  },

  // ==========================================
  // 3. TECH GADGETS
  // ==========================================
  {
    id: "INC-G301",
    name: "Pro ANC Wireless Bluetooth Earbuds",
    category: "gadgets",
    categoryName: "Tech Gadgets",
    price: 4200,
    badge: "High Bass & Clear Mic",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    shortDesc: "True wireless stereo earbuds with active touch controls, deep punchy bass, and crystal clear call mic.",
    specs: [
      "Bluetooth: Version 5.3 Quick Connect",
      "Battery Life: Up to 6h Playback + 24h Charging Case",
      "Charging Port: Type-C Fast Charge",
      "Features: Touch Controls, Environmental Noise Reduction",
      "Compatibility: Android, iPhone, Windows, Mac"
    ],
    featured: true
  },
  {
    id: "INC-G302",
    name: "Wireless Open-Ear Sports Headphones",
    category: "gadgets",
    categoryName: "Tech Gadgets",
    price: 5800,
    badge: "Sweatproof Workout",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    shortDesc: "Lightweight titanium frame sports headphones for running, gym, and outdoor cycling with situational awareness.",
    specs: [
      "Design: Open-Ear Ergonomic Titanium Band",
      "Waterproof: IPX6 Water & Sweat Resistant",
      "Battery: Up to 8 Hours Continuous Playback",
      "Microphone: Dual ENC Noise Cancelling Mic",
      "Weight: Only 28 Grams Featherlight"
    ],
    featured: false
  },
  {
    id: "INC-G303",
    name: "6-in-1 Aluminum USB-C Expansion Hub",
    category: "gadgets",
    categoryName: "Tech Gadgets",
    price: 2900,
    badge: "4K HDMI Output",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    shortDesc: "Anodized aluminum multi-port adapter with 4K HDMI, USB 3.0 ports, SD card reader, and 100W PD pass-through.",
    specs: [
      "Video Output: 4K @ 30Hz HDMI",
      "USB Ports: 2x USB 3.0 SuperSpeed (5Gbps)",
      "Power Delivery: 100W Type-C Input",
      "Card Slots: SD & MicroSD Dual Readers",
      "Finish: Space Grey Anodized Aluminum"
    ],
    featured: false
  },

  // ==========================================
  // 4. LUXURY GIFTS
  // ==========================================
  {
    id: "INC-F401",
    name: "Royal Gentleman Executive Gift Set",
    category: "gifts",
    categoryName: "Luxury Gifts",
    price: 6500,
    badge: "Curated Gift Box",
    image: "assets/images/placeholders/gift-placeholder.svg",
    shortDesc: "Complete curated gift set featuring a classic dress watch, genuine leather wallet, and metallic ballpoint pen.",
    specs: [
      "Contents: Original Watch, Pure Leather Wallet, Metallic Pen",
      "Box: Rigid matte black presentation box with velvet cushion",
      "Perfect For: Birthdays, Eid, Weddings, Corporate Gifting",
      "Gift Card: Handwritten greeting note included upon WhatsApp request"
    ],
    featured: true
  },
  {
    id: "INC-F402",
    name: "Wellness Honey Nuts & Herbal Hamper",
    category: "gifts",
    categoryName: "Luxury Gifts",
    price: 5200,
    badge: "Healthy & Pure",
    image: "assets/images/placeholders/gift-placeholder.svg",
    shortDesc: "Healthy wellness package with a 500g Honey Nuts jar, wooden honey drizzler, and premium dry fruit selection.",
    specs: [
      "Contents: 500g Honey Nuts Jar + Wooden Drizzler + Dry Fruits",
      "Packaging: Wooden hamper crate with golden satin ribbon",
      "Occasions: Ramadan, Eid, Elders, Get Well Soon Gifts",
      "Ready to gift straight out of the box"
    ],
    featured: false
  },
  {
    id: "INC-F403",
    name: "Prestige Couple Watch Set (His & Hers)",
    category: "gifts",
    categoryName: "Luxury Gifts",
    price: 14800,
    badge: "Wedding & Anniversary",
    image: "assets/images/placeholders/gift-placeholder.svg",
    shortDesc: "Matching his & hers original branded watches elegantly arranged in a dual luxury presentation box.",
    specs: [
      "Included: 1 Men's Watch + 1 Women's Matching Watch",
      "Material: Stainless Steel in Dual-Tone Finish",
      "Movement: Japanese Quartz with Water Resistance",
      "Gift Box: Velvet-lined dual watch display box with ribbon",
      "100% Brand New and Authenticity Guaranteed"
    ],
    featured: false
  },

  // ==========================================
  // 5. ISLAMIC CALLIGRAPHY
  // ==========================================
  {
    id: "INC-C501",
    name: "Ayatul Kursi Royal Gold Calligraphy Frame",
    category: "calligraphy",
    categoryName: "Islamic Calligraphy",
    price: 7500,
    badge: "Handcrafted Luxury",
    image: "assets/images/placeholders/calligraphy-placeholder.svg",
    shortDesc: "Magnificent 3D relief Ayatul Kursi rendered in brilliant champagne gold foil over deep matte black textured canvas.",
    specs: [
      "Dimensions: 24 x 36 Inches (Large Statement Size)",
      "Art: Ayatul Kursi Arabic Calligraphy in 3D Gold Leaf",
      "Frame: Heavy-gauge brushed gold aluminum floating frame",
      "Protection: Dustproof acrylic glass front shield",
      "Mounting: Pre-installed heavy-duty wall hanging brackets"
    ],
    featured: true
  },
  {
    id: "INC-C502",
    name: "Surah Ar-Rahman Minimalist Framed Canvas",
    category: "calligraphy",
    categoryName: "Islamic Calligraphy",
    price: 6800,
    badge: "Spiritual Harmony",
    image: "assets/images/placeholders/calligraphy-placeholder.svg",
    shortDesc: "Fabiayyi ala-i Rabbikuma Tukazziban calligraphy in elegant Thuluth script on archival museum-grade canvas.",
    specs: [
      "Dimensions: 20 x 30 Inches",
      "Script: Classical Thuluth Calligraphy",
      "Canvas: 380 GSM Pure Cotton Archival Canvas",
      "Frame: Dark walnut wood with gold inner lip",
      "Ready to hang with complete hardware"
    ],
    featured: false
  },
  {
    id: "INC-C503",
    name: "4 Qul Handcrafted Black & Champagne Art Piece",
    category: "calligraphy",
    categoryName: "Islamic Calligraphy",
    price: 8200,
    badge: "Masterpiece Set",
    image: "assets/images/placeholders/calligraphy-placeholder.svg",
    shortDesc: "Four sacred protection Surahs unified in a balanced 4-panel circular geometric medallion layout.",
    specs: [
      "Dimensions: 28 x 28 Inches Square Format",
      "Content: Surah Al-Kafirun, Al-Ikhlas, Al-Falaq, An-Nas",
      "Finish: Metallic Champagne Gold Embossing on Midnight Slate",
      "Casing: Scratch-resistant matte black luxury frame",
      "Authentic Islamic craftsmanship for home & office"
    ],
    featured: false
  },

  // ==========================================
  // 6. HONEY NUTS
  // ==========================================
  {
    id: "INC-H601",
    name: "Royal Honey Nuts Jar (500g)",
    category: "honey-nuts",
    categoryName: "Honey Nuts",
    price: 2450,
    badge: "100% Pure & Natural",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    shortDesc: "Pure natural flower honey generously packed with roasted almonds, Kashmiri walnuts, pistachios & cashews.",
    specs: [
      "Weight: 500 Grams Glass Jar",
      "Honey Source: 100% Raw Unpasteurized Berry/Wildflower Honey",
      "Nuts Mix: Almonds, Walnuts, Pistachios, Cashew Nuts",
      "Preservatives: Absolutely Zero Artificial Sugars or Additives",
      "Shelf Life: 12 Months in Cool Dry Place"
    ],
    featured: true
  },
  {
    id: "INC-H602",
    name: "Family Pack Honey Nuts (1000g / 1 Kg)",
    category: "honey-nuts",
    categoryName: "Honey Nuts",
    price: 4600,
    badge: "Value Jumbo Jar",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    shortDesc: "Full 1kg jumbo glass container of natural honey with extra high nut-to-honey ratio for families.",
    specs: [
      "Net Weight: 1000g (1 Kg)",
      "Ingredients: Pure Forest Honey, Kashmiri Walnuts, Premium Almonds, Cashews",
      "Benefits: Natural energy booster, rich in healthy fats and proteins",
      "Packaging: Food-Grade Vacuum Sealed Glass Jar",
      "100% Satisfaction Guarantee"
    ],
    featured: false
  },
  {
    id: "INC-H603",
    name: "Walnut & Honey Special Blend (400g)",
    category: "honey-nuts",
    categoryName: "Honey Nuts",
    price: 2100,
    badge: "Brain Food",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    shortDesc: "Selected halves of fresh Kashmiri walnuts immersed in pure amber Sidr/Berry honey.",
    specs: [
      "Weight: 400 Grams",
      "Specialty: Extra-rich Kashmiri Walnuts only",
      "Honey: 100% Pure Natural Honey",
      "Rich in Omega-3 and Antioxidants",
      "Freshly prepared batches"
    ],
    featured: false
  }
];

// Export to window
window.CATEGORIES = CATEGORIES;
window.SHOWCASE_CATEGORIES = SHOWCASE_CATEGORIES;
window.PRODUCTS = PRODUCTS;

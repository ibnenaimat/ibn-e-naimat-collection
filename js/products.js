/**
 * Ibn e Naimat Collection - Product Catalog
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
    name: "All Items",
    icon: "bi-grid-fill"
  },
  {
    id: "watches",
    name: "Original Watches",
    tagline: "Authentic branded timepieces",
    image: "assets/images/placeholders/watch-placeholder.svg",
    description: "Curated collection of 100% original branded watches for men and women with guaranteed authenticity."
  },
  {
    id: "honey-nuts",
    name: "Honey Nuts",
    tagline: "Pure honey infused with dry fruits",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    description: "Wholesome, pure organic honey blended with hand-picked premium almonds, walnuts, cashews, and pistachios."
  },
  {
    id: "gadgets",
    name: "Mobile Accessories & Gadgets",
    tagline: "Smart gadgets & daily tech essentials",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    description: "High-grade mobile chargers, durable braided cables, high-fidelity wireless earbuds, and everyday tech gear."
  },
  {
    id: "gifts",
    name: "Luxury Gift Items",
    tagline: "Thoughtful gifts for special occasions",
    image: "assets/images/placeholders/gift-placeholder.svg",
    description: "Elegantly packaged gift sets perfect for weddings, birthdays, Eid, anniversaries, and corporate gifting."
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
    badge: "100% Original",
    image: "assets/images/placeholders/watch-placeholder.svg",
    shortDesc: "Stainless steel case, genuine leather strap, quartz precision chronograph movement.",
    specs: [
      "Strap Material: Genuine Leather",
      "Dial Diameter: 42mm",
      "Movement: Precision Quartz Chronograph",
      "Water Resistance: 30M Daily Splash Resistant",
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
      "Includes: Official Box & Card"
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
    shortDesc: "Robust stainless steel two-tone finish with luminous hands and date display.",
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
      "Dial Diameter: 32mm",
      "Strap: Adjustable Link Bracelet",
      "Jewel Accents: Subtle Crystal Markers",
      "Packaging: Premium Presentation Gift Box"
    ],
    featured: false
  },

  // ==========================================
  // 2. HONEY NUTS (PREMIUM HONEY WITH DRY FRUITS)
  // ==========================================
  {
    id: "INC-H201",
    name: "Royal Honey Nuts Jar (500g)",
    category: "honey-nuts",
    categoryName: "Honey Nuts & Dry Fruits",
    price: 2450,
    badge: "100% Pure & Natural",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    shortDesc: "Pure natural flower honey generously packed with roasted almonds, walnuts, pistachios & cashews.",
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
    id: "INC-H202",
    name: "Family Pack Honey Nuts (1000g / 1 Kg)",
    category: "honey-nuts",
    categoryName: "Honey Nuts & Dry Fruits",
    price: 4600,
    badge: "Value Pack",
    image: "assets/images/placeholders/honey-nuts-placeholder.svg",
    shortDesc: "Full 1kg jumbo glass container of natural honey with high nut-to-honey ratio.",
    specs: [
      "Net Weight: 1000g (1 Kg)",
      "Ingredients: Pure Forest Honey, Kashmiri Walnuts, Premium Almonds, Cashews",
      "Benefits: Natural energy booster, rich in healthy fats and proteins",
      "Packaging: Food-Grade Vacuum Sealed Glass Jar",
      "100% Satisfaction Guarantee"
    ],
    featured: true
  },
  {
    id: "INC-H203",
    name: "Walnut & Honey Special Blend (400g)",
    category: "honey-nuts",
    categoryName: "Honey Nuts & Dry Fruits",
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
  },

  // ==========================================
  // 3. MOBILE ACCESSORIES & GADGETS
  // ==========================================
  {
    id: "INC-G301",
    name: "Pro ANC Wireless Bluetooth Earbuds",
    category: "gadgets",
    categoryName: "Mobile Accessories & Gadgets",
    price: 4200,
    badge: "High Bass & Clear Mic",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    shortDesc: "True wireless stereo earbuds with touch controls, deep bass, and clear calling microphone.",
    specs: [
      "Bluetooth: Version 5.3 Quick Connect",
      "Battery Life: Up to 6h Playback + 24h Charging Case",
      "Charging Port: Type-C Fast Charge",
      "Features: Touch Controls, Environmental Noise Cancellation",
      "Compatibility: Android, iPhone, Windows, Mac"
    ],
    featured: true
  },
  {
    id: "INC-G302",
    name: "65W GaN Fast Charger Adapter",
    category: "gadgets",
    categoryName: "Mobile Accessories & Gadgets",
    price: 3400,
    badge: "Super Fast Charging",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    shortDesc: "Dual-port (USB-C + USB-A) GaN charger capable of powering laptops, tablets & smartphones.",
    specs: [
      "Output Power: 65W Max Power Delivery",
      "Ports: 1x Type-C PD, 1x USB-A QC 3.0",
      "Technology: GaN (Gallium Nitride) Safe Heat Dissipation",
      "Overcharge & Surge Protection Built-in",
      "Pakistani 2-Pin Plug Standard"
    ],
    featured: false
  },
  {
    id: "INC-G303",
    name: "Heavy-Duty Braided Fast Cable (Type-C to C)",
    category: "gadgets",
    categoryName: "Mobile Accessories & Gadgets",
    price: 950,
    badge: "100W PD Compatible",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
    shortDesc: "2-meter ultra-durable nylon braided cable with reinforced connectors for high-speed charging.",
    specs: [
      "Length: 2.0 Meters (6.6 ft)",
      "Power Rating: Supports up to 100W PD",
      "Data Transfer: 480 Mbps",
      "Durability: Tested 15,000+ Bend Lifespan",
      "Jacket: Double-Braided Military Grade Nylon"
    ],
    featured: false
  },
  {
    id: "INC-G304",
    name: "Magnetic Car Phone Mount with 360 Rotation",
    category: "gadgets",
    categoryName: "Mobile Accessories & Gadgets",
    price: 1350,
    badge: "Strong Grip",
    image: "assets/images/placeholders/gadgets-placeholder.svg",
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

  // ==========================================
  // 4. LUXURY GIFT ITEMS
  // ==========================================
  {
    id: "INC-F401",
    name: "Royal Gentleman Executive Gift Set",
    category: "gifts",
    categoryName: "Luxury Gift Items",
    price: 6500,
    badge: "Curated Gift Box",
    image: "assets/images/placeholders/gift-placeholder.svg",
    shortDesc: "Complete gift set featuring a classic dress watch, genuine leather wallet, and matching pen.",
    specs: [
      "Contents: Original Watch, Pure Leather Wallet, Metallic Ballpoint Pen",
      "Box: Rigid matte black presentation box with velvet cushion",
      "Perfect For: Birthdays, Eid, Weddings, Groom Gift, Corporate Gifting",
      "Gift Card: Handwritten greeting note included upon WhatsApp request"
    ],
    featured: true
  },
  {
    id: "INC-F402",
    name: "Wellness Honey Nuts & Herbal Gift Hamper",
    category: "gifts",
    categoryName: "Luxury Gift Items",
    price: 5200,
    badge: "Healthy & Pure",
    image: "assets/images/placeholders/gift-placeholder.svg",
    shortDesc: "Healthy wellness package with a 500g Honey Nuts jar, pure wooden honey dipper, and premium tea/dry fruit box.",
    specs: [
      "Contents: 500g Honey Nuts Jar + Wooden Drizzler + Premium Dry Fruit Selection",
      "Packaging: Wooden hamper crate with golden satin ribbon",
      "Occasions: Get Well Soon, Ramadan, Eid, Elders & Family Celebrations",
      "Ready to gift straight out of the box"
    ],
    featured: false
  },
  {
    id: "INC-F403",
    name: "Prestige Couple Watch Set (His & Hers)",
    category: "gifts",
    categoryName: "Luxury Gift Items",
    price: 14800,
    badge: "Wedding & Anniversary Special",
    image: "assets/images/placeholders/gift-placeholder.svg",
    shortDesc: "Matching his & hers original branded watches elegantly arranged in a dual luxury box.",
    specs: [
      "Included: 1 Men's Watch + 1 Women's Matching Watch",
      "Material: Stainless Steel in Rose Gold / Silver Tone",
      "Movement: Japanese Quartz with Water Resistance",
      "Gift Box: Velvet-lined dual watch display box with ribbon",
      "100% Brand New and Authenticity Guaranteed"
    ],
    featured: false
  }
];

// Export to window
window.CATEGORIES = CATEGORIES;
window.PRODUCTS = PRODUCTS;

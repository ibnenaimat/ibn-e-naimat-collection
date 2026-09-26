-- ============================================================================
-- IBN E NAIMAT COLLECTION — SUPABASE DATABASE SCHEMA & SEED DATA
-- Production-Ready for Commercial Web Hosting & Multi-Device Admin Management
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLE: website_settings
-- Stores global brand details, WhatsApp hotline, announcement bar, and social links
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name TEXT NOT NULL DEFAULT 'Ibn e Naimat Collection',
    tagline TEXT DEFAULT 'Original Branded Watches, Pure Honey Nuts, Gadgets & Luxury Gifts',
    whatsapp_number TEXT NOT NULL DEFAULT '03302241340',
    whatsapp_international TEXT NOT NULL DEFAULT '923302241340',
    whatsapp_display TEXT NOT NULL DEFAULT '+92 330 2241340',
    announcement_bar TEXT DEFAULT 'Nationwide Insured Delivery Across Pakistan • Official WhatsApp Concierge (0330 2241340)',
    logo_url TEXT DEFAULT 'assets/images/official-logo.png',
    favicon_url TEXT DEFAULT 'assets/images/official-logo.png',
    instagram_url TEXT DEFAULT 'https://instagram.com/ibnenaimatcollection',
    facebook_url TEXT DEFAULT 'https://facebook.com/ibnenaimatcollection',
    email TEXT DEFAULT 'contact@ibnenaimat.com',
    phone TEXT DEFAULT '03302241340',
    timings TEXT DEFAULT 'Monday – Sunday: 10:00 AM – 11:00 PM PKT',
    delivery_note TEXT DEFAULT 'Nationwide Insured Delivery Across Pakistan',
    footer_bio TEXT DEFAULT 'Curators of original branded timepieces, pure wildflower honey nuts, Islamic calligraphy, and refined accessories with uncompromising authenticity and personal service across Pakistan.',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- ============================================================================
-- 3. TABLE: categories
-- Product departments and circular showcase categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id TEXT NOT NULL DEFAULT 'all',
    dept_name TEXT NOT NULL DEFAULT 'All Collections',
    tagline TEXT,
    badge TEXT,
    image_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    filter_category TEXT,
    filter_query TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLE: products
-- Full product catalog with specs, multi-image support, and stock tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,                          -- Product SKU/Reference (e.g. 'INC-W101')
    name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
    category_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    badge TEXT,
    image_url TEXT NOT NULL,                      -- Primary product image
    secondary_images JSONB DEFAULT '[]'::jsonb,   -- Additional image URLs array
    short_desc TEXT NOT NULL,
    specs JSONB DEFAULT '[]'::jsonb,              -- Array of specification bullet points
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by category, status, and featured
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- ============================================================================
-- 5. TABLE: hero_slides
-- Full-width homepage hero carousel slides
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slide_index INT NOT NULL DEFAULT 0,
    category_title TEXT NOT NULL,                 -- e.g. 'WATCHES', 'HONEY NUTS'
    badge_text TEXT,                              -- e.g. 'Curated Collection • Haute Horlogerie'
    title TEXT NOT NULL,                          -- e.g. 'Premium Watches for Every Moment.'
    title_highlight TEXT,                         -- e.g. 'Every Moment' (rendered with gold accent)
    description TEXT NOT NULL,
    primary_btn_text TEXT DEFAULT 'Explore Collection',
    primary_btn_url TEXT DEFAULT 'shop.html',
    target_category TEXT,
    secondary_btn_text TEXT DEFAULT 'Order on WhatsApp',
    secondary_btn_url TEXT DEFAULT 'https://wa.me/923302241340',
    bg_image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. TABLE: homepage_sections
-- Toggle visibility and control copy of homepage sections
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id TEXT PRIMARY KEY,                          -- e.g. 'hero_slider', 'circular_categories', 'honey_nuts'
    section_name TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    headline TEXT,
    subheadline TEXT,
    content_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. TABLE: orders_inquiries
-- Optional logging for WhatsApp order inquiries and contact requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT,
    product_name TEXT,
    customer_phone TEXT,
    message TEXT,
    source TEXT DEFAULT 'whatsapp',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Public read on active records, authenticated-only write
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_inquiries ENABLE ROW LEVEL SECURITY;

-- Website Settings: Public read, Authenticated write
CREATE POLICY "Public can view website settings"
    ON public.website_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update website settings"
    ON public.website_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Categories: Public read active, Authenticated full access
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Products: Public read active, Authenticated full access
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Hero Slides: Public read active, Authenticated full access
CREATE POLICY "Public can view active hero slides"
    ON public.hero_slides FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage hero slides"
    ON public.hero_slides FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Homepage Sections: Public read, Authenticated full access
CREATE POLICY "Public can view homepage sections"
    ON public.homepage_sections FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage homepage sections"
    ON public.homepage_sections FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Orders / Inquiries: Public can insert, Authenticated full access
CREATE POLICY "Public can insert inquiries"
    ON public.orders_inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage inquiries"
    ON public.orders_inquiries FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 9. SUPABASE STORAGE SETUP: 'catalog-images'
-- Creates public bucket for media uploads with authenticated-only write access
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view images
CREATE POLICY "Public can view catalog images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'catalog-images');

-- Storage RLS: Authenticated admin can upload/update/delete images
CREATE POLICY "Admins can upload catalog images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'catalog-images');

CREATE POLICY "Admins can update catalog images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'catalog-images');

CREATE POLICY "Admins can delete catalog images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'catalog-images');

-- ============================================================================
-- 10. SEED DATA: OFFICIAL WEBSITE SETTINGS
-- ============================================================================
INSERT INTO public.website_settings (
    id, store_name, tagline, whatsapp_number, whatsapp_international, whatsapp_display,
    announcement_bar, logo_url, favicon_url, instagram_url, facebook_url, email, phone, timings, delivery_note, footer_bio
) VALUES (
    1,
    'Ibn e Naimat Collection',
    'Original Branded Watches, Pure Honey Nuts, Gadgets & Luxury Gifts',
    '03302241340',
    '923302241340',
    '+92 330 2241340',
    'Nationwide Insured Delivery Across Pakistan • Official WhatsApp Concierge (0330 2241340)',
    'assets/images/official-logo.png',
    'assets/images/official-logo.png',
    'https://instagram.com/ibnenaimatcollection',
    'https://facebook.com/ibnenaimatcollection',
    'contact@ibnenaimat.com',
    '03302241340',
    'Monday – Sunday: 10:00 AM – 11:00 PM PKT',
    'Nationwide Insured Delivery Across Pakistan',
    'Curators of original branded timepieces, pure wildflower honey nuts, Islamic calligraphy, and refined accessories with uncompromising authenticity and personal service across Pakistan.'
) ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    whatsapp_number = EXCLUDED.whatsapp_number,
    whatsapp_international = EXCLUDED.whatsapp_international,
    updated_at = NOW();

-- ============================================================================
-- 11. SEED DATA: CATEGORIES (PRIMARY DEPARTMENTS & CIRCULAR SHOWCASE)
-- ============================================================================
INSERT INTO public.categories (
    id, name, dept_id, dept_name, tagline, badge, image_url, is_primary, filter_category, filter_query, sort_order, is_active
) VALUES
-- Main Store Departments
('watches', 'Original Watches', 'watches', 'Watches', 'Authentic Branded Timepieces', 'Signature Collection', 'assets/images/watches/watch-benyar-chronograph.png', true, 'watches', '', 1, true),
('mobile-accessories', 'Mobile Accessories', 'gadgets', 'Gadgets', 'Fast Chargers, Braided Cables & Mounts', 'Daily Essentials', 'assets/images/placeholders/mobile-accessories-placeholder.svg', false, 'mobile-accessories', '', 2, true),
('gadgets', 'Tech Gadgets', 'gadgets', 'Gadgets', 'Wireless Audio & Smart Utility', 'Smart Life', 'assets/images/placeholders/gadgets-placeholder.svg', false, 'gadgets', '', 3, true),
('gifts', 'Luxury Gifts', 'gifts', 'Gift Items', 'Thoughtful Hampers & Executive Boxes', 'Special Moments', 'assets/images/placeholders/gift-placeholder.svg', false, 'gifts', '', 4, true),
('calligraphy', 'Islamic Calligraphy', 'gifts', 'Gift Items', 'Handcrafted Luxury Canvas & Art Frames', 'Spiritual Elegance', 'assets/images/placeholders/calligraphy-placeholder.svg', false, 'calligraphy', '', 5, true),
('honey-nuts', 'Honey Nuts', 'honey-nuts', 'Honey Nuts', 'Pure Raw Honey & Handpicked Dry Fruits', '100% Pure & Organic', 'assets/images/placeholders/honey-nuts-placeholder.svg', false, 'honey-nuts', '', 6, true),

-- Circular Category Showcase Collections
('mens-formal-watches', 'Men''s Formal Watches', 'watches', 'Watches', 'Classic dress horology for executive attire', 'Formal Horology', 'assets/images/watches/watch-casio-classic.png', true, 'watches', 'casio', 11, true),
('mens-sports-watches', 'Men''s Sports Watches', 'watches', 'Watches', 'High-performance chronographs with tachymeter', 'Sports Tachymeter', 'assets/images/watches/watch-benyar-chronograph.png', true, 'watches', 'benyar', 12, true),
('womens-watches', 'Women''s Watches', 'watches', 'Watches', 'Refined diamond-accented & two-tone wristwear', 'Delicate Elegance', 'assets/images/watches/watch-curren-blanche.png', true, 'watches', 'curren', 13, true),
('couple-watches', 'Luxury Steel Watches', 'watches', 'Watches', 'Solid stainless steel timepieces', 'Diamond Bezel', 'assets/images/watches/watch-seastar-diamond.png', true, 'watches', 'seastar', 14, true),
('smart-watches', 'Master Chronometer', 'watches', 'Watches', 'Heritage pie-pan dials & co-axial calibre', 'Co-Axial Master', 'assets/images/watches/watch-omega-chronometer.png', true, 'watches', 'chronometer', 15, true),
('honey-nuts-showcase', 'Honey Nuts', 'honey-nuts', 'Honey Nuts', '100% Raw Wildflower Honey with nuts', 'Raw Wildflower', 'assets/images/categories/cat-honey-nuts.svg', false, 'honey-nuts', 'honey', 16, true),
('premium-dry-fruits', 'Premium Dry Fruits', 'honey-nuts', 'Honey Nuts', 'Hand-roasted Kashmiri nuts and dried fruits', 'Roasted & Raw', 'assets/images/categories/cat-dry-fruits.svg', false, 'honey-nuts', 'dry fruits', 17, true),
('earbuds', 'Earbuds', 'gadgets', 'Gadgets', 'High-fidelity ANC true wireless audio', 'Pro ANC Audio', 'assets/images/categories/cat-earbuds.svg', false, 'gadgets', 'earbuds', 18, true),
('chargers-accessories', 'Chargers & Accessories', 'gadgets', 'Gadgets', 'GaN dual-port fast adapters & cables', '65W GaN Fast Charge', 'assets/images/categories/cat-chargers.svg', false, 'mobile-accessories', 'charger', 19, true),
('mobile-gadgets', 'Mobile Gadgets', 'gadgets', 'Gadgets', 'Magnetic mounts & aluminum hubs', 'MagSafe & Smart Hubs', 'assets/images/categories/cat-mobile-gadgets.svg', false, 'gadgets', 'gadgets', 20, true),
('gift-sets', 'Gift Sets', 'gifts', 'Gift Items', 'Curated gentleman & wellness presentation sets', 'Presentation Boxes', 'assets/images/categories/cat-gift-sets.svg', false, 'gifts', 'gift', 21, true),
('premium-gifts', 'Premium Gifts', 'gifts', 'Gift Items', 'Bespoke corporate & personal gifting suites', 'Executive Hampers', 'assets/images/categories/cat-premium-gifts.svg', false, 'gifts', 'hampers', 22, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    dept_id = EXCLUDED.dept_id,
    dept_name = EXCLUDED.dept_name,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

-- ============================================================================
-- 12. SEED DATA: ALL 21 EXISTING PRODUCTS (PRESERVED PRECISELY)
-- ============================================================================
INSERT INTO public.products (
    id, name, category_id, category_name, price, sale_price, badge, image_url, secondary_images, short_desc, specs, featured, is_active, stock_status, sort_order
) VALUES
-- 1. WATCHES
('INC-W101', 'Benyar Royal Chronograph Watch', 'watches', 'Original Branded Watches', 9500, NULL, 'Flagship Chrono', 'assets/images/watches/watch-benyar-chronograph.png', '[]'::jsonb,
 'Rich sunray blue dial with rose gold tachymeter bezel, genuine stitched tan suede-leather strap, and precision quartz chronograph.',
 '["Brand: Benyar Original Horology", "Strap Material: Genuine Stitched Tan Suede-Leather", "Dial Diameter: 43mm Chronograph Case", "Movement: Precision Quartz Chronograph with Date", "Water Resistance: 30M Splash Resistant", "Packaging: Luxury Presentation Box & Authenticity Card"]'::jsonb,
 true, true, 'in_stock', 1),

('INC-W102', 'Master Chronometer Blue Dial Watch', 'watches', 'Original Branded Watches', 18500, NULL, 'Haute Horlogerie', 'assets/images/watches/watch-omega-chronometer.png', '[]'::jsonb,
 'Deep blue sunburst pie-pan dial with faceted silver hour batons, star emblem, and dark blue alligator-style leather strap.',
 '["Strap: Premium Navy Alligator-Embossed Leather", "Dial Diameter: 40mm Polished Stainless Steel", "Glass: Scratch-Resistant Sapphire Crystal", "Movement: Automatic Co-Axial Precision Calibre", "Water Resistance: 50M Pressure Sealed", "Includes: Wooden Collector Box & Warranty Card"]'::jsonb,
 true, true, 'in_stock', 2),

('INC-W103', 'Seastar Diamond Luxe Steel Watch', 'watches', 'Original Branded Watches', 11500, NULL, 'Diamond Accent', 'assets/images/watches/watch-seastar-diamond.png', '[]'::jsonb,
 'Geometric faceted crystal bezel, obsidian black dial with sparkling crystal indices, and 5-link stainless steel bracelet.',
 '["Brand: Seastar Original Horology", "Material: Solid 316L Stainless Steel Bracelet", "Dial: Obsidian Black with Diamond Hour Markers", "Calendar: Curved Lower Panoramic Date Display", "Bezel: Faceted Diamond-Cut Geometric Bezel", "Clasp: Push-Button Butterfly Clasp"]'::jsonb,
 true, true, 'in_stock', 3),

('INC-W104', 'Curren Blanche Two-Tone Luxury Watch', 'watches', 'Original Branded Watches', 8400, NULL, 'Gold & Silver', 'assets/images/watches/watch-curren-blanche.png', '[]'::jsonb,
 'Graceful two-tone 18K gold and silver stainless steel bracelet with radiant white sunray dial and gold baton indices.',
 '["Brand: Curren Blanche Original", "Finish: Two-Tone 18K Gold & Silver Plated", "Dial Diameter: 36mm Refined Midsize Case", "Strap: Adjustable Solid Link Steel Bracelet", "Glass: Scratch-Resistant Hardlex Crystal", "Packaging: Premium Presentation Gift Box"]'::jsonb,
 true, true, 'in_stock', 4),

('INC-W105', 'Casio Classic Minimalist Blue Watch', 'watches', 'Original Branded Watches', 7800, NULL, 'Timeless Classic', 'assets/images/watches/watch-casio-classic.png', '[]'::jsonb,
 'Clean navy blue dial with rose gold hands and Roman numerals, polished silver case, and dark brown crocodile-embossed leather strap.',
 '["Brand: Casio Genuine Timepiece", "Strap: Dark Brown Croc-Embossed Leather Strap", "Dial Diameter: 39mm Clean Dress Profile", "Water Resistance: Water Resist Certified", "Movement: Japanese Quartz High Precision Calibre", "Includes: Official Casio Box & User Manual"]'::jsonb,
 true, true, 'in_stock', 5),

-- 2. MOBILE ACCESSORIES
('INC-M201', '65W GaN Dual-Port Fast Charger', 'mobile-accessories', 'Mobile Accessories', 3400, NULL, 'Super Fast PD', 'assets/images/placeholders/mobile-accessories-placeholder.svg', '[]'::jsonb,
 'Compact gallium nitride (GaN) fast charger capable of powering laptops, tablets & smartphones.',
 '["Output: 65W Max Power Delivery", "Ports: 1x Type-C PD, 1x USB-A QC 3.0", "Tech: GaN Low-Heat Technology", "Protection: Surge & Overcharge Protection", "Compatibility: iPhone, Samsung, MacBook & Android"]'::jsonb,
 false, true, 'in_stock', 6),

('INC-M202', 'Heavy-Duty Braided Fast Cable (Type-C to C)', 'mobile-accessories', 'Mobile Accessories', 950, NULL, '100W PD Compatible', 'assets/images/placeholders/mobile-accessories-placeholder.svg', '[]'::jsonb,
 '2-meter ultra-durable nylon braided cable with reinforced connectors for high-speed charging.',
 '["Length: 2.0 Meters (6.6 ft)", "Power Rating: Supports up to 100W PD", "Data Transfer: 480 Mbps Speed", "Durability: Tested 15,000+ Bend Lifespan", "Jacket: Double-Braided Military Grade Nylon"]'::jsonb,
 false, true, 'in_stock', 7),

('INC-M203', 'Magnetic Car Phone Mount (360° Rotation)', 'mobile-accessories', 'Mobile Accessories', 1350, NULL, 'Strong Neodymium Grip', 'assets/images/placeholders/mobile-accessories-placeholder.svg', '[]'::jsonb,
 'Strong neodymium magnets ensure zero wobble on bumpy roads. Fits all car air vents.',
 '["Magnets: 6x Powerful N52 Neodymium", "Rotation: Full 360-Degree Ball Joint", "Mount Type: Reinforced Air Vent Clamp", "Includes: 2 Metal Plates for Phone or Case", "Universal fit for all mobile models"]'::jsonb,
 false, true, 'in_stock', 8),

('INC-M204', 'MagSafe 15W Fast Wireless Charging Stand', 'mobile-accessories', 'Mobile Accessories', 3900, NULL, 'Magnetic Alignment', 'assets/images/placeholders/mobile-accessories-placeholder.svg', '[]'::jsonb,
 'Ergonomic aluminum desktop wireless charger stand with instant magnetic auto-alignment.',
 '["Output: 15W Fast Wireless Charging", "Material: CNC Machined Matte Aluminum", "Orientation: Landscape & Portrait Viewing", "Cable: Integrated 1.5m Type-C Braided Cable", "Compatibility: iPhone 12/13/14/15/16 & Qi Devices"]'::jsonb,
 false, true, 'in_stock', 9),

-- 3. TECH GADGETS
('INC-G301', 'Pro ANC Wireless Bluetooth Earbuds', 'gadgets', 'Tech Gadgets', 4200, NULL, 'High Bass & Clear Mic', 'assets/images/placeholders/gadgets-placeholder.svg', '[]'::jsonb,
 'True wireless stereo earbuds with active touch controls, deep punchy bass, and crystal clear call mic.',
 '["Bluetooth: Version 5.3 Quick Connect", "Battery Life: Up to 6h Playback + 24h Charging Case", "Charging Port: Type-C Fast Charge", "Features: Touch Controls, Environmental Noise Reduction", "Compatibility: Android, iPhone, Windows, Mac"]'::jsonb,
 true, true, 'in_stock', 10),

('INC-G302', 'Wireless Open-Ear Sports Headphones', 'gadgets', 'Tech Gadgets', 5800, NULL, 'Sweatproof Workout', 'assets/images/placeholders/gadgets-placeholder.svg', '[]'::jsonb,
 'Lightweight titanium frame sports headphones for running, gym, and outdoor cycling with situational awareness.',
 '["Design: Open-Ear Ergonomic Titanium Band", "Waterproof: IPX6 Water & Sweat Resistant", "Battery: Up to 8 Hours Continuous Playback", "Microphone: Dual ENC Noise Cancelling Mic", "Weight: Only 28 Grams Featherlight"]'::jsonb,
 false, true, 'in_stock', 11),

('INC-G303', '6-in-1 Aluminum USB-C Expansion Hub', 'gadgets', 'Tech Gadgets', 2900, NULL, '4K HDMI Output', 'assets/images/placeholders/gadgets-placeholder.svg', '[]'::jsonb,
 'Anodized aluminum multi-port adapter with 4K HDMI, USB 3.0 ports, SD card reader, and 100W PD pass-through.',
 '["Video Output: 4K @ 30Hz HDMI", "USB Ports: 2x USB 3.0 SuperSpeed (5Gbps)", "Power Delivery: 100W Type-C Input", "Card Slots: SD & MicroSD Dual Readers", "Finish: Space Grey Anodized Aluminum"]'::jsonb,
 false, true, 'in_stock', 12),

-- 4. LUXURY GIFTS
('INC-F401', 'Royal Gentleman Executive Gift Set', 'gifts', 'Luxury Gifts', 6500, NULL, 'Curated Gift Box', 'assets/images/placeholders/gift-placeholder.svg', '[]'::jsonb,
 'Complete curated gift set featuring a classic dress watch, genuine leather wallet, and metallic ballpoint pen.',
 '["Contents: Original Watch, Pure Leather Wallet, Metallic Pen", "Box: Rigid matte black presentation box with velvet cushion", "Perfect For: Birthdays, Eid, Weddings, Corporate Gifting", "Gift Card: Handwritten greeting note included upon WhatsApp request"]'::jsonb,
 true, true, 'in_stock', 13),

('INC-F402', 'Wellness Honey Nuts & Herbal Hamper', 'gifts', 'Luxury Gifts', 5200, NULL, 'Healthy & Pure', 'assets/images/placeholders/gift-placeholder.svg', '[]'::jsonb,
 'Healthy wellness package with a 500g Honey Nuts jar, wooden honey drizzler, and premium dry fruit selection.',
 '["Contents: 500g Honey Nuts Jar + Wooden Drizzler + Dry Fruits", "Packaging: Wooden hamper crate with golden satin ribbon", "Occasions: Ramadan, Eid, Elders, Get Well Soon Gifts", "Ready to gift straight out of the box"]'::jsonb,
 false, true, 'in_stock', 14),

('INC-F403', 'Prestige Couple Watch Set (His & Hers)', 'gifts', 'Luxury Gifts', 14800, NULL, 'Wedding & Anniversary', 'assets/images/placeholders/gift-placeholder.svg', '[]'::jsonb,
 'Matching his & hers original branded watches elegantly arranged in a dual luxury presentation box.',
 '["Included: 1 Men''s Watch + 1 Women''s Matching Watch", "Material: Stainless Steel in Dual-Tone Finish", "Movement: Japanese Quartz with Water Resistance", "Gift Box: Velvet-lined dual watch display box with ribbon", "100% Brand New and Authenticity Guaranteed"]'::jsonb,
 false, true, 'in_stock', 15),

-- 5. ISLAMIC CALLIGRAPHY
('INC-C501', 'Ayatul Kursi Royal Gold Calligraphy Frame', 'calligraphy', 'Islamic Calligraphy', 7500, NULL, 'Handcrafted Luxury', 'assets/images/placeholders/calligraphy-placeholder.svg', '[]'::jsonb,
 'Magnificent 3D relief Ayatul Kursi rendered in brilliant champagne gold foil over deep matte black textured canvas.',
 '["Dimensions: 24 x 36 Inches (Large Statement Size)", "Art: Ayatul Kursi Arabic Calligraphy in 3D Gold Leaf", "Frame: Heavy-gauge brushed gold aluminum floating frame", "Protection: Dustproof acrylic glass front shield", "Mounting: Pre-installed heavy-duty wall hanging brackets"]'::jsonb,
 true, true, 'in_stock', 16),

('INC-C502', 'Surah Ar-Rahman Minimalist Framed Canvas', 'calligraphy', 'Islamic Calligraphy', 6800, NULL, 'Spiritual Harmony', 'assets/images/placeholders/calligraphy-placeholder.svg', '[]'::jsonb,
 'Fabiayyi ala-i Rabbikuma Tukazziban calligraphy in elegant Thuluth script on archival museum-grade canvas.',
 '["Dimensions: 20 x 30 Inches", "Script: Classical Thuluth Calligraphy", "Canvas: 380 GSM Pure Cotton Archival Canvas", "Frame: Dark walnut wood with gold inner lip", "Ready to hang with complete hardware"]'::jsonb,
 false, true, 'in_stock', 17),

('INC-C503', '4 Qul Handcrafted Black & Champagne Art Piece', 'calligraphy', 'Islamic Calligraphy', 8200, NULL, 'Masterpiece Set', 'assets/images/placeholders/calligraphy-placeholder.svg', '[]'::jsonb,
 'Four sacred protection Surahs unified in a balanced 4-panel circular geometric medallion layout.',
 '["Dimensions: 28 x 28 Inches Square Format", "Content: Surah Al-Kafirun, Al-Ikhlas, Al-Falaq, An-Nas", "Finish: Metallic Champagne Gold Embossing on Midnight Slate", "Casing: Scratch-resistant matte black luxury frame", "Authentic Islamic craftsmanship for home & office"]'::jsonb,
 false, true, 'in_stock', 18),

-- 6. HONEY NUTS
('INC-H601', 'Royal Honey Nuts Jar (500g)', 'honey-nuts', 'Honey Nuts', 2450, NULL, '100% Pure & Natural', 'assets/images/placeholders/honey-nuts-placeholder.svg', '[]'::jsonb,
 'Pure natural flower honey generously packed with roasted almonds, Kashmiri walnuts, pistachios & cashews.',
 '["Weight: 500 Grams Glass Jar", "Honey Source: 100% Raw Unpasteurized Berry/Wildflower Honey", "Nuts Mix: Almonds, Walnuts, Pistachios, Cashew Nuts", "Preservatives: Absolutely Zero Artificial Sugars or Additives", "Shelf Life: 12 Months in Cool Dry Place"]'::jsonb,
 true, true, 'in_stock', 19),

('INC-H602', 'Family Pack Honey Nuts (1000g / 1 Kg)', 'honey-nuts', 'Honey Nuts', 4600, NULL, 'Value Jumbo Jar', 'assets/images/placeholders/honey-nuts-placeholder.svg', '[]'::jsonb,
 'Full 1kg jumbo glass container of natural honey with extra high nut-to-honey ratio for families.',
 '["Net Weight: 1000g (1 Kg)", "Ingredients: Pure Forest Honey, Kashmiri Walnuts, Premium Almonds, Cashews", "Benefits: Natural energy booster, rich in healthy fats and proteins", "Packaging: Food-Grade Vacuum Sealed Glass Jar", "100% Satisfaction Guarantee"]'::jsonb,
 false, true, 'in_stock', 20),

('INC-H603', 'Walnut & Honey Special Blend (400g)', 'honey-nuts', 'Honey Nuts', 2100, NULL, 'Brain Food', 'assets/images/placeholders/honey-nuts-placeholder.svg', '[]'::jsonb,
 'Selected halves of fresh Kashmiri walnuts immersed in pure amber Sidr/Berry honey.',
 '["Weight: 400 Grams", "Specialty: Extra-rich Kashmiri Walnuts only", "Honey: 100% Pure Natural Honey", "Rich in Omega-3 and Antioxidants", "Freshly prepared batches"]'::jsonb,
 false, true, 'in_stock', 21)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    badge = EXCLUDED.badge,
    image_url = EXCLUDED.image_url,
    short_desc = EXCLUDED.short_desc,
    specs = EXCLUDED.specs,
    stock_status = EXCLUDED.stock_status,
    updated_at = NOW();

-- ============================================================================
-- 13. SEED DATA: 4 HERO SLIDES (PRESERVED PRECISELY)
-- ============================================================================
INSERT INTO public.hero_slides (
    slide_index, category_title, badge_text, title, title_highlight, description,
    primary_btn_text, primary_btn_url, target_category,
    secondary_btn_text, secondary_btn_url, bg_image_url, is_active, sort_order
) VALUES
(0, 'WATCHES', 'Curated Collection • Haute Horlogerie', 'Premium Watches for Every Moment.', 'Every Moment',
 'Original watches. Modern style. Refined quality. Discover timepieces selected for your everyday moments.',
 'Explore Watches', 'shop.html?category=watches', 'watches',
 'Order on WhatsApp', 'https://wa.me/923302241340', 'assets/images/hero/hero-watches.jpg', true, 1),

(1, 'HONEY NUTS', '100% Pure • Gourmet Wellness', 'Nature’s Finest, Naturally Sweet.', 'Naturally Sweet',
 'Pure honey blended with carefully selected nuts, dried fruits and seeds for a delicious premium experience.',
 'Explore Honey Nuts', '#honey-nuts-section', 'honey-nuts',
 'Order on WhatsApp', 'https://wa.me/923302241340', 'assets/images/hero/hero-honey-nuts.jpg', true, 2),

(2, 'GADGETS', 'Smart Tech • Everyday Essentials', 'Smart Gadgets. Modern Lifestyle.', 'Modern Lifestyle',
 'Useful, stylish and carefully selected gadgets designed for modern everyday life.',
 'Explore Gadgets', 'shop.html?category=gadgets', 'gadgets',
 'Order on WhatsApp', 'https://wa.me/923302241340', 'assets/images/hero/hero-gadgets.jpg', true, 3),

(3, 'GIFT ITEMS', 'Executive Suites • Bespoke Packaging', 'Gifts Made to Be Remembered.', 'Remembered',
 'Thoughtful and elegant gift items for special moments and meaningful occasions.',
 'Explore Gifts', '#promotions', 'gifts',
 'Order on WhatsApp', 'https://wa.me/923302241340', 'assets/images/hero/hero-gifts.jpg', true, 4);

-- ============================================================================
-- 14. SEED DATA: HOMEPAGE SECTIONS VISIBILITY
-- ============================================================================
INSERT INTO public.homepage_sections (id, section_name, is_visible, sort_order, headline, subheadline)
VALUES
('hero_slider', 'Hero Carousel Slider', true, 1, 'Curated Luxury Showcase', 'Full-width cinematic hero carousel'),
('circular_categories', 'Circular Category Showcase', true, 2, 'Explore by Category', 'Horizontal category circles with department tabs'),
('honey_nuts_spotlight', 'Dedicated Honey Nuts Feature', true, 3, 'Premium Honey Nuts', 'Natural wellness presentation with feature checklist'),
('promotional_banner', 'Executive Gifts & Hampers Banner', true, 4, 'Prestige Gifting & Bespoke Sets', 'Luxury packaging and pre-dispatch inspection highlight'),
('about_story', 'About Ibn e Naimat Collection', true, 5, 'Our Philosophy', 'Authentic brand narrative and verification commitments'),
('service_trust', 'Service Commitments', true, 6, 'Built on Trust & Quality', 'Delivery, secure payments, video inspection, genuine items'),
('concierge_cta', 'Concierge Client Support', true, 7, 'Ready to Place Your Order or Inquire?', 'Direct WhatsApp hotline and consultation')
ON CONFLICT (id) DO NOTHING;

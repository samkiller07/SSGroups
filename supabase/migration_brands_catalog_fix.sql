-- =========================================================================
-- SS MULTI-BRAND COMMERCE PLATFORM: BRANDS + CATALOG MASTER DATA MIGRATION
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Safe & Idempotent (ON CONFLICT DO UPDATE / DO NOTHING)
-- =========================================================================

-- 1. SAFE MIGRATION OF CATEGORIES & CATALOG_ITEMS TO TEXT IDs
DO $$
BEGIN
    -- Drop FK constraints temporarily to alter column types
    ALTER TABLE public.catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_id_fkey;
    ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_catalog_item_id_fkey;
    ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_catalog_item_id_fkey;

    -- Alter categories table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.categories ALTER COLUMN id TYPE TEXT;
    END IF;

    -- Alter catalog_items table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'catalog_items' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.catalog_items ALTER COLUMN id TYPE TEXT;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'catalog_items' AND column_name = 'category_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.catalog_items ALTER COLUMN category_id TYPE TEXT;
    END IF;

    -- Alter product_images table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'product_images' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.product_images ALTER COLUMN id TYPE TEXT;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'product_images' AND column_name = 'catalog_item_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.product_images ALTER COLUMN catalog_item_id TYPE TEXT;
    END IF;

    -- Re-add FK constraints
    ALTER TABLE public.catalog_items
        ADD CONSTRAINT catalog_items_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

    ALTER TABLE public.product_images
        ADD CONSTRAINT product_images_catalog_item_id_fkey
        FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE CASCADE;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'order_items'
    ) THEN
        ALTER TABLE public.order_items
            ADD CONSTRAINT order_items_catalog_item_id_fkey
            FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. SEED THE 3 CANONICAL BRANDS
INSERT INTO public.brands (
    id, name, tagline, description, since_year, logo_url,
    phone_primary, phone_secondary, whatsapp_number, whatsapp_channel_url,
    instagram_url, google_maps_url, plus_code, address, city,
    opening_time, closing_time, holiday, delivery_note, free_delivery_radius_km,
    theme_primary, theme_accent, theme_dark, theme_surface
) VALUES 
(
    'aquarium',
    'SS Aquarium',
    'Coimbatore’s Trusted Aquatic Haven Since 2018',
    'Specializing in healthy exotic ornamental fishes, live aquatic plants, custom tank fabrication, advanced filtration systems, and professional door-step aquarium maintenance.',
    2018,
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80',
    '9976473565',
    '9791719662',
    '9791719662',
    'https://whatsapp.com/channel/0029VbEI0Iv4CrfpWYx3TL2L',
    'https://www.instagram.com/ss_aquarium_madhukkarai/',
    'https://g.co/kgs/eaJQeZ',
    'WXFM+RCG Coimbatore, Tamil Nadu',
    'Madhukkarai Main Road, WXFM+RCG, Coimbatore, Tamil Nadu 641105',
    'Coimbatore',
    '10:00 AM',
    '10:00 PM',
    'Sunday',
    'Doorstep live fish & accessories delivery available across Coimbatore. Free delivery within ~2 km radius.',
    2,
    '#06B6D4',
    '#14B8A6',
    '#030B17',
    '#081C33'
),
(
    'kirubai',
    'Kirubai Cloud Kitchen',
    'Freshly Prepared Homestyle Culinary Delights',
    'Delicious, hygienic, and authentic meals prepared fresh to order using hand-ground spices and premium ingredients. Fast doorstep dispatch for your family and celebrations.',
    2022,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    '9791719662',
    '9976473565',
    '9791719662',
    NULL,
    'https://instagram.com',
    'https://maps.google.com/?q=Coimbatore',
    NULL,
    'Madhukkarai Road, Coimbatore, Tamil Nadu 641105',
    'Coimbatore',
    '11:30 AM',
    '10:30 PM',
    'Open Daily (Fresh Batches)',
    'Hot & fresh meal delivery across Coimbatore. Free doorstep delivery within ~2 km radius for orders above ₹200.',
    2,
    '#F97316',
    '#F59E0B',
    '#0F172A',
    '#1E293B'
),
(
    'vision-360',
    'SS Vision 360',
    'Precision Security, Smart Surveillance & Technician Services',
    'Expert CCTV installation, 4K night vision surveillance cameras, fault troubleshooting, rewiring, and annual maintenance contracts for homes, commercial stores, and factories in Coimbatore.',
    2020,
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
    '9791719662',
    '9976473565',
    '9791719662',
    NULL,
    NULL,
    'https://maps.google.com/?q=Coimbatore',
    NULL,
    'Coimbatore South & Madhukkarai Zone, Coimbatore, Tamil Nadu 641105',
    'Coimbatore',
    '09:00 AM',
    '08:30 PM',
    'Sunday On-Call',
    'Technician site visits & security hardware delivery available across Coimbatore.',
    2,
    '#2563EB',
    '#38BDF8',
    '#090D16',
    '#101726'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    phone_primary = EXCLUDED.phone_primary,
    phone_secondary = EXCLUDED.phone_secondary,
    whatsapp_number = EXCLUDED.whatsapp_number,
    address = EXCLUDED.address,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    theme_primary = EXCLUDED.theme_primary,
    theme_accent = EXCLUDED.theme_accent,
    theme_dark = EXCLUDED.theme_dark,
    theme_surface = EXCLUDED.theme_surface,
    updated_at = NOW();

-- 3. SEED THE 13 CANONICAL CATEGORIES
INSERT INTO public.categories (id, brand_id, name, slug, description, sort_order, is_active) VALUES
-- SS Aquarium
('cat-aq-1', 'aquarium', 'Live Ornamental Fish', 'live-fish', 'Healthy, active freshwater and planted tank varieties', 1, true),
('cat-aq-2', 'aquarium', 'Planted Aquarium Plants', 'aquatic-plants', 'Nutrient-rich oxygenating live aquarium plants', 2, true),
('cat-aq-3', 'aquarium', 'Filters & Aeration', 'filters-accessories', 'Submersible, top, and hang-on biological filters', 3, true),
('cat-aq-4', 'aquarium', 'Fish Food & Nutrition', 'fish-food', 'Growth, color enhancing and immune booster formulas', 4, true),
('cat-aq-5', 'aquarium', 'Aquarium Services', 'aquarium-services', 'Professional custom setup and monthly maintenance visits', 5, true),
-- Kirubai Cloud Kitchen
('cat-kb-1', 'kirubai', 'Chef Special Biryanis', 'biryani-combos', 'Seeraga samba & basmati aromatic dum biryani specials', 1, true),
('cat-kb-2', 'kirubai', 'Starters & Crispy Bites', 'starters-bites', 'Hot pepper chicken, crispy nuggets & spicy paneer 65', 2, true),
('cat-kb-3', 'kirubai', 'Authentic Gravies & Curries', 'gravies-curries', 'Rich village style curries paired with parottas & chapatis', 3, true),
('cat-kb-4', 'kirubai', 'Coolers & Desserts', 'coolers-desserts', 'Chilled mint coolers and homemade sweet treats', 4, true),
-- SS Vision 360
('cat-v3-1', 'vision-360', 'Smart CCTV Cameras', 'smart-cameras', '5MP HD, Full Color Night Vision, Audio Bullet & Dome cameras', 1, true),
('cat-v3-2', 'vision-360', 'DVR / NVR & Hard Drives', 'dvr-storage', 'High compression surveillance storage & multi-channel recorders', 2, true),
('cat-v3-3', 'vision-360', 'Cables, PoE & Power', 'cables-accessories', 'Pure copper Cat6 cables, power supplies and connectors', 3, true),
('cat-v3-4', 'vision-360', 'Installation & Repair Services', 'technician-services', 'On-site technician wiring, camera fixing and annual maintenance', 4, true)
ON CONFLICT (id) DO UPDATE SET
    brand_id = EXCLUDED.brand_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- 4. SEED THE 15 CANONICAL CATALOG ITEMS
INSERT INTO public.catalog_items (
    id, brand_id, category_id, name, slug, item_type,
    short_description, description, original_price, offer_price,
    unit_type, unit_value, stock_quantity, is_available, is_featured,
    is_hero_offer, is_client_verified, promotional_badge, is_active
) VALUES
-- Aquarium Items
(
    'item-aq-1', 'aquarium', 'cat-aq-1', 'Red Cap Oranda Goldfish (Pair)', 'red-cap-oranda-goldfish-pair',
    'PRODUCT', 'Active, high-grade pair with vibrant white body and prominent red wen crown.',
    'Our Red Cap Oranda Goldfish are conditioned in filtered sweet water tanks, actively swimming and accustomed to standard pellet diets. Ideal for community tanks and serene desktop aquariums.',
    380.00, 299.00, 'pair', 1.00, 8, true, true, true, true, 'Best Seller', true
),
(
    'item-aq-2', 'aquarium', 'cat-aq-1', 'Premium Black Moor Telescopic Goldfish (Pair)', 'premium-black-moor-goldfish-pair',
    'PRODUCT', 'Velvety jet-black coloration with iconic protruding telescopic eyes.',
    'Carefully selected and quarantine-cleared healthy Black Moor pairs. These peaceful swimmers thrive in well-oxygenated freshwater aquariums and add dramatic elegance to any setup.',
    340.00, 260.00, 'pair', 1.00, 6, true, true, false, true, 'Popular', true
),
(
    'item-aq-3', 'aquarium', 'cat-aq-2', 'Anubias Nana on Driftwood (Live Planted)', 'anubias-nana-driftwood-live-plant',
    'PRODUCT', 'Sturdy, broad deep-green leaves pre-anchored on natural seasoned bogwood.',
    'An extremely hardy and beginner-friendly aquatic plant that requires low to medium light. Pre-attached to curated bogwood, ready to place directly into your aquarium for natural oxygenation.',
    280.00, 220.00, 'piece', 1.00, 12, true, true, false, true, 'Live Plant', true
),
(
    'item-aq-4', 'aquarium', 'cat-aq-3', 'Sobo Submersible Internal Power Filter (15W)', 'sobo-submersible-internal-power-filter-15w',
    'PRODUCT', 'Quiet, energy-efficient mechanical and biological filtration with spray aeration.',
    'Engineered for 1.5 to 2.5 feet aquariums. Features easy-to-clean sponge cartridge, adjustable flow direction, and high-flow water circulation to maintain crystal-clear water conditions.',
    420.00, 340.00, 'piece', 1.00, 15, true, false, false, true, 'Hardware', true
),
(
    'item-aq-5', 'aquarium', 'cat-aq-5', 'Custom Rimless Aquascaping Glass Tank Setup (2 Feet)', 'custom-rimless-aquascaping-tank-setup-2ft',
    'SERVICE', 'Turnkey 24x12x15 ultra-clear float glass tank with substrate, hardscape, and planting.',
    'Complete designer planted tank installation executed at your home or office. Includes precision-cut high-clarity glass, aqua soil layer, volcanic rock hardscape, live stem plants, and LED fixture.',
    4500.00, 3800.00, 'service', 1.00, NULL, true, true, false, true, 'Popular Service', true
),
(
    'item-aq-6', 'aquarium', 'cat-aq-5', 'Monthly Tank Cleaning & Water Health Care Visit', 'monthly-tank-cleaning-health-check',
    'SERVICE', 'Deep gravel vacuuming, glass algae scraping, filter media wash, water testing.',
    'Regular monthly doorstep technician visit to keep your fish healthy and tank spotless. Includes TDS, pH checks, 40% water refresh, anti-chlorine treatment, and plant trimming.',
    800.00, 599.00, 'service', 1.00, NULL, true, false, false, true, 'Doorstep Service', true
),
-- Kirubai Items
(
    'item-kb-1', 'kirubai', 'cat-kb-1', 'Royal Seeraga Samba Chicken Dum Biryani Combo', 'royal-seeraga-samba-chicken-biryani-combo',
    'PRODUCT', 'Fragrant traditional Seeraga Samba rice with tender spiced chicken, boiled egg & raita.',
    'Slow-cooked in authentic wood-fired handi with cold-pressed gingelly oil, fresh mint, coriander, and freshly roasted masala. Served with cooling onion raita and rich brinjal gravy (Dalcha).',
    260.00, 219.00, 'plate', 1.00, 25, true, true, true, false, 'Chef Signature', true
),
(
    'item-kb-2', 'kirubai', 'cat-kb-2', 'Chettinad Pepper Chicken Fry (Dry Roast)', 'chettinad-pepper-chicken-fry-dry-roast',
    'PRODUCT', 'Fresh farm chicken roasted with crushed black peppercorns, curry leaves & shallots.',
    'Spicy, aromatic, and deeply flavorful South Indian dry roast chicken. Prepared fresh in small batches to preserve crunch and succulent texture.',
    220.00, 179.00, 'portion', 1.00, 20, true, true, false, false, 'Spicy Treat', true
),
(
    'item-kb-3', 'kirubai', 'cat-kb-3', 'Madhukkarai Special Mutton Chuka Gravy', 'madhukkarai-special-mutton-chuka-gravy',
    'PRODUCT', 'Tender goat mutton simmered in dark roasted coriander and red chilli masala.',
    'Traditional country-style thick mutton gravy crafted using stone-ground spices. Pairs excellently with hot parottas, ghee rice, or steaming white rice.',
    320.00, 279.00, 'portion', 1.00, 15, true, false, false, false, 'Weekend Hit', true
),
(
    'item-kb-4', 'kirubai', 'cat-kb-4', 'Fresh Lemon Mint Cooler (Chilled 350ml)', 'fresh-lemon-mint-cooler-chilled',
    'PRODUCT', 'Freshly extracted lemon juice infused with garden mint and a hint of rock salt.',
    'Refreshing, thirst-quenching natural digestive cooler prepared without artificial preservatives. Packed securely in food-grade spill-proof bottles.',
    60.00, 45.00, 'bottle', 1.00, 40, true, false, false, false, 'Chilled Beverage', true
),
-- Vision 360 Items
(
    'item-v3-1', 'vision-360', 'cat-v3-1', '5MP Smart Full-Color Night Vision Outdoor Bullet CCTV', '5mp-smart-full-color-night-vision-bullet-cctv',
    'PRODUCT', '24/7 crystal-clear color night vision with built-in mic and IP67 weatherproof housing.',
    'Equipped with dual warm white LED illuminators and advanced CMOS sensor, producing clear daylight-like colored footage even in pitch darkness. Supports human motion detection alarm and two-way audio pickup.',
    2650.00, 1999.00, 'piece', 1.00, 10, true, true, true, false, 'Top Security Pick', true
),
(
    'item-v3-2', 'vision-360', 'cat-v3-2', '8-Channel 4K H.265+ Surveillance DVR / XVR', '8-channel-4k-surveillance-dvr-xvr',
    'PRODUCT', 'Supports 8 HD cameras up to 5MP/4K with HDMI output and mobile remote viewing app.',
    'High-efficiency H.265+ video encoding saves up to 75% hard drive storage space. Real-time remote streaming to iOS and Android smartphones with cloud P2P instant setup.',
    4200.00, 3299.00, 'piece', 1.00, 5, true, true, false, false, 'High Capacity', true
),
(
    'item-v3-3', 'vision-360', 'cat-v3-2', 'Seagate SkyHawk 2TB Surveillance Hard Drive (24/7 Health)', 'seagate-skyhawk-2tb-surveillance-hard-drive',
    'PRODUCT', 'Purpose-built surveillance drive engineered to withstand 24x7 continuous video recording.',
    'ImagePerfect firmware minimizes dropped frames and ensures pristine video playback during critical reviews. Backed by 3-year brand replacement warranty.',
    5100.00, 4199.00, 'piece', 1.00, 8, true, false, false, false, 'Storage Essential', true
),
(
    'item-v3-4', 'vision-360', 'cat-v3-4', 'Standard Complete 4-Camera On-Site Installation Package', 'standard-4-camera-onsite-installation-package',
    'SERVICE', 'Professional conduit casing wiring, angle tuning, DVR configuration, and mobile setup.',
    'Comprehensive doorstep installation executed by verified SS Vision 360 technicians. Includes mounting 4 cameras, clipping cables neatly, crimping connectors, configuring recording schedule, and smartphone app setup.',
    2500.00, 1899.00, 'service', 1.00, NULL, true, true, false, false, 'Best Seller Service', true
),
(
    'item-v3-5', 'vision-360', 'cat-v3-4', 'Emergency CCTV Offline Fault Diagnosis & Technician Repair', 'emergency-cctv-fault-diagnosis-repair-visit',
    'SERVICE', 'Doorstep visit for video loss, DVR beep error, power supply failure, or camera re-angling.',
    'Fast technician dispatch across Coimbatore to inspect and resolve non-recording systems, faulty video baluns, blown SMPS power adapters, or broken cabling.',
    650.00, 450.00, 'service', 1.00, NULL, true, false, false, false, 'Quick Response', true
)
ON CONFLICT (id) DO UPDATE SET
    brand_id = EXCLUDED.brand_id,
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    item_type = EXCLUDED.item_type,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    original_price = EXCLUDED.original_price,
    offer_price = EXCLUDED.offer_price,
    unit_type = EXCLUDED.unit_type,
    unit_value = EXCLUDED.unit_value,
    stock_quantity = EXCLUDED.stock_quantity,
    is_available = EXCLUDED.is_available,
    is_featured = EXCLUDED.is_featured,
    is_hero_offer = EXCLUDED.is_hero_offer,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 5. SEED CANONICAL PRODUCT IMAGES
INSERT INTO public.product_images (id, catalog_item_id, image_url, alt_text, sort_order, is_primary) VALUES
('img-aq-1-1', 'item-aq-1', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80', 'Vibrant Red Cap Oranda Goldfish swimming gracefully', 1, true),
('img-aq-2-1', 'item-aq-2', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', 'Black Moor Goldfish with beautiful telescopic eyes', 1, true),
('img-aq-3-1', 'item-aq-3', 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=80', 'Lush Anubias live aquatic plant on driftwood', 1, true),
('img-aq-4-1', 'item-aq-4', 'https://images.unsplash.com/photo-1520302672647-895804627c3a?auto=format&fit=crop&w=900&q=80', 'Aquarium submersible power filter running quietly', 1, true),
('img-aq-5-1', 'item-aq-5', 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=900&q=80', 'Beautiful custom aquascape setup in living room', 1, true),
('img-aq-6-1', 'item-aq-6', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', 'Aquarium maintenance and water clarity service', 1, true),
('img-kb-1-1', 'item-kb-1', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80', 'Fragrant authentic Seeraga Samba Chicken Dum Biryani', 1, true),
('img-kb-2-1', 'item-kb-2', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80', 'Spicy Chettinad Pepper Chicken Dry Roast with fresh curry leaves', 1, true),
('img-kb-3-1', 'item-kb-3', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80', 'Rich Madhukkarai village style Mutton Chuka Gravy', 1, true),
('img-kb-4-1', 'item-kb-4', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80', 'Chilled Fresh Lemon Mint Cooler with condensation on glass', 1, true),
('img-v3-1-1', 'item-v3-1', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80', 'High resolution outdoor security bullet camera', 1, true),
('img-v3-2-1', 'item-v3-2', 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=900&q=80', 'Multi-channel 4K CCTV surveillance DVR back panel', 1, true),
('img-v3-3-1', 'item-v3-3', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80', 'High capacity 24/7 surveillance hard disk drive', 1, true),
('img-v3-4-1', 'item-v3-4', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'Professional CCTV technician adjusting camera angle on ladder', 1, true),
('img-v3-5-1', 'item-v3-5', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=80', 'Technician repairing security camera cable connections', 1, true)
ON CONFLICT (id) DO UPDATE SET
    catalog_item_id = EXCLUDED.catalog_item_id,
    image_url = EXCLUDED.image_url,
    alt_text = EXCLUDED.alt_text,
    sort_order = EXCLUDED.sort_order,
    is_primary = EXCLUDED.is_primary;

-- 6. PRIVILEGES AND RLS POLICIES FOR CATALOG TABLES
GRANT ALL ON TABLE public.brands TO service_role;
GRANT ALL ON TABLE public.categories TO service_role;
GRANT ALL ON TABLE public.catalog_items TO service_role;
GRANT ALL ON TABLE public.product_images TO service_role;

GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;

-- Ensure RLS is active
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Public brands view" ON public.brands;
DROP POLICY IF EXISTS "Public categories view" ON public.categories;
DROP POLICY IF EXISTS "Public catalog items view" ON public.catalog_items;
DROP POLICY IF EXISTS "Public product images view" ON public.product_images;
DROP POLICY IF EXISTS "Service role full access brands" ON public.brands;
DROP POLICY IF EXISTS "Service role full access categories" ON public.categories;
DROP POLICY IF EXISTS "Service role full access catalog items" ON public.catalog_items;
DROP POLICY IF EXISTS "Service role full access product images" ON public.product_images;

-- Public view policies
CREATE POLICY "Public brands view" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public categories view" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public catalog items view" ON public.catalog_items FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public product images view" ON public.product_images FOR SELECT TO anon, authenticated USING (true);

-- Service role full access
CREATE POLICY "Service role full access brands" ON public.brands FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access categories" ON public.categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access catalog items" ON public.catalog_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access product images" ON public.product_images FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========================================================================
-- SS Multi-Brand Platform: Production Supabase / PostgreSQL Schema (V2)
-- Brands: SS Aquarium, Kirubai Cloud Kitchen, SS Vision 360 (+ Future Brands)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY, -- 'aquarium', 'kirubai', 'vision-360'
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT,
    since_year INT,
    logo_url TEXT,
    phone_primary TEXT NOT NULL,
    phone_secondary TEXT,
    whatsapp_number TEXT NOT NULL,
    whatsapp_channel_url TEXT,
    instagram_url TEXT,
    google_maps_url TEXT,
    plus_code TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Coimbatore',
    opening_time TEXT NOT NULL,
    closing_time TEXT NOT NULL,
    holiday TEXT,
    delivery_note TEXT,
    free_delivery_radius_km NUMERIC DEFAULT 2,
    theme_primary TEXT NOT NULL,
    theme_accent TEXT NOT NULL,
    theme_dark TEXT NOT NULL,
    theme_surface TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_brand_active ON public.categories(brand_id, is_active);

-- 3. CATALOG ITEMS (PRODUCTS & SERVICES) TABLE
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('PRODUCT', 'SERVICE')),
    short_description TEXT,
    description TEXT NOT NULL,
    original_price NUMERIC(10, 2),
    offer_price NUMERIC(10, 2),
    unit_type TEXT NOT NULL DEFAULT 'piece',
    unit_value NUMERIC(10, 2) NOT NULL DEFAULT 1,
    stock_quantity INT, -- null for services or untracked
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_hero_offer BOOLEAN DEFAULT FALSE,
    is_client_verified BOOLEAN DEFAULT FALSE,
    promotional_badge TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_catalog_brand_type ON public.catalog_items(brand_id, item_type, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_hero_offers ON public.catalog_items(brand_id, is_hero_offer) WHERE is_hero_offer = TRUE;

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_item ON public.product_images(catalog_item_id, is_primary);

-- 5. DAILY HERO STATUSES TABLE
CREATE TABLE IF NOT EXISTS public.daily_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    short_message TEXT NOT NULL,
    detailed_message TEXT,
    image_url TEXT,
    cta_label TEXT,
    cta_destination TEXT,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    status_type TEXT NOT NULL DEFAULT 'DAILY_UPDATE' CHECK (status_type IN ('DAILY_UPDATE', 'TODAYS_SPECIAL', 'SPECIAL_OFFER', 'NEW_ARRIVAL', 'ANNOUNCEMENT', 'SERVICE_UPDATE', 'HOLIDAY', 'DELIVERY_UPDATE')),
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_statuses_brand_date ON public.daily_statuses(brand_id, publish_date, is_active);

-- 6. STORAGE BUCKET FOR PRODUCT IMAGES (Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_statuses ENABLE ROW LEVEL SECURITY;

-- Public Read Access for active catalog items, brands & active unexpired daily statuses
CREATE POLICY "Public brands view" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public categories view" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public catalog items view" ON public.catalog_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public product images view" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public daily statuses view" ON public.daily_statuses FOR SELECT USING (
    is_active = true AND 
    publish_date <= CURRENT_DATE AND 
    (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
);

-- Authenticated Admin Full CRUD Access
CREATE POLICY "Admin brands write" ON public.brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin categories write" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin catalog items write" ON public.catalog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin product images write" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin daily statuses write" ON public.daily_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);


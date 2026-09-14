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
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
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
    id TEXT PRIMARY KEY,
    catalog_item_id TEXT NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
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

-- =========================================================================
-- 7. ORDERS & ORDER ITEMS TABLES (V2 PRODUCTION WORKFLOW)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    delivery_method TEXT NOT NULL, -- 'PICKUP' or 'DELIVERY'
    delivery_address TEXT,
    delivery_landmark TEXT,
    delivery_city TEXT DEFAULT 'Coimbatore',
    delivery_pincode TEXT,
    delivery_note TEXT,
    customer_note TEXT,
    subtotal NUMERIC(10, 2) NOT NULL, -- MRP / Original subtotal
    savings NUMERIC(10, 2) DEFAULT 0,  -- Savings from MRP (subtotal - total_amount)
    total_amount NUMERIC(10, 2) NOT NULL, -- Products total before delivery charge
    delivery_charge NUMERIC(10, 2) DEFAULT NULL, -- Admin-set delivery fee (0 for PICKUP, NULL for pending DELIVERY)
    final_total NUMERIC(10, 2), -- Confirmed final payable total (total_amount + delivery_charge)
    delivery_charge_set_by TEXT,
    delivery_charge_updated_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    confirmation_email_sent_at TIMESTAMPTZ,
    confirmation_email_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Safe migration if tables previously existed with UUID id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
        ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_catalog_item_id_fkey;
        ALTER TABLE public.orders ALTER COLUMN id TYPE TEXT;
        ALTER TABLE public.order_items ALTER COLUMN id TYPE TEXT;
        ALTER TABLE public.order_items ALTER COLUMN order_id TYPE TEXT;
        ALTER TABLE public.order_items ALTER COLUMN catalog_item_id TYPE TEXT;
        ALTER TABLE public.order_items 
            ADD CONSTRAINT order_items_order_id_fkey 
            FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_brand_status ON public.orders(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON public.orders(invoice_number);

CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    catalog_item_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_type TEXT NOT NULL DEFAULT 'piece',
    unit_value NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    savings NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 8. INVOICE SEQUENCES TABLE
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    brand_id TEXT NOT NULL,
    year INT NOT NULL,
    last_seq INT NOT NULL DEFAULT 0,
    PRIMARY KEY (brand_id, year)
);

-- ATOMIC INVOICE NUMBER GENERATION FUNCTION
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_brand_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
    v_seq INT;
    v_invoice TEXT;
BEGIN
    IF p_brand_id = 'aquarium' THEN
        v_prefix := 'SSA';
    ELSIF p_brand_id = 'kirubai' THEN
        v_prefix := 'KCK';
    ELSIF p_brand_id = 'vision-360' THEN
        v_prefix := 'SSV';
    ELSE
        v_prefix := 'SSG';
    END IF;

    INSERT INTO public.invoice_sequences (brand_id, year, last_seq)
    VALUES (p_brand_id, v_year, 1)
    ON CONFLICT (brand_id, year)
    DO UPDATE SET last_seq = public.invoice_sequences.last_seq + 1
    RETURNING last_seq INTO v_seq;

    v_invoice := v_prefix || '-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 6, '0');
    RETURN v_invoice;
END;
$$ LANGUAGE plpgsql;

-- 9. ATOMIC STOCK CONFIRMATION FUNCTION
CREATE OR REPLACE FUNCTION public.confirm_order_and_deduct_stock(p_order_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    -- 1. Lock the order row and verify it's PENDING
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    IF v_order.status = 'CONFIRMED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order has already been confirmed.');
    END IF;

    IF v_order.status = 'CANCELLED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cancelled orders cannot be confirmed.');
    END IF;

    -- 2. Lock each catalog item and verify stock for ALL items
    FOR v_item IN
        SELECT oi.catalog_item_id, oi.quantity, oi.product_name, ci.stock_quantity
        FROM public.order_items oi
        JOIN public.catalog_items ci ON ci.id::TEXT = oi.catalog_item_id
        WHERE oi.order_id = p_order_id
        FOR UPDATE OF ci
    LOOP
        IF v_item.stock_quantity IS NOT NULL THEN
            IF v_item.stock_quantity < v_item.quantity THEN
                -- Insufficient stock: abort transaction immediately
                RETURN jsonb_build_object(
                    'success', false,
                    'error', 'Insufficient stock for ' || v_item.product_name || '. Required: ' || v_item.quantity || ', Available: ' || v_item.stock_quantity
                );
            END IF;
        END IF;
    END LOOP;

    -- 3. All items have sufficient stock -> deduct stock
    FOR v_item IN
        SELECT catalog_item_id, quantity
        FROM public.order_items
        WHERE order_id = p_order_id
    LOOP
        UPDATE public.catalog_items
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = NOW()
        WHERE id::TEXT = v_item.catalog_item_id AND stock_quantity IS NOT NULL;
    END LOOP;

    -- 4. Mark order CONFIRMED
    UPDATE public.orders
    SET status = 'CONFIRMED',
        confirmed_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'invoice_number', v_order.invoice_number,
        'message', 'Order confirmed and stock deducted successfully.'
    );
END;
$$ LANGUAGE plpgsql;

-- 10. CANCEL ORDER FUNCTION
CREATE OR REPLACE FUNCTION public.cancel_order_safe(p_order_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    IF v_order.status = 'CANCELLED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order is already cancelled.');
    END IF;

    IF v_order.status = 'CONFIRMED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Confirmed orders cannot be cancelled directly.');
    END IF;

    UPDATE public.orders
    SET status = 'CANCELLED',
        cancelled_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'message', 'Order cancelled safely.');
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & ESSENTIAL TABLE PRIVILEGES
-- =========================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- -- Grants for service_role, authenticated, and anon
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.invoice_sequences TO service_role;

GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT SELECT, UPDATE ON public.invoice_sequences TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT SELECT ON public.daily_statuses TO anon, authenticated;

-- Policies
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role full access invoice sequences" ON public.invoice_sequences;
DROP POLICY IF EXISTS "Public create pending order" ON public.orders;
DROP POLICY IF EXISTS "Public create order items" ON public.order_items;
DROP POLICY IF EXISTS "Public view orders" ON public.orders;
DROP POLICY IF EXISTS "Public view order items" ON public.order_items;

CREATE POLICY "Service role full access orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access order items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access invoice sequences" ON public.invoice_sequences FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anonymous insert with strict constraint (status must be PENDING, confirmed_at is null)
CREATE POLICY "Public create pending order" ON public.orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (status = 'PENDING' AND confirmed_at IS NULL AND cancelled_at IS NULL);

CREATE POLICY "Public create order items" ON public.order_items
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Read access for orders
CREATE POLICY "Public view orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public view order items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);

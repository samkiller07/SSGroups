-- =========================================================================
-- SS MULTI-BRAND COMMERCE PLATFORM: PRODUCTION ORDERS & PRIVILEGES MIGRATION
-- Execute this script once in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Safe to re-run (idempotent, does NOT drop or destroy existing data)
-- =========================================================================

-- 1. Ensure public schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. CREATE / UPDATE orders TABLE (TEXT IDs for application compatibility)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    brand_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    customer_note TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    savings NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    confirmation_email_sent_at TIMESTAMPTZ,
    confirmation_email_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Safe migration if tables existed previously with UUID id
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
    END IF;
END $$;

-- 3. CREATE / UPDATE order_items TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    catalog_item_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_type TEXT NOT NULL DEFAULT 'piece',
    unit_value NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure foreign key from order_items to orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.order_items 
            ADD CONSTRAINT order_items_order_id_fkey 
            FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. CREATE invoice_sequences TABLE
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    brand_id TEXT NOT NULL,
    year INT NOT NULL,
    last_seq INT NOT NULL DEFAULT 0,
    PRIMARY KEY (brand_id, year)
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_brand_status ON public.orders(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON public.orders(invoice_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 6. ATOMIC INVOICE NUMBER GENERATION RPC
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ATOMIC STOCK CONFIRMATION RPC
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
        RETURN jsonb_build_object('success', false, 'error', 'Order not found in database.');
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
                -- Insufficient stock: abort confirmation immediately
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. SAFE CANCEL ORDER RPC
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
        RETURN jsonb_build_object('success', false, 'error', 'Order not found in database.');
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 9. ESSENTIAL PRIVILEGE GRANTS (CRITICAL TO FIX 42501 PERMISSION DENIED)
-- =========================================================================

-- Grant full control on all tables, sequences, and functions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Specifically grant on order tables
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.invoice_sequences TO service_role;

-- Grant SELECT, INSERT on public tables to anon and authenticated
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT SELECT, UPDATE ON public.invoice_sequences TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT SELECT ON public.daily_statuses TO anon, authenticated;

-- Future tables default grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- =========================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role full access invoice sequences" ON public.invoice_sequences;
DROP POLICY IF EXISTS "Public create pending order" ON public.orders;
DROP POLICY IF EXISTS "Public create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin orders view" ON public.orders;
DROP POLICY IF EXISTS "Admin orders update" ON public.orders;
DROP POLICY IF EXISTS "Admin order items view" ON public.order_items;
DROP POLICY IF EXISTS "Public view orders" ON public.orders;
DROP POLICY IF EXISTS "Public view order items" ON public.order_items;

-- Service role bypasses RLS
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access order items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access invoice sequences" ON public.invoice_sequences FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public / anon order creation (Must be PENDING status)
CREATE POLICY "Public create pending order" ON public.orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (status = 'PENDING' AND confirmed_at IS NULL AND cancelled_at IS NULL);

CREATE POLICY "Public create order items" ON public.order_items
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Read access for orders
CREATE POLICY "Public view orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public view order items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);

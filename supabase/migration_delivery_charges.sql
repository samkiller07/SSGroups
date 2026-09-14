-- =========================================================================
-- MIGRATION: DELIVERY CHARGES & STRUCTURED DELIVERY ADDRESS FOR ORDERS
-- =========================================================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_landmark TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT DEFAULT 'Coimbatore',
ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
ADD COLUMN IF NOT EXISTS delivery_note TEXT,
ADD COLUMN IF NOT EXISTS products_total NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS final_total NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS delivery_charge_set_by TEXT,
ADD COLUMN IF NOT EXISTS delivery_charge_updated_at TIMESTAMPTZ;

-- Backfill products_total and final_total for existing rows if null
UPDATE public.orders
SET 
  products_total = COALESCE(products_total, total_amount),
  final_total = COALESCE(final_total, total_amount),
  delivery_charge = CASE 
    WHEN delivery_method IN ('PICKUP', 'SHOP_PICKUP') THEN 0
    ELSE delivery_charge
  END
WHERE products_total IS NULL OR final_total IS NULL;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

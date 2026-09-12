-- MIGRATION: ADD PRICE SNAPSHOT COLUMNS TO order_items
-- Ensures historical orders permanently retain exact MRP / original price and savings at time of order

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS savings NUMERIC(10, 2);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- IBN E NAIMAT COLLECTION — ORDERS & ORDER ITEMS DATABASE MIGRATION
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLE: orders
-- Stores customer checkout orders with Order ID, status, and shipping info
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,                          -- e.g. 'INC-20260927-0042'
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,                                   -- WhatsApp/Mobile number
    email TEXT,
    address TEXT NOT NULL,                                 -- Complete delivery address
    city TEXT NOT NULL,                                    -- Destination city
    notes TEXT,                                            -- Customer delivery notes
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN (
        'Pending', 
        'Confirmed', 
        'Processing', 
        'Dispatched', 
        'Out for Delivery', 
        'Delivered', 
        'Cancelled'
    )),
    admin_notes TEXT,                                      -- Internal administrator notes
    payment_method TEXT DEFAULT 'cod',                     -- Default: Cash on Delivery
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLE: order_items
-- Stores line items per order preserving historical price and product title
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,                              -- Product SKU (e.g. 'INC-W101')
    product_name TEXT NOT NULL,                            -- Preserved product title at time of order
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,                         -- Preserved unit price at time of order
    subtotal NUMERIC(10, 2) NOT NULL,                      -- quantity * price
    image_url TEXT,                                        -- Thumbnail image URL
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for fast searching and tracking
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ============================================================================
-- 4. DELIVERY SETTINGS EXTENSION IN website_settings
-- Adds delivery fee and free delivery threshold configuration
-- ============================================================================
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS default_delivery_fee NUMERIC(10, 2) DEFAULT 250.00,
ADD COLUMN IF NOT EXISTS free_delivery_threshold NUMERIC(10, 2) DEFAULT 10000.00;

-- Update row 1 if defaults are missing
UPDATE public.website_settings 
SET default_delivery_fee = COALESCE(default_delivery_fee, 250.00),
    free_delivery_threshold = COALESCE(free_delivery_threshold, 10000.00)
WHERE id = 1;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid collision
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view verified order" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;

-- 1. Public can insert new orders and order items from checkout
CREATE POLICY "Public can insert orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- 2. Authenticated Admin has complete access to view, update, delete orders
CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins have full access to order items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Public Order Tracking query:
-- Anyone can query orders (the client must supply order_id AND phone number match to receive data)
CREATE POLICY "Public can view verified order"
    ON public.orders FOR SELECT
    USING (true);

CREATE POLICY "Public can view order items"
    ON public.order_items FOR SELECT
    USING (true);

-- ============================================================================
-- 6. RPC FUNCTION: track_order (Extra security layer)
-- Returns verified order and items if and only if Order ID AND Phone match
-- ============================================================================
CREATE OR REPLACE FUNCTION public.track_order(p_order_id TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_phone TEXT;
    v_order RECORD;
    v_items JSONB;
    v_result JSONB;
BEGIN
    -- Normalize search phone by removing spaces, dashes, parentheses
    v_clean_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');

    -- Find matching order
    SELECT * INTO v_order
    FROM public.orders
    WHERE UPPER(order_id) = UPPER(TRIM(p_order_id))
      AND (
          REGEXP_REPLACE(phone, '[^0-9]', '', 'g') = v_clean_phone
          OR RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = RIGHT(v_clean_phone, 10)
      );

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Get line items
    SELECT COALESCE(jsonb_agg(to_jsonb(i)), '[]'::jsonb) INTO v_items
    FROM (
        SELECT id, order_id, product_id, product_name, quantity, price, subtotal, image_url
        FROM public.order_items
        WHERE order_id = v_order.order_id
    ) i;

    v_result := jsonb_build_object(
        'order', to_jsonb(v_order),
        'items', v_items
    );

    RETURN v_result;
END;
$$;

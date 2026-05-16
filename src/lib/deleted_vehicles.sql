-- SQL to run in Supabase SQL Editor to support deleting vehicles with history

-- 1. Create the deleted_vehicles table
CREATE TABLE IF NOT EXISTS public.deleted_vehicles (
    id uuid NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    plate text NOT NULL,
    price_per_day numeric NOT NULL,
    category text NOT NULL,
    seats integer NOT NULL,
    transmission text NOT NULL,
    fuel text NOT NULL,
    image text NOT NULL,
    status text NOT NULL,
    mileage integer NOT NULL,
    health integer NOT NULL,
    last_maintenance timestamp with time zone,
    created_at timestamp with time zone,
    deleted_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT deleted_vehicles_pkey PRIMARY KEY (id)
);

-- 2. Add is_deleted column to the main vehicles table to support soft deletes
-- This allows us to hide the vehicle from the main fleet without breaking old bookings
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- 3. (Optional) If you have any RLS policies on vehicles, you might need to add them here 
-- for the deleted_vehicles table depending on your security setup.

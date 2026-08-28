CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  store_id text REFERENCES public.stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text,
  price text,
  original_price text,
  discount_badge text,
  affiliate_url text,
  status text DEFAULT 'draft',
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT USING (true);

-- Allow authenticated users (admin) to modify
CREATE POLICY "Enable insert for authenticated users" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

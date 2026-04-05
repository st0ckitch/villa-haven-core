
-- 1. Blog categories table
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert blog categories" ON public.blog_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blog categories" ON public.blog_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blog categories" ON public.blog_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed default categories
INSERT INTO public.blog_categories (name, slug) VALUES
  ('General', 'general'),
  ('News', 'news'),
  ('Lifestyle', 'lifestyle'),
  ('Construction', 'construction');

-- 2. Add preferred_channels to contact_submissions
ALTER TABLE public.contact_submissions ADD COLUMN preferred_channels text[] DEFAULT '{}';

-- 3. Extended villa parameters
ALTER TABLE public.villas
  ADD COLUMN condominium text,
  ADD COLUMN view_type text,
  ADD COLUMN sector text,
  ADD COLUMN cadastral_codes text,
  ADD COLUMN total_area numeric,
  ADD COLUMN living_area numeric,
  ADD COLUMN balcony_area numeric,
  ADD COLUMN bedroom_count integer,
  ADD COLUMN living_room integer,
  ADD COLUMN kitchen integer,
  ADD COLUMN wet_point_1 integer,
  ADD COLUMN wet_point_2 integer,
  ADD COLUMN technical_room integer,
  ADD COLUMN ceiling_height text,
  ADD COLUMN parking text;

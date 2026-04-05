
-- Create hero_slides table
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Public can read active slides
CREATE POLICY "Public can read active hero slides"
ON public.hero_slides FOR SELECT TO public
USING (is_active = true);

-- Admin read all
CREATE POLICY "Admins can read all hero slides"
ON public.hero_slides FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin insert
CREATE POLICY "Admins can insert hero slides"
ON public.hero_slides FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin update
CREATE POLICY "Admins can update hero slides"
ON public.hero_slides FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete hero slides"
ON public.hero_slides FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create slider-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('slider-images', 'slider-images', true);

-- Storage policies for slider-images
CREATE POLICY "Public can read slider images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'slider-images');

CREATE POLICY "Admins can upload slider images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'slider-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete slider images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'slider-images' AND public.has_role(auth.uid(), 'admin'));

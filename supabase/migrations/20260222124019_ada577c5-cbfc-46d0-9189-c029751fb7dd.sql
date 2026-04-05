
-- Add slug and multilingual description columns to villas
ALTER TABLE public.villas ADD COLUMN slug text UNIQUE;
ALTER TABLE public.villas ADD COLUMN description_ka text;
ALTER TABLE public.villas ADD COLUMN description_ru text;

-- Create villa_images table
CREATE TABLE public.villa_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id uuid NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_hero boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.villa_images ENABLE ROW LEVEL SECURITY;

-- Public can read villa images
CREATE POLICY "Public can read villa images"
  ON public.villa_images FOR SELECT
  USING (true);

-- Admins can insert villa images
CREATE POLICY "Admins can insert villa images"
  ON public.villa_images FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update villa images
CREATE POLICY "Admins can update villa images"
  ON public.villa_images FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete villa images
CREATE POLICY "Admins can delete villa images"
  ON public.villa_images FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create villa-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('villa-images', 'villa-images', true);

-- Storage policies for villa-images bucket
CREATE POLICY "Public can read villa images storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'villa-images');

CREATE POLICY "Admins can upload villa images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'villa-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update villa images storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'villa-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete villa images storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'villa-images' AND has_role(auth.uid(), 'admin'::app_role));

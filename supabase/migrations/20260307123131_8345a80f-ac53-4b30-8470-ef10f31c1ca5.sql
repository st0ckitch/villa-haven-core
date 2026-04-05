
CREATE TABLE public.plot_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'available',
  size_sqm NUMERIC,
  polygon JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plot_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read plot zones" ON public.plot_zones FOR SELECT USING (true);
CREATE POLICY "Admins can insert plot zones" ON public.plot_zones FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update plot zones" ON public.plot_zones FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete plot zones" ON public.plot_zones FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_plot_zones_updated_at
  BEFORE UPDATE ON public.plot_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.plot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read plot settings" ON public.plot_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage plot settings" ON public.plot_settings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_plot_zone_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('available', 'reserved', 'sold') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  IF char_length(COALESCE(NEW.description, '')) > 90 THEN
    RAISE EXCEPTION 'Description must be 90 characters or fewer';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_plot_zone
  BEFORE INSERT OR UPDATE ON public.plot_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_plot_zone_status();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('plot-images', 'plot-images', true);

CREATE POLICY "Public can read plot images" ON storage.objects FOR SELECT USING (bucket_id = 'plot-images');
CREATE POLICY "Admins can upload plot images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'plot-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete plot images" ON storage.objects FOR DELETE USING (bucket_id = 'plot-images' AND public.has_role(auth.uid(), 'admin'));

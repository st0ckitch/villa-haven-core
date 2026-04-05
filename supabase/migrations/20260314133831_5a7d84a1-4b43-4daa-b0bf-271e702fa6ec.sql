
-- Add price column to plot_zones
ALTER TABLE public.plot_zones ADD COLUMN price NUMERIC DEFAULT NULL;

-- Create junction table for plot_zone <-> villa assignments
CREATE TABLE public.plot_zone_villa_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_zone_id UUID NOT NULL REFERENCES public.plot_zones(id) ON DELETE CASCADE,
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  UNIQUE(plot_zone_id, villa_id)
);

-- Enable RLS
ALTER TABLE public.plot_zone_villa_assignments ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read plot zone villa assignments"
  ON public.plot_zone_villa_assignments FOR SELECT
  TO public USING (true);

-- Admin insert
CREATE POLICY "Admins can insert plot zone villa assignments"
  ON public.plot_zone_villa_assignments FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete plot zone villa assignments"
  ON public.plot_zone_villa_assignments FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

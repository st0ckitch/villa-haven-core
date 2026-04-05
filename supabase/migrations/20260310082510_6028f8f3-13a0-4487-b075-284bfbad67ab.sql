
-- Create land_plots table
CREATE TABLE public.land_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size_sqm NUMERIC NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validation trigger for land_plots status
CREATE OR REPLACE FUNCTION public.validate_land_plot_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('available', 'reserved', 'sold') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_land_plot_status_trigger
  BEFORE INSERT OR UPDATE ON public.land_plots
  FOR EACH ROW EXECUTE FUNCTION public.validate_land_plot_status();

-- Updated_at trigger
CREATE TRIGGER update_land_plots_updated_at
  BEFORE UPDATE ON public.land_plots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for land_plots
ALTER TABLE public.land_plots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read land plots" ON public.land_plots
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert land plots" ON public.land_plots
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update land plots" ON public.land_plots
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete land plots" ON public.land_plots
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create junction table
CREATE TABLE public.plot_villa_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID NOT NULL REFERENCES public.land_plots(id) ON DELETE CASCADE,
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  UNIQUE(plot_id, villa_id)
);

-- RLS for junction table
ALTER TABLE public.plot_villa_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read plot villa assignments" ON public.plot_villa_assignments
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert plot villa assignments" ON public.plot_villa_assignments
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete plot villa assignments" ON public.plot_villa_assignments
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

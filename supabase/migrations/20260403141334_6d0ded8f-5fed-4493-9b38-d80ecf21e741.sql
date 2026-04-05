
CREATE TABLE public.project_renders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read project renders" ON public.project_renders FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert project renders" ON public.project_renders FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update project renders" ON public.project_renders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete project renders" ON public.project_renders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

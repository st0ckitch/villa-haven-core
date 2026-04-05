INSERT INTO storage.buckets (id, name, public) VALUES ('catalogs', 'catalogs', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read catalogs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'catalogs');
CREATE POLICY "Admins can upload catalogs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalogs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update catalogs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'catalogs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete catalogs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'catalogs' AND public.has_role(auth.uid(), 'admin'));
-- Client feedback (PPTX "Siaxleebi" April 2026) — blog categories update
-- Adds client-requested news categories. Existing categories retained.

INSERT INTO public.blog_categories (name, slug) VALUES
  ('პოლოგრაფი', 'polograph'),
  ('იგავი დეველოპმენტი', 'igavi-development'),
  ('ოლიმპო', 'olimpo'),
  ('ცხოვრების ახალი სტანდარტი', 'new-living-standard'),
  ('მწვანე სივრცე', 'green-space'),
  ('იპოდრომი', 'ipodromi')
ON CONFLICT (slug) DO NOTHING;

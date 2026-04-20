-- Client feedback (PPTX April 2026) — seed new settings rows
-- Only inserts; existing admin-entered values are preserved via ON CONFLICT DO NOTHING.

-- Slide 1: X (Twitter) social link field for admin panel
INSERT INTO public.site_settings (key, value) VALUES
  ('social_x', '')
ON CONFLICT (key) DO NOTHING;

-- Slides 10–11: Polograph default title + description
INSERT INTO public.site_settings (key, value) VALUES
  ('polograph_title', 'პოლოგრაფი იგავისგან'),
  ('polograph_description', 'სიმწვანეში ჩაფლული ეკო-მეგობრული, უნიკალური საცხოვრებელი გარემო, სადაც მობინადრეები კომფორტულად და ჰარმონიულად გრძნობენ თავს.')
ON CONFLICT (key) DO NOTHING;

-- Client feedback (April 23, 2026) — Polograph hero should show the same
-- "premium-class, eco-friendly..." copy on all three languages, not the old
-- English-only "flagship residential project" text that had been pasted into
-- the language-neutral `polograph_description` row.
--
-- Seed per-language rows so the 3-tier resolver (lib/localizedContent.ts)
-- picks up language-specific copy first. `ON CONFLICT DO NOTHING` preserves
-- anything the admin already set via the per-language fields.

INSERT INTO public.site_settings (key, value) VALUES
  ('polograph_title_ka', 'პოლოგრაფი იგავისგან'),
  ('polograph_title_en', 'Polograph by Igavi'),
  ('polograph_title_ru', 'Полограф от Igavi'),
  ('polograph_description_ka', 'პრემიუმ კლასის, ეკო-მეგობრული, უნიკალური, მასშტაბური საცხოვრებელი კომპლექსი თბილისთან ახლოს.'),
  ('polograph_description_en', 'A premium-class, eco-friendly, unique and large-scale residential complex near Tbilisi.'),
  ('polograph_description_ru', 'Премиум-класс, эко-дружественный, уникальный и масштабный жилой комплекс рядом с Тбилиси.')
ON CONFLICT (key) DO NOTHING;

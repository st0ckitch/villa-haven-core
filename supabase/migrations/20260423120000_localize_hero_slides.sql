-- Per-language copy on the homepage hero slider (client feedback Apr 23, 2026).
-- The admin can now enter KA/EN/RU title + description for each slide; the
-- frontend resolves via `getLocalizedField(row, 'title', lang)` which already
-- prefers `<field>_<lang>` over the legacy single column.

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS title_ka text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_ru text,
  ADD COLUMN IF NOT EXISTS description_ka text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_ru text;

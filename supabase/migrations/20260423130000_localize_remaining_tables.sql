-- Per-language columns for the last few admin-managed tables
-- (client feedback Apr 23, 2026 — "check other pages and localize").
--
-- The public site uses `getLocalizedField(row, '<field>', lang)` which prefers
-- `<field>_<lang>` and falls back to the legacy bare column, so the admin can
-- fill the per-language rows progressively without breaking existing content.

ALTER TABLE public.renders
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS description_en text;

ALTER TABLE public.project_renders
  ADD COLUMN IF NOT EXISTS title_ka text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_ru text;

ALTER TABLE public.blog_categories
  ADD COLUMN IF NOT EXISTS name_ka text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_ru text;

ALTER TABLE public.plot_zones
  ADD COLUMN IF NOT EXISTS name_ka text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_ru text,
  ADD COLUMN IF NOT EXISTS description_ka text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_ru text;

ALTER TABLE public.land_plots
  ADD COLUMN IF NOT EXISTS name_ka text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_ru text;

-- Backfill the Georgian current category names into name_ka so the public
-- filter pills can start using getLocalizedField immediately.
UPDATE public.blog_categories SET name_ka = name WHERE name_ka IS NULL;

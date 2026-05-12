-- Three new villa parameters per client screenshot (May 12, 2026):
--   plot_area    — numeric, m² of the land plot
--   rooms_count  — integer, number of rooms (distinct from bedroom_count)
--   pool         — boolean, "Yes"/"No" toggle for whether a pool is included
--
-- Existing villa columns are kept as-is. The public detail page now renders a
-- fixed 11-field list (sector, cadastral_codes, plot_area, view_type,
-- total_area, living_area, rooms_count, bedroom_count, wet_point_1, pool,
-- parking) — see src/pages/VillaDetail.tsx.

ALTER TABLE public.villas
  ADD COLUMN IF NOT EXISTS plot_area numeric,
  ADD COLUMN IF NOT EXISTS rooms_count integer,
  ADD COLUMN IF NOT EXISTS pool boolean;

-- Per client revised flow (WhatsApp, 2026-05-31): every plot can pair with any
-- villa, and plots carry more parameters than just sqm. Add a short identifier
-- code (A3, D14, B8 …) and physical dimensions. Keep the existing `name` field
-- as the localized display label so we don't break already-saved zones.

ALTER TABLE public.plot_zones
  ADD COLUMN IF NOT EXISTS code     TEXT,
  ADD COLUMN IF NOT EXISTS length_m NUMERIC,
  ADD COLUMN IF NOT EXISTS width_m  NUMERIC;

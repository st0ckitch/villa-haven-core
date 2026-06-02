-- Per-villa downloadable project PDF (client PDF 2026-05-31 — replaces
-- the "Request more information" sidebar block on the public villa
-- detail page). Admin uploads via /admin/villas; URL points at the
-- existing `catalogs` storage bucket (`villa-<id>.pdf`).
--
-- Default: NULL. The public villa detail page hides the "Download
-- project" CTA when this is empty, so unconfigured villas degrade
-- gracefully. Once admin uploads a PDF the CTA appears automatically.

ALTER TABLE public.villas
  ADD COLUMN IF NOT EXISTS project_pdf_url TEXT;

NOTIFY pgrst, 'reload schema';

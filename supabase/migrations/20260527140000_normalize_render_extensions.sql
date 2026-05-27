-- Normalize project_renders and renders image URLs to the .jpg extensions
-- after recompressing PNG/JPEG sources to JPG (smaller payloads, faster
-- first paint). Idempotent: each UPDATE is a no-op once already applied.

-- ─── project_renders ──────────────────────────────────────────────────────
UPDATE public.project_renders
SET image_url = REPLACE(image_url, '.png',  '.jpg')
WHERE image_url LIKE '/renders/%' AND image_url LIKE '%.png';

UPDATE public.project_renders
SET image_url = REPLACE(image_url, '.jpeg', '.jpg')
WHERE image_url LIKE '/renders/%' AND image_url LIKE '%.jpeg';

-- ─── renders (general gallery) ────────────────────────────────────────────
UPDATE public.renders
SET image_url = REPLACE(image_url, '.png',  '.jpg')
WHERE image_url LIKE '/renders/%' AND image_url LIKE '%.png';

UPDATE public.renders
SET image_url = REPLACE(image_url, '.jpeg', '.jpg')
WHERE image_url LIKE '/renders/%' AND image_url LIKE '%.jpeg';

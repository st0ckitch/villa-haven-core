-- Client feedback 2026-05-31 (WhatsApp):
--   "In the gallery and generally — don't show 'Render N' (numeric labels)."
--
-- The seed migration 20260527120000_seed_slide_images.sql inserted ~43
-- placeholder rows with titles like "Render 01" / "რენდერი 01" / "Рендер 01".
-- The Lightbox now hides these client-side (via a regex), but emptying them
-- in the DB is the cleaner long-term fix: real human captions added later
-- via admin will still show, and analytics / SEO won't carry placeholder
-- strings into Bitrix descriptions.

UPDATE public.renders
SET
  title    = NULL,
  title_ka = NULL,
  title_en = NULL,
  title_ru = NULL
WHERE
  (title    IS NOT NULL AND title    ~ '^Render\s*\d+$')
  OR (title_ka IS NOT NULL AND title_ka ~ '^რენდერი\s*\d+$')
  OR (title_en IS NOT NULL AND title_en ~ '^Render\s*\d+$')
  OR (title_ru IS NOT NULL AND title_ru ~ '^Рендер\s*\d+$');

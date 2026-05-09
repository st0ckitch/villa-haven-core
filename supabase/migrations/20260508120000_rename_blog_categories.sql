-- Rename two blog categories per client feedback (May 8, 2026):
--   "ახალი დეველოპმენტი"          → "იგავი დეველოპმენტი"
--   "ცხოვრების ჯანსაღი სტანდარტი" → "ცხოვრების ახალი სტანდარტი"
--
-- The slugs stay the same so existing post associations and URLs keep working.

UPDATE public.blog_categories
SET name = 'იგავი დეველოპმენტი',
    name_ka = 'იგავი დეველოპმენტი'
WHERE slug = 'new-development';

UPDATE public.blog_categories
SET name = 'ცხოვრების ახალი სტანდარტი',
    name_ka = 'ცხოვრების ახალი სტანდარტი'
WHERE slug = 'healthy-living-standard';

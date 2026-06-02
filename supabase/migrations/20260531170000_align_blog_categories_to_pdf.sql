-- Client PDF 2026-05-31 lists the 6 canonical blog categories. The
-- April 23 migration seeded 6 but used slightly different wording for
-- two of them. Align names + localized name_* fields to match the PDF
-- screenshot exactly:
--
--   PDF spec                          | Current DB
--   ----------------------------------|----------------------------------
--   იგავი დეველოპმენტი                | ახალი დეველოპმენტი            (rename)
--   იპოდრომი                          | იპოდრომი                       ✓
--   მწვანე სივრცე                     | მწვანე სივრცე                  ✓
--   ოლიმპო                            | ოლიმპო                         ✓
--   პოლოგრაფი                         | პოლოგრაფი                      ✓
--   ცხოვრების ახალი სტანდარტი         | ცხოვრების ჯანსაღი სტანდარტი   (rename)
--
-- Slugs stay stable so existing blog_posts.categories[] / blog_posts.category
-- references keep matching — only the display name moves.

UPDATE public.blog_categories
SET name = 'იგავი დეველოპმენტი',
    name_ka = 'იგავი დეველოპმენტი',
    name_en = 'Igavi Development',
    name_ru = 'Игави Девелопмент'
WHERE slug = 'new-development';

UPDATE public.blog_categories
SET name = 'ცხოვრების ახალი სტანდარტი',
    name_ka = 'ცხოვრების ახალი სტანდარტი',
    name_en = 'New Standard of Living',
    name_ru = 'Новый стандарт жизни'
WHERE slug = 'healthy-living-standard';

-- Backfill localized names for the other four so the public Blog page
-- always renders the right string per current language.
UPDATE public.blog_categories
SET name_ka = 'პოლოგრაფი', name_en = 'Polograph', name_ru = 'Полограф'
WHERE slug = 'polograph';

UPDATE public.blog_categories
SET name_ka = 'იპოდრომი', name_en = 'Ipodromi', name_ru = 'Ипподром'
WHERE slug = 'ipodromi';

UPDATE public.blog_categories
SET name_ka = 'ოლიმპო', name_en = 'Olimpo', name_ru = 'Олимпо'
WHERE slug = 'olimpo';

UPDATE public.blog_categories
SET name_ka = 'მწვანე სივრცე', name_en = 'Green Space', name_ru = 'Зелёное пространство'
WHERE slug = 'green-space';

-- Populate per-language name columns on blog_categories so the filter pills
-- and post tags render in the active UI language (ka/en/ru) instead of falling
-- back to the default `name` (which was English for several rows).
--
-- Safe to run regardless of which earlier migrations have been applied: each
-- UPDATE matches by stable `slug`, and rows that don't exist are no-ops.
--
-- We only set name_ka / name_en / name_ru. The base `name` column is left as-is
-- so existing references stay valid; getLocalizedField() prefers the per-
-- language column when present (see src/contexts/LanguageContext.tsx).

-- English-named rows that may still be in the DB from earlier seeding
UPDATE public.blog_categories
SET name_ka = 'მშენებლობა', name_en = 'Construction', name_ru = 'Строительство'
WHERE slug = 'construction';

UPDATE public.blog_categories
SET name_ka = 'ზოგადი', name_en = 'General', name_ru = 'Общее'
WHERE slug = 'general';

UPDATE public.blog_categories
SET name_ka = 'ცხოვრების სტილი', name_en = 'Lifestyle', name_ru = 'Образ жизни'
WHERE slug = 'lifestyle';

UPDATE public.blog_categories
SET name_ka = 'სიახლეები', name_en = 'News', name_ru = 'Новости'
WHERE slug = 'news';

UPDATE public.blog_categories
SET name_ka = 'არქიტექტურა', name_en = 'Architecture', name_ru = 'Архитектура'
WHERE slug = 'architecture';

UPDATE public.blog_categories
SET name_ka = 'ინვესტიცია', name_en = 'Investment', name_ru = 'Инвестиции'
WHERE slug = 'investment';

-- Client-approved categories (already Georgian in `name` / `name_ka`); fill EN + RU
UPDATE public.blog_categories
SET name_en = 'Polograph', name_ru = 'Полограф'
WHERE slug = 'polograph';

UPDATE public.blog_categories
SET name_en = 'Ipodromi', name_ru = 'Ипподром'
WHERE slug = 'ipodromi';

UPDATE public.blog_categories
SET name_en = 'Olimpo', name_ru = 'Олимпо'
WHERE slug = 'olimpo';

UPDATE public.blog_categories
SET name_en = 'Green Space', name_ru = 'Зелёное пространство'
WHERE slug = 'green-space';

UPDATE public.blog_categories
SET name_en = 'New Living Standard', name_ru = 'Новый стандарт жизни'
WHERE slug = 'healthy-living-standard';

UPDATE public.blog_categories
SET name_en = 'Igavi Development', name_ru = 'Igavi Development'
WHERE slug = 'new-development';

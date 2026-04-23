-- Blog categories reset + multi-category support (client feedback Apr 23, 2026).
--
-- Two changes:
--   1. Replace the blog_categories list with the six client-approved categories.
--      Old rows (Construction, General, Lifestyle, News, etc.) are removed so the
--      public /blog page shows only what the client specified in the screenshot.
--   2. Add `categories text[]` to blog_posts so a single post can belong to more
--      than one category. The legacy `category` column is kept for back-compat
--      and used as the first entry when `categories` is null.

-- 1) Reset blog_categories to match screenshot
DELETE FROM public.blog_categories;

INSERT INTO public.blog_categories (name, slug) VALUES
  ('პოლოგრაფი', 'polograph'),
  ('იპოდრომი', 'ipodromi'),
  ('ოლიმპო', 'olimpo'),
  ('მწვანე სივრცე', 'green-space'),
  ('ცხოვრების ჯანსაღი სტანდარტი', 'healthy-living-standard'),
  ('ახალი დეველოპმენტი', 'new-development');

-- 2) Multi-category support
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';

-- Backfill: copy each post's existing single `category` slug into `categories[]`
-- so nothing disappears from filtered views after deploy.
UPDATE public.blog_posts
SET categories = ARRAY[category]
WHERE category IS NOT NULL
  AND (categories IS NULL OR array_length(categories, 1) IS NULL);

-- GIN index so `categories @> ARRAY['slug']` filters stay fast as the list grows.
CREATE INDEX IF NOT EXISTS blog_posts_categories_gin
  ON public.blog_posts USING GIN (categories);

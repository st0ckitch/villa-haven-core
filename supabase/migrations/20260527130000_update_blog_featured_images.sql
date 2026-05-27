-- Replace the home-page News card images per PPTX slide 2 ("same logic for
-- all 3 cards" — each card should use the image positioned above it in the
-- slide). The home BlogSection renders the 3 most recent published posts;
-- updating their `featured_image_url` is what flows through.
--
-- Idempotent: matches by stable slug, so re-running has no effect.

UPDATE public.blog_posts
SET featured_image_url = '/renders/home/blog-legend-of-love.jpg'
WHERE slug = 'polograph-legend-of-love';

UPDATE public.blog_posts
SET featured_image_url = '/renders/home/blog-equestrianism.jpg'
WHERE slug = 'equestrianism-tradition-in-polograph';

UPDATE public.blog_posts
SET featured_image_url = '/renders/home/blog-nature-harmony.jpg'
WHERE slug = 'polograph-nature-harmony';

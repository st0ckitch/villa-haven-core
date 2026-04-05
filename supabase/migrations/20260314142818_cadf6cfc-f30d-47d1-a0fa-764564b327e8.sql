ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_keywords_ka text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_keywords_ru text;
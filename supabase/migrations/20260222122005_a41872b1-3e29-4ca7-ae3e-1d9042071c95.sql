
-- Add translation columns to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN title_ka text;
ALTER TABLE public.blog_posts ADD COLUMN title_ru text;
ALTER TABLE public.blog_posts ADD COLUMN excerpt_ka text;
ALTER TABLE public.blog_posts ADD COLUMN excerpt_ru text;
ALTER TABLE public.blog_posts ADD COLUMN content_ka text;
ALTER TABLE public.blog_posts ADD COLUMN content_ru text;
ALTER TABLE public.blog_posts ADD COLUMN meta_title_ka text;
ALTER TABLE public.blog_posts ADD COLUMN meta_title_ru text;
ALTER TABLE public.blog_posts ADD COLUMN meta_description_ka text;
ALTER TABLE public.blog_posts ADD COLUMN meta_description_ru text;

-- Add translation columns to renders
ALTER TABLE public.renders ADD COLUMN title_ka text;
ALTER TABLE public.renders ADD COLUMN title_ru text;
ALTER TABLE public.renders ADD COLUMN description_ka text;
ALTER TABLE public.renders ADD COLUMN description_ru text;

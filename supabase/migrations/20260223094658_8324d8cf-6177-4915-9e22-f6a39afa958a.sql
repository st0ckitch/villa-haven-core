
-- Drop the restrictive SELECT policies and recreate as permissive
DROP POLICY "Admins can read all posts" ON public.blog_posts;
DROP POLICY "Public can read published posts" ON public.blog_posts;

-- Recreate as permissive (default) so ANY matching policy grants access
CREATE POLICY "Admins can read all posts"
ON public.blog_posts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read published posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

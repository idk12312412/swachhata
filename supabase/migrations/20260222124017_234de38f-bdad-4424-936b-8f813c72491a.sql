
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog posts"
ON public.blog_posts FOR SELECT
USING (true);

CREATE POLICY "Users can insert own blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blog posts"
ON public.blog_posts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any blog post"
ON public.blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

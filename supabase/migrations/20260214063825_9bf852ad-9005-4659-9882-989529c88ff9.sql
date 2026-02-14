
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  points INTEGER NOT NULL DEFAULT 0,
  rank TEXT NOT NULL DEFAULT 'Seedling',
  is_human_classifier BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard: everyone can see profiles for ranking
CREATE POLICY "Anyone can view profiles for leaderboard" ON public.profiles FOR SELECT USING (true);

-- Classifications table
CREATE TABLE public.classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  item_description TEXT DEFAULT '',
  classification_type TEXT CHECK (classification_type IN ('recycle', 'reuse', 'keep', 'dispose')),
  material_type TEXT DEFAULT '',
  co2_saved NUMERIC(10,2) NOT NULL DEFAULT 0,
  confidence NUMERIC(3,2) DEFAULT 0,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  classified_by UUID REFERENCES auth.users(id),
  recycling_steps TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own classifications" ON public.classifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Human classifiers can view flagged items" ON public.classifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_human_classifier = true)
  AND is_flagged = true
);
CREATE POLICY "Users can insert own classifications" ON public.classifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own classifications" ON public.classifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Human classifiers can update flagged items" ON public.classifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_human_classifier = true)
  AND is_flagged = true
);
CREATE POLICY "Users can delete own classifications" ON public.classifications FOR DELETE USING (auth.uid() = user_id);

-- Points history table
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  classification_id UUID REFERENCES public.classifications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points history" ON public.points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points history" ON public.points_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage bucket for waste images
INSERT INTO storage.buckets (id, name, public) VALUES ('waste-images', 'waste-images', true);

CREATE POLICY "Authenticated users can upload waste images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'waste-images' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view waste images" ON storage.objects FOR SELECT USING (bucket_id = 'waste-images');
CREATE POLICY "Users can delete own waste images" ON storage.objects FOR DELETE USING (bucket_id = 'waste-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

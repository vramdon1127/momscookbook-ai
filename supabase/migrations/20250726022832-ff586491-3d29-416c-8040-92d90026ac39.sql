-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  favorite_cuisines TEXT[],
  dietary_preferences TEXT[],
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions JSONB NOT NULL DEFAULT '[]',
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type TEXT,
  dietary_tags TEXT[],
  story TEXT,
  photos JSONB DEFAULT '[]',
  video_url TEXT,
  audio_url TEXT,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipe prompts table
CREATE TABLE public.recipe_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT,
  season TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user prompts table (tracks which prompts users have responded to)
CREATE TABLE public.user_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.recipe_prompts(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- Create recipe likes table
CREATE TABLE public.recipe_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create recipe saves table
CREATE TABLE public.recipe_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create recipe comments table
CREATE TABLE public.recipe_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cookbooks table
CREATE TABLE public.cookbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  dedication TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed')),
  is_digital BOOLEAN DEFAULT true,
  is_printed BOOLEAN DEFAULT false,
  print_order_id TEXT,
  print_status TEXT,
  recipe_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cookbook recipes table (many-to-many relationship)
CREATE TABLE public.cookbook_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cookbook_id UUID NOT NULL REFERENCES public.cookbooks(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cookbook_id, recipe_id),
  UNIQUE(cookbook_id, order_index)
);

-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal plan recipes table
CREATE TABLE public.meal_plan_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(meal_plan_id, day_of_week, meal_type)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookbook_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for recipes
CREATE POLICY "Users can view public recipes" ON public.recipes
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for recipe prompts (public read)
CREATE POLICY "Anyone can view active prompts" ON public.recipe_prompts
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user prompts
CREATE POLICY "Users can view their own prompts" ON public.user_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompt responses" ON public.user_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt responses" ON public.user_prompts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for recipe likes
CREATE POLICY "Users can view all likes" ON public.recipe_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.recipe_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.recipe_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for recipe saves
CREATE POLICY "Users can view their own saves" ON public.recipe_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves" ON public.recipe_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves" ON public.recipe_saves
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for recipe comments
CREATE POLICY "Users can view comments on public recipes" ON public.recipe_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = recipe_comments.recipe_id 
      AND (recipes.is_public = true OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on public recipes" ON public.recipe_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = recipe_comments.recipe_id 
      AND recipes.is_public = true
    )
  );

CREATE POLICY "Users can update their own comments" ON public.recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.recipe_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for cookbooks
CREATE POLICY "Users can view their own cookbooks" ON public.cookbooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cookbooks" ON public.cookbooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cookbooks" ON public.cookbooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cookbooks" ON public.cookbooks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for cookbook recipes
CREATE POLICY "Users can view recipes in their cookbooks" ON public.cookbook_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cookbooks 
      WHERE cookbooks.id = cookbook_recipes.cookbook_id 
      AND cookbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add recipes to their cookbooks" ON public.cookbook_recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cookbooks 
      WHERE cookbooks.id = cookbook_recipes.cookbook_id 
      AND cookbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove recipes from their cookbooks" ON public.cookbook_recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.cookbooks 
      WHERE cookbooks.id = cookbook_recipes.cookbook_id 
      AND cookbooks.user_id = auth.uid()
    )
  );

-- Create RLS policies for meal plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meal plan recipes
CREATE POLICY "Users can view recipes in their meal plans" ON public.meal_plan_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_recipes.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add recipes to their meal plans" ON public.meal_plan_recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_recipes.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove recipes from their meal plans" ON public.meal_plan_recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_recipes.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipe_comments_updated_at
  BEFORE UPDATE ON public.recipe_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cookbooks_updated_at
  BEFORE UPDATE ON public.cookbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample recipe prompts
INSERT INTO public.recipe_prompts (title, description, prompt_text, category, season) VALUES
('Grandmother''s Secret Recipe', 'Share a cherished recipe passed down through generations', 'What''s a recipe your grandmother or grandfather taught you? Tell us the story behind it and why it''s special to your family.', 'family', 'all'),
('Holiday Traditions', 'Your favorite holiday dish and its memories', 'Share your favorite holiday dish. What makes it special? Who taught you to make it, and what memories does it bring back?', 'holiday', 'winter'),
('Comfort Food Classic', 'The dish that always makes you feel better', 'What''s your go-to comfort food recipe? When do you make it, and what memories or feelings does it evoke?', 'comfort', 'all'),
('Summer BBQ Favorite', 'Your signature grilling recipe', 'What''s your signature summer grilling recipe? Share the story of how you perfected it and who you love to cook it for.', 'bbq', 'summer'),
('Family Celebration Dish', 'The recipe that brings everyone together', 'What dish do you always make for family celebrations? What makes it so special for bringing people together?', 'celebration', 'all'),
('Childhood Memory', 'A recipe that takes you back to childhood', 'What recipe instantly transports you back to your childhood? Who made it for you, and what do you remember about those moments?', 'childhood', 'all'),
('Cultural Heritage', 'A recipe from your cultural background', 'Share a recipe that represents your cultural heritage. What''s its significance, and how has it been passed down in your family?', 'heritage', 'all'),
('First Cooking Success', 'The first dish you mastered', 'What was the first recipe you successfully learned to cook? Tell us about that experience and who taught you.', 'learning', 'all');
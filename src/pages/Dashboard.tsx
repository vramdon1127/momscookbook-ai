import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Book, 
  Heart, 
  Calendar, 
  Users, 
  ChefHat,
  Sparkles,
  Crown,
  Play,
  Clock,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine_type: string;
  difficulty: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  likes_count: number;
  video_url: string;
  photos: any[];
  created_at: string;
}

interface RecipePrompt {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  category: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<RecipePrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalLikes: 0,
    totalSaves: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserRecipes();
      fetchCurrentPrompt();
    }
  }, [user]);

  const fetchUserRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      setRecipes((data || []).map(recipe => ({
        ...recipe,
        photos: Array.isArray(recipe.photos) ? recipe.photos : []
      })));
      
      // Calculate stats
      const totalRecipes = data?.length || 0;
      const totalLikes = data?.reduce((sum, recipe) => sum + (recipe.likes_count || 0), 0) || 0;
      setStats({ totalRecipes, totalLikes, totalSaves: 0 });
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrompt = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_prompts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setCurrentPrompt(data[0]);
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
          <p>Loading your culinary legacy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Recipe Legacy</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.full_name || 'Chef'}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile?.subscription_tier === 'premium' && (
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
              <Button onClick={() => navigate('/')} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Recipe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Weekly Prompt */}
        {currentPrompt && (
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">This Week's Recipe Prompt</CardTitle>
              </div>
              <CardDescription className="font-medium text-base">
                {currentPrompt.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {currentPrompt.prompt_text}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/record-recipe')} className="gap-2">
                  <Play className="w-4 h-4" />
                  Record Your Story
                </Button>
                <Button variant="outline" onClick={() => navigate('/create-recipe')}>
                  Write Recipe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Book className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRecipes}</p>
                  <p className="text-sm text-muted-foreground">Recipes Shared</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Cookbooks Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recipes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Recent Recipes</h2>
            <Button variant="outline" onClick={() => navigate('/recipes')}>
              View All
            </Button>
          </div>

          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-0">
                    {recipe.photos && recipe.photos.length > 0 ? (
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={recipe.photos[0]} 
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {recipe.title}
                        </h3>
                        {recipe.video_url && (
                          <Play className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {recipe.cuisine_type && (
                          <Badge variant="secondary" className="text-xs">
                            {recipe.cuisine_type}
                          </Badge>
                        )}
                        {recipe.difficulty && (
                          <Badge variant="outline" className="text-xs">
                            {recipe.difficulty}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)}min
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {recipe.likes_count || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <ChefHat className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your culinary legacy by sharing your first family recipe
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/record-recipe')} className="gap-2">
                  <Play className="w-4 h-4" />
                  Record a Recipe
                </Button>
                <Button variant="outline" onClick={() => navigate('/create-recipe')}>
                  Write a Recipe
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Meal Planning</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Plan your weekly meals using your saved recipes
            </p>
            <Button variant="outline" onClick={() => navigate('/meal-planner')}>
              Plan Meals
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Book className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Create Cookbook</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Compile your recipes into a beautiful family cookbook
            </p>
            <Button variant="outline" onClick={() => navigate('/cookbooks')}>
              Create Cookbook
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
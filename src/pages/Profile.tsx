import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Edit3, Heart, BookOpen, Users, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine_type: string;
  difficulty: string;
  likes_count: number;
  saves_count: number;
  is_public: boolean;
  created_at: string;
}

export default function Profile() {
  const { user, profile } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's recipes
      const { data: userRecipes } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch saved recipes
      const { data: saves } = await supabase
        .from('recipe_saves')
        .select('recipe_id, recipes(*)')
        .eq('user_id', user.id);

      setRecipes(userRecipes || []);
      setSavedRecipes(saves?.map(save => save.recipes).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {profile?.full_name || 'Recipe Lover'}
                  </h1>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
                <Link to="/settings">
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile?.dietary_preferences?.map((pref) => (
                  <Badge key={pref} variant="secondary">{pref}</Badge>
                ))}
                {profile?.favorite_cuisines?.map((cuisine) => (
                  <Badge key={cuisine} variant="outline">{cuisine}</Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{recipes.length}</div>
                  <div className="text-sm text-muted-foreground">Recipes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{savedRecipes.length}</div>
                  <div className="text-sm text-muted-foreground">Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {recipes.reduce((acc, recipe) => acc + recipe.likes_count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="my-recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-recipes" className="gap-2">
            <BookOpen className="h-4 w-4" />
            My Recipes
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="h-4 w-4" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="cookbooks" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Cookbooks
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-2">
            <Users className="h-4 w-4" />
            Family
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-recipes" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Card key={recipe.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <div className="flex gap-2">
                    {recipe.cuisine_type && (
                      <Badge variant="secondary">{recipe.cuisine_type}</Badge>
                    )}
                    {recipe.difficulty && (
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{recipe.is_public ? 'Public' : 'Private'}</span>
                    <div className="flex gap-4">
                      <span>❤️ {recipe.likes_count}</span>
                      <span>🔖 {recipe.saves_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((recipe) => (
              <Card key={recipe.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <div className="flex gap-2">
                    {recipe.cuisine_type && (
                      <Badge variant="secondary">{recipe.cuisine_type}</Badge>
                    )}
                    {recipe.difficulty && (
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <span>❤️ {recipe.likes_count}</span>
                      <span>🔖 {recipe.saves_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cookbooks" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Cookbooks Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first cookbook to preserve family recipes
                </p>
                <Link to="/cookbook">
                  <Button>Create Cookbook</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Family Groups</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with family members to share recipes and stories
                </p>
                <Button>Create Family Group</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Users, 
  Plus,
  Search,
  Filter,
  ChefHat,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine_type: string;
  difficulty: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  likes_count: number;
  saves_count: number;
  is_public: boolean;
  created_at: string;
  user_id: string;
  story: string;
  dietary_tags: string[];
  // Virtual fields from joins
  profiles?: {
    full_name: string;
    avatar_url: string;
  } | null;
  recipe_comments?: Array<{
    id: string;
    content: string;
    created_at: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    } | null;
  }>;
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchCommunityRecipes();
  }, []);

  const fetchCommunityRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          recipe_comments (
            id,
            content,
            created_at,
            profiles:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecipes(data as any || []);
    } catch (error) {
      console.error('Error fetching community recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load community recipes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (recipeId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('recipe_likes')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('recipe_likes')
          .insert({
            recipe_id: recipeId,
            user_id: user.id
          });
      }

      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { 
              ...recipe, 
              likes_count: existingLike 
                ? recipe.likes_count - 1 
                : recipe.likes_count + 1 
            }
          : recipe
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (recipeId: string) => {
    if (!user) return;

    try {
      // Check if already saved
      const { data: existingSave } = await supabase
        .from('recipe_saves')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .single();

      if (existingSave) {
        // Unsave
        await supabase
          .from('recipe_saves')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id);
        
        toast({ title: "Recipe removed from saved" });
      } else {
        // Save
        await supabase
          .from('recipe_saves')
          .insert({
            recipe_id: recipeId,
            user_id: user.id
          });
        
        toast({ title: "Recipe saved!" });
      }

      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { 
              ...recipe, 
              saves_count: existingSave 
                ? recipe.saves_count - 1 
                : recipe.saves_count + 1 
            }
          : recipe
      ));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleComment = async () => {
    if (!user || !selectedRecipe || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('recipe_comments')
        .insert({
          recipe_id: selectedRecipe.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      toast({ title: "Comment added!" });
      setNewComment('');
      setCommentDialogOpen(false);
      fetchCommunityRecipes(); // Refresh to show new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         recipe.cuisine_type?.toLowerCase() === selectedFilter.toLowerCase() ||
                         recipe.dietary_tags?.some(tag => tag.toLowerCase() === selectedFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Recipes</h1>
        <p className="text-muted-foreground">Discover and share family recipes from around the world</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes, ingredients, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={selectedFilter === 'vegetarian' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('vegetarian')}
            size="sm"
          >
            Vegetarian
          </Button>
          <Button
            variant={selectedFilter === 'italian' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('italian')}
            size="sm"
          >
            Italian
          </Button>
          <Button
            variant={selectedFilter === 'asian' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('asian')}
            size="sm"
          >
            Asian
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Recipe Feed</TabsTrigger>
          <TabsTrigger value="groups">Family Groups</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-orange-400" />
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={recipe.profiles?.avatar_url} />
                        <AvatarFallback>
                          {recipe.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {recipe.profiles?.full_name || 'Anonymous'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
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
                      {recipe.dietary_tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} servings
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(recipe.id)}
                          className="gap-1 h-8 px-2"
                        >
                          <Heart className="h-4 w-4" />
                          {recipe.likes_count}
                        </Button>
                        
                        <Dialog 
                          open={commentDialogOpen && selectedRecipe?.id === recipe.id}
                          onOpenChange={(open) => {
                            setCommentDialogOpen(open);
                            if (open) setSelectedRecipe(recipe);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                              <MessageCircle className="h-4 w-4" />
                              {recipe.recipe_comments?.length || 0}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Comments</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 max-h-60 overflow-y-auto">
                              {recipe.recipe_comments?.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.profiles?.avatar_url} />
                                    <AvatarFallback>
                                      {comment.profiles?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {comment.profiles?.full_name || 'Anonymous'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {comment.content}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="comment">Add a comment</Label>
                              <Textarea
                                id="comment"
                                placeholder="Share your thoughts..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                              />
                              <Button onClick={handleComment} disabled={!newComment.trim()}>
                                Post Comment
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(recipe.id)}
                          className="gap-1 h-8 px-2"
                        >
                          <Bookmark className="h-4 w-4" />
                          {recipe.saves_count}
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Family Groups</h3>
                <p className="text-muted-foreground mb-4">
                  Create or join family groups to share recipes privately
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Family Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Recipe Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Participate in community cooking challenges
                </p>
                <Button>View Current Challenges</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
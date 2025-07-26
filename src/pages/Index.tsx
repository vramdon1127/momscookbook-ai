import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CookingRecorder } from '@/components/CookingRecorder';
import { RecipeProcessor } from '@/components/RecipeProcessor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Heart, 
  Star, 
  Users, 
  BookOpen, 
  Play, 
  ArrowRight,
  Sparkles,
  Gift,
  Crown
} from 'lucide-react';
import heroImage from '@/assets/cooking-hero.jpg';

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  notes: string;
  dateCreated?: string;
  videoUrl?: string;
}

type AppState = 'home' | 'recording' | 'processing';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, setAppState] = useState<AppState>('home');
  const [currentRecording, setCurrentRecording] = useState<any>(null);

  // Check URL path to determine app state
  useEffect(() => {
    if (location.pathname === '/record-recipe') {
      setAppState('recording');
    } else if (location.pathname === '/create-recipe') {
      // Handle create recipe navigation
      navigate('/dashboard');
    } else {
      setAppState('home');
    }
  }, [location.pathname, navigate]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user && appState === 'home') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, appState]);

  const handleRecordingComplete = (recording: any) => {
    setCurrentRecording(recording);
    setAppState('processing');
  };

  const handleRecipeSave = (recipe: Recipe) => {
    // In real app, this would save to Supabase
    navigate('/dashboard');
  };

  const startNewRecording = () => {
    setAppState('recording');
    setCurrentRecording(null);
  };

  const goBackToHome = () => {
    setAppState('home');
    navigate('/');
  };

  const goBackToRecording = () => {
    setAppState('recording');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ChefHat className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  // Recording state
  if (appState === 'recording') {
    return (
      <CookingRecorder
        onRecordingComplete={handleRecordingComplete}
        onBack={goBackToHome}
      />
    );
  }

  // Processing state
  if (appState === 'processing' && currentRecording) {
    return (
      <RecipeProcessor
        recording={currentRecording}
        onSave={handleRecipeSave}
        onNewRecording={startNewRecording}
        onBack={goBackToRecording}
      />
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Recipe Legacy</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Preserve Your Culinary Heritage
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Turn Your Family Recipes Into a 
                  <span className="text-primary"> Lasting Legacy</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Capture cooking videos, preserve family stories, and create beautiful cookbooks that your loved ones will treasure forever.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                  <Play className="w-5 h-5" />
                  Start Your Legacy
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/record-recipe')}>
                  Try Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm text-muted-foreground">Recipes Preserved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">5,000+</p>
                  <p className="text-sm text-muted-foreground">Families Connected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">1,200+</p>
                  <p className="text-sm text-muted-foreground">Cookbooks Created</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Family cooking together"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Grandma's Secret Recipe</p>
                    <p className="text-sm text-muted-foreground">Shared with love</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How Recipe Legacy Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to preserve your family's culinary stories for generations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Record & Share</CardTitle>
                <CardDescription>
                  Capture cooking videos and tell the stories behind your family recipes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Connect Family</CardTitle>
                <CardDescription>
                  Invite family members to contribute their own recipes and stories
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Create Cookbooks</CardTitle>
                <CardDescription>
                  Compile recipes into beautiful printed cookbooks for the whole family
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade for premium features and cookbook printing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-3xl font-bold py-4">$0<span className="text-base text-muted-foreground">/month</span></div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Up to 10 recipes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Basic video recording</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Community access</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-3xl font-bold py-4">$89<span className="text-base text-muted-foreground">/year</span></div>
                <CardDescription>For serious recipe preservers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Unlimited recipes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>HD video & audio recording</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Weekly recipe prompts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Digital cookbook creation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span>Meal planning tools</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  Start Premium Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Don't Let Your Family Recipes Be Lost Forever
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start preserving your culinary heritage today. Your children and grandchildren will thank you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              <Gift className="w-5 h-5" />
              Start Your Legacy
            </Button>
            <Button size="lg" variant="outline">
              Gift a Subscription
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Recipe Legacy</span>
          </div>
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Recipe Legacy. All rights reserved.</p>
            <p className="mt-2">Preserving culinary traditions, one recipe at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

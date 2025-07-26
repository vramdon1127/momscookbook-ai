import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, CreditCard, Palette, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 
  'Low-Carb', 'Low-Sodium', 'Nut-Free', 'Diabetic-Friendly'
];

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 'Japanese', 
  'Thai', 'Greek', 'Mediterranean', 'American', 'Middle Eastern', 'Korean'
];

export default function Settings() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    dietary_preferences: [] as string[],
    favorite_cuisines: [] as string[],
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email_prompts: true,
    email_comments: true,
    email_likes: false,
    push_prompts: true,
    push_comments: true,
    push_likes: false,
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profile_public: true,
    recipes_default_public: false,
    show_saved_recipes: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        dietary_preferences: profile.dietary_preferences || [],
        favorite_cuisines: profile.favorite_cuisines || [],
      });
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDietaryPreference = (preference: string) => {
    if (!formData.dietary_preferences.includes(preference)) {
      setFormData(prev => ({
        ...prev,
        dietary_preferences: [...prev.dietary_preferences, preference]
      }));
    }
  };

  const removeDietaryPreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.filter(p => p !== preference)
    }));
  };

  const addFavoriteCuisine = (cuisine: string) => {
    if (!formData.favorite_cuisines.includes(cuisine)) {
      setFormData(prev => ({
        ...prev,
        favorite_cuisines: [...prev.favorite_cuisines, cuisine]
      }));
    }
  };

  const removeFavoriteCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      favorite_cuisines: prev.favorite_cuisines.filter(c => c !== cuisine)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself and your cooking journey..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.dietary_preferences.map((pref) => (
                    <Badge key={pref} variant="secondary" className="gap-1">
                      {pref}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeDietaryPreference(pref)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addDietaryPreference}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add dietary preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIETARY_OPTIONS.filter(opt => !formData.dietary_preferences.includes(opt))
                      .map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Favorite Cuisines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Favorites</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.favorite_cuisines.map((cuisine) => (
                    <Badge key={cuisine} variant="outline" className="gap-1">
                      {cuisine}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFavoriteCuisine(cuisine)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addFavoriteCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add favorite cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_OPTIONS.filter(opt => !formData.favorite_cuisines.includes(opt))
                      .map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Recipe Prompts</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly prompts to record family recipes</p>
                </div>
                <Switch 
                  checked={notifications.email_prompts}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_prompts: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recipe Comments</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your recipes</p>
                </div>
                <Switch 
                  checked={notifications.email_comments}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_comments: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recipe Likes</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone likes your recipes</p>
                </div>
                <Switch 
                  checked={notifications.email_likes}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_likes: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Allow others to view your profile and shared recipes</p>
                </div>
                <Switch 
                  checked={privacy.profile_public}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profile_public: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default Recipe Visibility</Label>
                  <p className="text-sm text-muted-foreground">Make new recipes public by default</p>
                </div>
                <Switch 
                  checked={privacy.recipes_default_public}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, recipes_default_public: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Saved Recipes</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your saved recipes</p>
                </div>
                <Switch 
                  checked={privacy.show_saved_recipes}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, show_saved_recipes: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-lg font-semibold mb-2">
                  {profile?.subscription_tier === 'free' ? 'Free Plan' : 'Premium Plan'}
                </div>
                <p className="text-muted-foreground mb-4">
                  {profile?.subscription_tier === 'free' 
                    ? 'Upgrade to unlock unlimited recipes and AI features'
                    : 'Enjoy unlimited access to all features'
                  }
                </p>
                {profile?.subscription_tier === 'free' ? (
                  <Button>Upgrade to Premium</Button>
                ) : (
                  <Button variant="outline">Manage Subscription</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
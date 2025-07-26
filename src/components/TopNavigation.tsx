import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChefHat,
  Search,
  Home,
  Calendar,
  Users,
  Book,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Crown,
  Menu,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'recipe' | 'ingredient' | 'cuisine';
}

const TopNavigation = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items for the central area
  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Calendar, label: 'Meal Planner', path: '/meal-planner' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Book, label: 'Cookbooks', path: '/cookbooks' },
  ];

  // Handle search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSearchSuggestions();
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const fetchSearchSuggestions = async () => {
    try {
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id, title')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('is_public', true)
        .limit(5);

      const suggestions: SearchSuggestion[] = (recipes || []).map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        type: 'recipe' as const
      }));

      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-lg font-bold hover:bg-transparent p-0"
              onClick={() => navigate('/dashboard')}
            >
              <ChefHat className="w-8 h-8 text-primary" />
              <span className="hidden sm:block">Recipe Legacy</span>
            </Button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search recipes, ingredients, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 z-50">
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="px-4 py-2 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setSearchQuery(suggestion.title);
                        setShowSuggestions(false);
                        navigate(`/recipe/${suggestion.id}`);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span>{suggestion.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Central Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden xl:block">{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Right Side Elements */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => navigate('/search')}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Premium Upgrade Button */}
            {profile?.subscription_tier === 'free' && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/premium')}
              >
                <Crown className="w-4 h-4" />
                <span className="hidden lg:block">Upgrade</span>
              </Button>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center p-0"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {/* Notification items would go here */}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/help/faq')}>
                  FAQs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help/tutorials')}>
                  Tutorials
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help/support')}>
                  Contact Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-primary" />
                    Recipe Legacy
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={isActivePath(item.path) ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {/* Mobile Premium Upgrade */}
                  {profile?.subscription_tier === 'free' && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        navigate('/premium');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
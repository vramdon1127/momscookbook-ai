import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Users, Search, Calendar, ChefHat, Play, BookOpen, ShoppingCart } from 'lucide-react';

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

interface RecipeLibraryProps {
  recipes: Recipe[];
  onNewRecording: () => void;
}

export const RecipeLibrary = ({ recipes, onNewRecording }: RecipeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (recipes.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center space-y-8">
          <div className="space-y-3">
            <ChefHat className="w-8 h-8 text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Recipe Collection</h2>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              Build your recipe collection by recording cooking processes
            </p>
          </div>
          
          <Card className="p-8 bg-muted/30 max-w-sm mx-auto border">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium">Get Started</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Record cooking processes and transform them into structured recipes
                </p>
              </div>
              <Button onClick={onNewRecording} variant="default" className="w-full">
                Start Recording
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setSelectedRecipe(null)} variant="ghost">
            ← Back to Library
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {selectedRecipe.dateCreated ? new Date(selectedRecipe.dateCreated).toLocaleDateString() : 'No date'}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Recipe Header */}
          <Card className="p-6 bg-muted/20 border">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">{selectedRecipe.title}</h1>
              <p className="text-muted-foreground">{selectedRecipe.description}</p>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Prep: {selectedRecipe.prepTime}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Cook: {selectedRecipe.cookTime}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Serves: {selectedRecipe.servings}
                </Badge>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ingredients */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-3">
                {selectedRecipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Video Section */}
          {selectedRecipe.videoUrl && (
            <Card className="p-6 border">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Cooking Video
              </h2>
              <div className="aspect-video bg-muted/20 rounded-lg overflow-hidden">
                <video
                  src={selectedRecipe.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            </Card>
          )}

          {/* Notes */}
          {selectedRecipe.notes && (
            <Card className="p-6 bg-muted/30 border">
              <h2 className="text-lg font-medium mb-4">
                Notes
              </h2>
              <p className="leading-relaxed text-muted-foreground">{selectedRecipe.notes}</p>
            </Card>
          )}

          {/* Cookbook Options */}
          <Card className="p-6 bg-muted/20 border">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Share This Recipe</h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add this recipe to a family cookbook or order printed copies for loved ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Add to Cookbook
                </Button>
                <Button variant="outline">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Order Copies
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recipe Collection</h2>
          <p className="text-muted-foreground">{recipes.length} family recipes preserved</p>
        </div>
        <Button onClick={onNewRecording} variant="default">
          <ChefHat className="w-4 h-4 mr-2" />
          New Recipe
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recipe Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe, index) => (
          <Card 
            key={index}
            className="p-6 hover:shadow-medium transition-all duration-200 cursor-pointer group border"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {recipe.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {recipe.prepTime}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {recipe.servings}
                </Badge>
                {recipe.videoUrl && (
                  <Badge variant="outline" className="text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">
            Try searching for different ingredients or recipe names
          </p>
        </div>
      )}

      {/* Cookbook Creation */}
      {recipes.length > 0 && (
        <Card className="p-8 bg-muted/20 border mt-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Create Your Family Cookbook</h3>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Transform your recipe collection into a beautiful printed cookbook. Perfect for preserving family traditions and sharing with loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Create Cookbook ({recipes.length} recipes)
              </Button>
              <Button variant="outline" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Printed Copies
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
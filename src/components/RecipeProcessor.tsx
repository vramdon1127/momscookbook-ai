import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Brain, Download, Save, Clock, Users, Sparkles } from 'lucide-react';

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  notes: string;
}

interface RecipeProcessorProps {
  recording: {
    videoBlob: Blob;
    duration: number;
    timestamp: string;
  };
  onSave: (recipe: Recipe) => void;
  onNewRecording: () => void;
  onBack: () => void;
}

export const RecipeProcessor = ({ recording, onSave, onNewRecording, onBack }: RecipeProcessorProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipe, setRecipe] = useState<Recipe>({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    prepTime: '',
    cookTime: '',
    servings: '',
    notes: ''
  });
  const [manualMode, setManualMode] = useState(false);

  // Simulated AI processing - In real implementation, this would call actual AI services
  const processRecording = async () => {
    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI-generated recipe
    const mockRecipe: Recipe = {
      title: "Mom's Special Pasta Sauce",
      description: "A family recipe passed down through generations, rich with love and tradition.",
      ingredients: [
        "2 lbs fresh tomatoes, diced",
        "1 large onion, finely chopped", 
        "4 cloves garlic, minced",
        "2 tbsp olive oil",
        "1 tsp dried basil",
        "1/2 tsp dried oregano",
        "Salt and pepper to taste",
        "1 bay leaf",
        "2 tbsp tomato paste"
      ],
      instructions: [
        "Heat olive oil in a large pan over medium heat",
        "Add chopped onions and cook until translucent, about 5 minutes",
        "Add minced garlic and cook for another minute until fragrant",
        "Add diced tomatoes and tomato paste, stir well",
        "Season with basil, oregano, salt, pepper, and add bay leaf",
        "Reduce heat to low and simmer for 30-45 minutes, stirring occasionally",
        "Remove bay leaf before serving",
        "Taste and adjust seasoning as needed"
      ],
      prepTime: "15 minutes",
      cookTime: "45 minutes", 
      servings: "4-6 people",
      notes: "Mom always says the secret is to let it simmer slowly and taste frequently. She adds a pinch of sugar if the tomatoes are too acidic."
    };
    
    setRecipe(mockRecipe);
    setIsProcessing(false);
    
    toast({
      title: "Recipe Extracted",
      description: "AI has analyzed the video and extracted the recipe",
    });
  };

  const handleSave = () => {
    onSave(recipe);
    toast({
      title: "Recipe Saved",
      description: "Recipe has been saved to your collection",
    });
  };

  const downloadRecipe = () => {
    const recipeText = `
${recipe.title}

${recipe.description}

INGREDIENTS:
${recipe.ingredients.map(ing => `• ${ing}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')}

DETAILS:
• Prep Time: ${recipe.prepTime}
• Cook Time: ${recipe.cookTime}
• Servings: ${recipe.servings}

NOTES:
${recipe.notes}

Recorded on: ${new Date(recording.timestamp).toLocaleDateString()}
Duration: ${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}
    `.trim();

    const blob = new Blob([recipeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="flex items-center gap-2">
          ← Back to Recording
        </Button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Recipe Processing</h2>
        <p className="text-muted-foreground">
          Recording captured: {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')} minutes
        </p>
      </div>

      {/* Processing Status */}
      {!recipe.title && !manualMode && (
        <Card className="p-8 text-center bg-muted/20 border">
          {!isProcessing ? (
            <div className="space-y-4">
              <Brain className="w-16 h-16 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Extract Recipe</h3>
                <p className="text-muted-foreground mb-4">
                  AI will analyze the video and audio to create a detailed recipe. You can edit everything afterward.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={processRecording} variant="default" size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Extract Recipe with AI
                  </Button>
                  <Button onClick={() => setManualMode(true)} variant="outline">
                    Create Recipe Manually
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Processing Recording...</h3>
                <p className="text-muted-foreground">
                  Analyzing video and audio to extract ingredients and instructions
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recipe Editor */}
      {(recipe.title || manualMode) && (
        <div className="space-y-6">
          {/* Edit Header */}
          <div className="text-center pb-4 border-b">
            <h3 className="text-lg font-semibold">Edit & Refine Your Recipe</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review and modify the AI-generated recipe as needed
            </p>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Recipe Title</label>
                <Input
                  value={recipe.title}
                  onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter recipe name..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={recipe.description}
                  onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this recipe..."
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Prep Time
                  </label>
                  <Input
                    value={recipe.prepTime}
                    onChange={(e) => setRecipe(prev => ({ ...prev, prepTime: e.target.value }))}
                    placeholder="15 minutes"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Cook Time
                  </label>
                  <Input
                    value={recipe.cookTime}
                    onChange={(e) => setRecipe(prev => ({ ...prev, cookTime: e.target.value }))}
                    placeholder="30 minutes"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Servings
                  </label>
                  <Input
                    value={recipe.servings}
                    onChange={(e) => setRecipe(prev => ({ ...prev, servings: e.target.value }))}
                    placeholder="4 people"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ingredients */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
              <p className="text-xs text-muted-foreground mb-3">Enter each ingredient on a new line</p>
              <Textarea
                value={recipe.ingredients.join('\n')}
                onChange={(e) => setRecipe(prev => ({ 
                  ...prev, 
                  ingredients: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                placeholder="2 lbs fresh tomatoes, diced&#10;1 large onion, finely chopped&#10;4 cloves garlic, minced..."
                className="min-h-[200px]"
              />
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Instructions</h3>
              <p className="text-xs text-muted-foreground mb-3">Enter each step on a new line</p>
              <Textarea
                value={recipe.instructions.join('\n')}
                onChange={(e) => setRecipe(prev => ({ 
                  ...prev, 
                  instructions: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                placeholder="Heat olive oil in a large pan over medium heat&#10;Add chopped onions and cook until translucent..."
                className="min-h-[200px]"
              />
            </Card>
          </div>

          {/* Notes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Special Notes & Tips</h3>
            <p className="text-xs text-muted-foreground mb-3">Add any special tips, stories, or variations</p>
            <Textarea
              value={recipe.notes}
              onChange={(e) => setRecipe(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special tips, family secrets, or variations..."
              className="min-h-[100px]"
            />
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
            <Button onClick={handleSave} variant="default" size="lg" className="min-w-32">
              <Save className="w-5 h-5 mr-2" />
              Save Recipe
            </Button>
            <Button onClick={downloadRecipe} variant="outline" size="lg" className="min-w-32">
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>
            <Button onClick={onNewRecording} variant="ghost" className="min-w-32">
              New Recording
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
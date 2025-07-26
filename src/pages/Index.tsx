import { useState } from 'react';
import { CookingRecorder } from '@/components/CookingRecorder';
import { RecipeProcessor } from '@/components/RecipeProcessor';
import { RecipeLibrary } from '@/components/RecipeLibrary';

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
}

type AppState = 'library' | 'recording' | 'processing';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('library');
  const [currentRecording, setCurrentRecording] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleRecordingComplete = (recording: any) => {
    setCurrentRecording(recording);
    setAppState('processing');
  };

  const handleRecipeSave = (recipe: Recipe) => {
    const recipeWithDate = {
      ...recipe,
      dateCreated: new Date().toISOString()
    };
    setRecipes(prev => [recipeWithDate, ...prev]);
    setAppState('library');
    setCurrentRecording(null);
  };

  const startNewRecording = () => {
    setAppState('recording');
    setCurrentRecording(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {appState === 'library' && (
        <RecipeLibrary
          recipes={recipes}
          onNewRecording={startNewRecording}
        />
      )}
      
      {appState === 'recording' && (
        <CookingRecorder
          onRecordingComplete={handleRecordingComplete}
        />
      )}
      
      {appState === 'processing' && currentRecording && (
        <RecipeProcessor
          recording={currentRecording}
          onSave={handleRecipeSave}
          onNewRecording={startNewRecording}
        />
      )}
    </div>
  );
};

export default Index;

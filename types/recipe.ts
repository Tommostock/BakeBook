export interface Recipe {
  id: string;
  title: string;
  category: RecipeCategory;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number;
  bakeTime: number;
  totalTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  imageUrl: string;
  tips?: string;
  dietaryTags?: string[];
  isFeatured?: boolean;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
}

export type RecipeCategory =
  | 'Bread'
  | 'Cakes'
  | 'Cookies'
  | 'Pastries'
  | 'Pies'
  | 'Breakfast Bakes'
  | 'Savory Bakes'
  | 'Desserts'
  | 'Quick Breads'
  | 'Holiday Bakes';

export interface JournalEntry {
  id: string;
  recipeId: string;
  recipeTitle: string;
  photoUri?: string;
  notes: string;
  rating: number;
  dateBaked: string;
  createdAt: string;
}

export interface RecipeNote {
  id: string;
  recipeId: string;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

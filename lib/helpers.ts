import type { Recipe, RecipeCategory } from '../types/recipe';

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function searchRecipes(
  recipes: Recipe[],
  query: string,
  category?: string | null,
  difficulty?: string | null
): Recipe[] {
  let filtered = [...recipes];

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
        (r.dietaryTags?.some((t) => t.toLowerCase().includes(q)) ?? false)
    );
  }

  if (category) {
    filtered = filtered.filter((r) => r.category === category);
  }

  if (difficulty) {
    filtered = filtered.filter((r) => r.difficulty === difficulty);
  }

  return filtered;
}

export const CATEGORIES: RecipeCategory[] = [
  'Bread',
  'Cakes',
  'Cookies',
  'Pastries',
  'Pies',
  'Breakfast Bakes',
  'Savory Bakes',
  'Desserts',
  'Quick Breads',
  'Holiday Bakes',
];

export const CATEGORY_EMOJIS: Record<RecipeCategory, string> = {
  Bread: '🍞',
  Cakes: '🎂',
  Cookies: '🍪',
  Pastries: '🥐',
  Pies: '🥧',
  'Breakfast Bakes': '🧇',
  'Savory Bakes': '🧀',
  Desserts: '🍰',
  'Quick Breads': '🍌',
  'Holiday Bakes': '🎄',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#4CAF50',
  Medium: '#FF9800',
  Hard: '#E53935',
};

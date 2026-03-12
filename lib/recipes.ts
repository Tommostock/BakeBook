import { useMemo } from 'react';
import { recipes as builtInRecipes } from '../data/recipes';
import { useAppStore } from './store';
import type { Recipe } from '../types/recipe';

/**
 * Returns all recipes: user-created (tagged with isUserRecipe) first,
 * then built-in recipes. Memoised so it only recalculates when
 * userRecipes changes.
 */
export function useAllRecipes(): Recipe[] {
  const userRecipes = useAppStore((s) => s.userRecipes);
  return useMemo(() => {
    const tagged = userRecipes.map((r) => ({ ...r, isUserRecipe: true as const }));
    return [...tagged, ...builtInRecipes];
  }, [userRecipes]);
}

/** Check if a recipe ID belongs to a user-created recipe. */
export function isUserRecipe(id: string): boolean {
  return id.startsWith('user-');
}

import { useMemo } from 'react';
import { recipes as builtInRecipes } from '../data/recipes';
import { RECIPE_TAGS } from '../data/recipeTags';
import { useAppStore } from './store';
import type { Recipe } from '../types/recipe';

/** Built-in recipes with flavour & season tags merged in (computed once). */
const taggedBuiltInRecipes: Recipe[] = builtInRecipes.map((r) => {
  const tags = RECIPE_TAGS[r.id];
  if (!tags) return r;
  return {
    ...r,
    flavourTags: tags.flavourTags.length > 0 ? tags.flavourTags : r.flavourTags,
    seasonTags: tags.seasonTags.length > 0 ? tags.seasonTags : r.seasonTags,
  };
});

/**
 * Returns all recipes: user-created (tagged with isUserRecipe) first,
 * then built-in recipes. Memoised so it only recalculates when
 * userRecipes changes.
 */
export function useAllRecipes(): Recipe[] {
  const userRecipes = useAppStore((s) => s.userRecipes);
  return useMemo(() => {
    const tagged = userRecipes.map((r) => ({ ...r, isUserRecipe: true as const }));
    return [...tagged, ...taggedBuiltInRecipes];
  }, [userRecipes]);
}

/** Check if a recipe ID belongs to a user-created recipe. */
export function isUserRecipe(id: string): boolean {
  return id.startsWith('user-');
}

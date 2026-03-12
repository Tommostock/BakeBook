import type { Recipe } from '../types/recipe';
import { formatTime } from './helpers';

/**
 * Short share format — title, description, time and difficulty.
 */
export function formatRecipeShareShort(recipe: Recipe): string {
  return [
    `🧁 Suzie's BakeBook: ${recipe.title}`,
    '',
    recipe.description,
    '',
    `⏱ Prep: ${formatTime(recipe.prepTime)} | 🔥 Bake: ${formatTime(recipe.bakeTime)} | 🍽 Serves: ${recipe.servings}`,
    `📊 Difficulty: ${recipe.difficulty}`,
    '',
    `Made with Suzie's BakeBook 💕`,
  ].join('\n');
}

/**
 * Full share format — includes ingredients and steps.
 */
export function formatRecipeShareFull(recipe: Recipe): string {
  const ingredients = recipe.ingredients
    .map((i) => `• ${i.amount}${i.unit ? ` ${i.unit}` : ''} ${i.name}`)
    .join('\n');

  const steps = recipe.steps
    .map((s, idx) => `${idx + 1}. ${s}`)
    .join('\n');

  const parts = [
    `🧁 Suzie's BakeBook: ${recipe.title}`,
    '',
    recipe.description,
    '',
    `⏱ Prep: ${formatTime(recipe.prepTime)} | 🔥 Bake: ${formatTime(recipe.bakeTime)} | 🍽 Serves: ${recipe.servings}`,
    `📊 Difficulty: ${recipe.difficulty}`,
  ];

  if (recipe.dietaryTags?.length) {
    parts.push(`🏷 ${recipe.dietaryTags.join(', ')}`);
  }

  parts.push('', '📝 Ingredients:', ingredients);
  parts.push('', '👩‍🍳 Steps:', steps);

  if (recipe.tips) {
    parts.push('', `💡 Tips: ${recipe.tips}`);
  }

  parts.push('', 'Made with Suzie\'s BakeBook 💕');

  return parts.join('\n');
}

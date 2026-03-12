import type { Recipe } from '../types/recipe';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const SEASON_CONFIG: Record<Season, { label: string; emoji: string }> = {
  spring: { label: 'Perfect for Spring', emoji: '🌸' },
  summer: { label: 'Summer Favourites', emoji: '☀️' },
  autumn: { label: 'Autumn Baking', emoji: '🍂' },
  winter: { label: 'Winter Warmers', emoji: '❄️' },
};

// UK-centric season mapping by recipe ID
const SEASONAL_RECIPE_IDS: Record<Season, string[]> = {
  spring: [
    'holiday-006', // Hot Cross Buns
    'holiday-007', // Simnel Cake
    'holiday-010', // Easter Biscuits
    'cake-004',    // Lemon Drizzle Cake
    'breakfast-003', // Classic Scones
    'quick-009',   // Lemon Poppy Seed Loaf
    'dessert-010', // Lemon Posset
  ],
  summer: [
    'pastry-007', // French Fruit Tart
    'dessert-002', // Vanilla Panna Cotta
    'pie-011',    // Key Lime Pie
    'cake-009',   // Strawberry Sponge
    'dessert-006', // Eton Mess
    'breakfast-003', // Classic Scones
    'quick-003',  // Blueberry Muffins
  ],
  autumn: [
    'pie-001',    // Classic Apple Pie
    'pie-009',    // Pumpkin Pie
    'dessert-009', // Apple Crumble
    'quick-008',  // Yorkshire Parkin
    'quick-006',  // Date & Walnut Loaf
    'bread-001',  // Sourdough Loaf
    'pie-003',    // Treacle Tart
  ],
  winter: [
    'holiday-001', // Gingerbread
    'holiday-002', // Mince Pies
    'holiday-003', // Christmas Pudding
    'holiday-004', // Stollen
    'holiday-005', // Yule Log
    'holiday-008', // Panettone
    'holiday-009', // Lebkuchen
    'holiday-011', // Dundee Cake
  ],
};

/**
 * Get the current season based on the month (UK seasons).
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Get the display label for a season (e.g. "Perfect for Spring").
 */
export function getSeasonalLabel(season: Season): string {
  return SEASON_CONFIG[season].label;
}

/**
 * Get the emoji for a season.
 */
export function getSeasonalEmoji(season: Season): string {
  return SEASON_CONFIG[season].emoji;
}

/**
 * Filter recipes to those tagged for the given season.
 */
export function getSeasonalRecipes(allRecipes: Recipe[], season?: Season): Recipe[] {
  const s = season ?? getCurrentSeason();
  const ids = new Set(SEASONAL_RECIPE_IDS[s]);
  return allRecipes.filter((r) => ids.has(r.id));
}

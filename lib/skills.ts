import type { JournalEntry, Recipe, RecipeCategory } from '../types/recipe';

// ── Badge tiers ──────────────────────────────────────────────

export interface Badge {
  name: string;
  emoji: string;
  threshold: number;
}

const BADGE_TIERS: Badge[] = [
  { name: 'Beginner', emoji: '🥄', threshold: 1 },
  { name: 'Apprentice', emoji: '🧁', threshold: 3 },
  { name: 'Baker', emoji: '👩‍🍳', threshold: 5 },
  { name: 'Expert', emoji: '⭐', threshold: 10 },
  { name: 'Master', emoji: '🏆', threshold: 15 },
];

export function getBadgeForCount(count: number): Badge | null {
  let badge: Badge | null = null;
  for (const tier of BADGE_TIERS) {
    if (count >= tier.threshold) badge = tier;
  }
  return badge;
}

export function getNextBadge(count: number): Badge | null {
  for (const tier of BADGE_TIERS) {
    if (count < tier.threshold) return tier;
  }
  return null; // maxed out
}

// ── Skill stat shape ─────────────────────────────────────────

export interface SkillStat {
  count: number;
  badge: Badge | null;
  nextBadge: Badge | null;
  recipesNeeded: number; // 0 if maxed
}

export interface SkillStats {
  byCategory: Partial<Record<RecipeCategory, SkillStat>>;
  byDifficulty: Record<string, SkillStat>;
  totalBakes: number;
  uniqueRecipesBaked: number;
  averageRating: number;
}

// ── Compute all stats ────────────────────────────────────────

export function computeSkillStats(
  journalEntries: JournalEntry[],
  allRecipes: Recipe[]
): SkillStats {
  const recipeMap = new Map<string, Recipe>();
  for (const r of allRecipes) recipeMap.set(r.id, r);

  const categoryCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  const uniqueIds = new Set<string>();
  let ratingSum = 0;
  let ratingCount = 0;

  for (const entry of journalEntries) {
    const recipe = recipeMap.get(entry.recipeId);
    if (recipe) {
      categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
      difficultyCounts[recipe.difficulty] = (difficultyCounts[recipe.difficulty] || 0) + 1;
      uniqueIds.add(recipe.id);
    }
    if (entry.rating > 0) {
      ratingSum += entry.rating;
      ratingCount++;
    }
  }

  const makeStat = (count: number): SkillStat => {
    const badge = getBadgeForCount(count);
    const nextBadge = getNextBadge(count);
    return {
      count,
      badge,
      nextBadge,
      recipesNeeded: nextBadge ? nextBadge.threshold - count : 0,
    };
  };

  const byCategory: Partial<Record<RecipeCategory, SkillStat>> = {};
  for (const [cat, count] of Object.entries(categoryCounts)) {
    byCategory[cat as RecipeCategory] = makeStat(count);
  }

  const byDifficulty: Record<string, SkillStat> = {};
  for (const diff of ['Easy', 'Medium', 'Hard']) {
    byDifficulty[diff] = makeStat(difficultyCounts[diff] || 0);
  }

  return {
    byCategory,
    byDifficulty,
    totalBakes: journalEntries.length,
    uniqueRecipesBaked: uniqueIds.size,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
  };
}

// ── Special milestone achievements ───────────────────────────

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
}

export function computeAchievements(
  journalEntries: JournalEntry[],
  allRecipes: Recipe[]
): Achievement[] {
  const recipeMap = new Map<string, Recipe>();
  for (const r of allRecipes) recipeMap.set(r.id, r);

  const categoriesUsed = new Set<string>();
  let photoBakes = 0;
  let fiveStarBakes = 0;
  let noteBakes = 0;

  for (const entry of journalEntries) {
    const recipe = recipeMap.get(entry.recipeId);
    if (recipe) categoriesUsed.add(recipe.category);
    if ((entry.photos?.length ?? 0) > 0 || entry.photoUri) photoBakes++;
    if (entry.rating === 5) fiveStarBakes++;
    if (entry.notes?.trim()) noteBakes++;
  }

  return [
    {
      id: 'first-bake',
      name: 'First Bake',
      emoji: '🎯',
      description: 'Complete your first bake',
      earned: journalEntries.length >= 1,
    },
    {
      id: 'shutterbug',
      name: 'Shutterbug',
      emoji: '📸',
      description: 'Add photos to 5 bakes',
      earned: photoBakes >= 5,
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      emoji: '🌟',
      description: 'Rate 3 bakes with 5 stars',
      earned: fiveStarBakes >= 3,
    },
    {
      id: 'explorer',
      name: 'Explorer',
      emoji: '🗂',
      description: 'Bake from 5 different categories',
      earned: categoriesUsed.size >= 5,
    },
    {
      id: 'storyteller',
      name: 'Storyteller',
      emoji: '📝',
      description: 'Add notes to 10 bakes',
      earned: noteBakes >= 10,
    },
  ];
}

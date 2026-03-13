// Baker Level System (#39)
// XP is earned from journal entries, unique recipes, achievements, and ratings

import type { JournalEntry, Recipe } from '../types/recipe';
import type { Achievement } from './skills';

export interface BakerLevel {
  level: number;
  title: string;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  progress: number; // 0-1
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Kitchen Curious',
  2: 'Flour Duster',
  3: 'Mixing Bowl Pro',
  4: 'Oven Watcher',
  5: 'Rising Star',
  6: 'Whisk Wizard',
  7: 'Dough Whisperer',
  8: 'Pastry Artisan',
  9: 'Sugar Sculptor',
  10: 'Master Baker',
  11: 'Baking Legend',
  12: 'Patisserie Royale',
};

function getTitleForLevel(level: number): string {
  if (level >= 12) return LEVEL_TITLES[12];
  return LEVEL_TITLES[level] || `Baker Lv.${level}`;
}

function xpRequiredForLevel(level: number): number {
  // Each level requires progressively more XP
  return Math.floor(50 * Math.pow(1.4, level - 1));
}

export function computeBakerLevel(
  journalEntries: JournalEntry[],
  allRecipes: Recipe[],
  achievements: Achievement[]
): BakerLevel {
  // Calculate total XP
  let totalXP = 0;

  // XP from bakes: 10 XP each
  totalXP += journalEntries.length * 10;

  // Bonus XP for unique recipes: 5 XP each
  const uniqueRecipes = new Set(journalEntries.map((e) => e.recipeId));
  totalXP += uniqueRecipes.size * 5;

  // XP from ratings: rating * 2
  for (const entry of journalEntries) {
    if (entry.rating > 0) totalXP += entry.rating * 2;
  }

  // XP from photos: 3 XP each bake with photos
  for (const entry of journalEntries) {
    if ((entry.photos?.length ?? 0) > 0 || entry.photoUri) totalXP += 3;
  }

  // XP from notes: 2 XP each bake with notes
  for (const entry of journalEntries) {
    if (entry.notes?.trim()) totalXP += 2;
  }

  // XP from achievements: 25 XP each
  const earnedAchievements = achievements.filter((a) => a.earned);
  totalXP += earnedAchievements.length * 25;

  // Determine level from total XP
  let level = 1;
  let xpConsumed = 0;

  while (level < 50) {
    const required = xpRequiredForLevel(level);
    if (xpConsumed + required > totalXP) break;
    xpConsumed += required;
    level++;
  }

  const xpForNextLevel = xpRequiredForLevel(level);
  const currentXP = totalXP - xpConsumed;
  const progress = Math.min(currentXP / xpForNextLevel, 1);

  return {
    level,
    title: getTitleForLevel(level),
    currentXP,
    xpForNextLevel,
    totalXP,
    progress,
  };
}

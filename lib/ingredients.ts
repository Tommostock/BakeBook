import type { Ingredient } from '../types/recipe';

// Common fraction mappings for display
const FRACTION_MAP: Record<string, string> = {
  '0.25': '¼',
  '0.33': '⅓',
  '0.5': '½',
  '0.67': '⅔',
  '0.75': '¾',
};

/**
 * Parse a string amount into a number.
 * Handles: integers ("500"), decimals ("1.5", "0.25"), fractions ("1/2"),
 * mixed numbers ("1 1/2"), ranges ("2-3" → midpoint 2.5).
 * Returns null for non-numeric values ("to taste", "a pinch", etc.).
 */
export function parseAmount(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  // Range: "6-8" → average
  if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(s)) {
    const [lo, hi] = s.split('-').map((p) => parseFloat(p.trim()));
    if (!isNaN(lo) && !isNaN(hi)) return (lo + hi) / 2;
  }

  // Mixed number: "1 1/2"
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den !== 0) return whole + num / den;
  }

  // Pure fraction: "1/2", "3/4"
  const fracMatch = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) return num / den;
  }

  // Plain number: "500", "1.5", "0.25"
  const n = parseFloat(s);
  if (!isNaN(n)) return n;

  // Non-numeric: "to taste", "a pinch", etc.
  return null;
}

/**
 * Format a number back into a friendly display string.
 * Converts 0.5 → "½", 1.5 → "1 ½", etc.
 * Rounds to 2 decimal places to avoid floating-point artefacts.
 */
export function formatAmount(value: number): string {
  if (value <= 0) return '0';

  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 100) / 100;

  if (frac === 0) return whole.toString();

  const fracKey = frac.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  const fracStr = FRACTION_MAP[fracKey];

  if (fracStr) {
    return whole > 0 ? `${whole} ${fracStr}` : fracStr;
  }

  // No nice fraction — display as decimal
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

/**
 * Scale a single ingredient's amount from originalServings to newServings.
 * Returns a new Ingredient with the scaled amount string.
 * Non-numeric amounts (e.g. "to taste") are returned unchanged.
 */
export function scaleIngredient(
  ingredient: Ingredient,
  originalServings: number,
  newServings: number
): Ingredient {
  if (originalServings === newServings || originalServings === 0) {
    return ingredient;
  }

  const parsed = parseAmount(ingredient.amount);
  if (parsed === null) {
    return ingredient; // "to taste", "a pinch" — can't scale
  }

  const ratio = newServings / originalServings;
  const scaled = parsed * ratio;
  return { ...ingredient, amount: formatAmount(scaled) };
}

/**
 * Scale all ingredients for a recipe.
 */
export function scaleAllIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  newServings: number
): Ingredient[] {
  return ingredients.map((ing) =>
    scaleIngredient(ing, originalServings, newServings)
  );
}

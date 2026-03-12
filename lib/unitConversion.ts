import type { Ingredient } from '../types/recipe';
import { parseAmount, formatAmount } from './ingredients';

export type UnitSystem = 'metric' | 'imperial';

interface ConversionRule {
  from: string;
  to: string;
  factor: number;
}

// Metric → Imperial conversions
const METRIC_TO_IMPERIAL: ConversionRule[] = [
  { from: 'g', to: 'oz', factor: 1 / 28.35 },
  { from: 'kg', to: 'lb', factor: 2.205 },
  { from: 'ml', to: 'fl oz', factor: 1 / 29.574 },
  { from: 'l', to: 'cups', factor: 4.227 },
];

// Imperial → Metric conversions (inverse)
const IMPERIAL_TO_METRIC: ConversionRule[] = METRIC_TO_IMPERIAL.map((r) => ({
  from: r.to,
  to: r.from,
  factor: 1 / r.factor,
}));

// Units that stay the same in both systems
const UNIVERSAL_UNITS = new Set([
  'tsp', 'tbsp', 'large', 'medium', 'small',
  'pinch', 'bunch', 'handful', 'clove', 'cloves',
  'stick', 'sticks', 'sheet', 'sheets', 'slice', 'slices',
  'piece', 'pieces', 'sprig', 'sprigs', 'drop', 'drops',
]);

/**
 * Detect whether a unit is metric or imperial.
 */
function detectUnitSystem(unit: string): 'metric' | 'imperial' | 'universal' {
  const u = unit.toLowerCase().trim();
  if (UNIVERSAL_UNITS.has(u)) return 'universal';
  if (METRIC_TO_IMPERIAL.some((r) => r.from === u)) return 'metric';
  if (IMPERIAL_TO_METRIC.some((r) => r.from === u)) return 'imperial';
  return 'universal';
}

/**
 * Find the conversion rule for a given unit to a target system.
 */
function findConversion(unit: string, targetSystem: UnitSystem): ConversionRule | null {
  const u = unit.toLowerCase().trim();
  const rules = targetSystem === 'imperial' ? METRIC_TO_IMPERIAL : IMPERIAL_TO_METRIC;
  return rules.find((r) => r.from === u) || null;
}

/**
 * Convert a single ingredient to the target unit system.
 * Returns unchanged ingredient if:
 * - No unit specified
 * - Unit is universal (tsp, tbsp, etc.)
 * - Unit is already in the target system
 * - Amount is non-numeric
 */
export function convertIngredient(
  ingredient: Ingredient,
  targetSystem: UnitSystem
): Ingredient {
  if (!ingredient.unit) return ingredient;

  const unitSystem = detectUnitSystem(ingredient.unit);
  if (unitSystem === 'universal') return ingredient;
  if (unitSystem === targetSystem) return ingredient;

  const rule = findConversion(ingredient.unit, targetSystem);
  if (!rule) return ingredient;

  const parsed = parseAmount(ingredient.amount);
  if (parsed === null) return ingredient;

  const converted = parsed * rule.factor;
  return {
    ...ingredient,
    amount: formatAmount(converted),
    unit: rule.to,
  };
}

/**
 * Convert all ingredients to the target unit system.
 */
export function convertAllIngredients(
  ingredients: Ingredient[],
  targetSystem: UnitSystem
): Ingredient[] {
  return ingredients.map((ing) => convertIngredient(ing, targetSystem));
}

/**
 * Convert a temperature value between Celsius and Fahrenheit.
 */
export function convertTemperature(value: number, to: 'C' | 'F'): number {
  if (to === 'F') return Math.round(value * 9 / 5 + 32);
  return Math.round((value - 32) * 5 / 9);
}

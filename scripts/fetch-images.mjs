#!/usr/bin/env node

/**
 * Fetch accurate food images for BakeBook recipes.
 *
 * Strategy (waterfall):
 *   1. TheMealDB — search by recipe title (free, no key needed)
 *   2. If no match, try simplified/alternative search terms
 *   3. Report unmatched recipes for manual review
 *
 * Usage:  node scripts/fetch-images.mjs
 * Output: scripts/image-map.json  (recipeId → imageUrl)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECIPES_PATH = path.join(__dirname, '..', 'data', 'recipes.ts');

// ── Extract recipe id + title from recipes.ts ───────────────────────────
function extractRecipes(src) {
  const recipes = [];
  const idRe = /id:\s*'([^']+)'/g;
  const titleRe = /title:\s*'([^']+)'/g;

  const ids = [...src.matchAll(idRe)].map((m) => m[1]);
  const titles = [...src.matchAll(titleRe)].map((m) => m[1]);

  for (let i = 0; i < ids.length; i++) {
    recipes.push({ id: ids[i], title: titles[i] });
  }
  return recipes;
}

// ── TheMealDB search ────────────────────────────────────────────────────
async function searchMealDB(query) {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      return {
        name: data.meals[0].strMeal,
        image: data.meals[0].strMealThumb,
      };
    }
  } catch (e) {
    // silent
  }
  return null;
}

// ── Generate search variants for a recipe title ─────────────────────────
function getSearchTerms(title) {
  const terms = [title];

  // Remove "Classic ", "Homemade ", "Traditional ", "French " prefixes
  const stripped = title
    .replace(/^(Classic|Homemade|Traditional|French|British|English|Welsh|Portuguese|Irish)\s+/i, '');
  if (stripped !== title) terms.push(stripped);

  // Try just the main noun (last word or two)
  const words = title.split(/\s+/);
  if (words.length > 2) {
    terms.push(words.slice(-2).join(' '));
    terms.push(words.slice(-1).join(' '));
  }

  // Common alternative names
  const aliases = {
    'Butter Croissants': ['Croissant'],
    'Chocolate Chip Cookies': ['Chocolate Chip Cookie'],
    'Cheese & Onion Quiche': ['Quiche Lorraine', 'Quiche'],
    'Cinnamon Rolls': ['Cinnamon Roll'],
    'Victoria Sponge': ['Victoria Sponge Cake'],
    'Lemon Drizzle Cake': ['Lemon Cake'],
    'Oatmeal Raisin Cookies': ['Oatmeal Cookie'],
    'Pain au Chocolat': ['Chocolate Croissant'],
    'Chocolate Éclairs': ['Eclair', 'Chocolate Eclair'],
    'Portuguese Custard Tarts': ['Pasteis de Nata', 'Pastel de Nata'],
    'Banoffee Pie': ['Banoffee'],
    'Chicken & Mushroom Pie': ['Chicken Pie'],
    'Blueberry Muffins': ['Blueberry Muffin'],
    'Classic Scones': ['Scone'],
    'Homemade Crumpets': ['Crumpet', 'Crumpets'],
    'Pork Sausage Rolls': ['Sausage Roll'],
    'Spinach & Feta Filo Pie': ['Spanakopita'],
    'Cheese Scones': ['Cheese Scone'],
    'Cornish Pasties': ['Cornish Pasty'],
    'Vanilla Panna Cotta': ['Panna Cotta'],
    'Crème Brûlée': ['Creme Brulee'],
    'Sticky Toffee Pudding': ['Sticky Toffee'],
    'Bread & Butter Pudding': ['Bread Pudding'],
    'Lemon Poppy Seed Loaf': ['Lemon Bread'],
    'Courgette Bread': ['Zucchini Bread'],
    'Date & Walnut Loaf': ['Date Loaf'],
    'Mince Pies': ['Mince Pie'],
    'Yule Log': ['Buche de Noel', 'Yule Log Cake'],
    'Hot Cross Buns': ['Hot Cross Bun'],
    'Homemade Naan Bread': ['Naan', 'Naan Bread'],
    'Homemade Bagels': ['Bagel'],
    'Olive & Rosemary Focaccia': ['Focaccia'],
    'Battenberg Cake': ['Battenberg'],
    'Chocolate Fudge Cake': ['Chocolate Cake'],
    'French Macarons': ['Macaron', 'Macaroon'],
    'Almond Biscotti': ['Biscotti'],
    'Millionaire\'s Shortbread': ['Millionaire Shortbread'],
    'Apple Strudel': ['Strudel'],
    'French Fruit Tart': ['Fruit Tart'],
    'Cinnamon Swirls': ['Cinnamon Roll'],
    'Steak & Ale Pie': ['Steak Pie'],
    'Key Lime Pie': ['Key Lime'],
    'Classic French Crêpes': ['Crepe', 'Crepes'],
    'Chelsea Buns': ['Chelsea Bun'],
    'Pain aux Raisins': ['Pain au Raisin'],
    'Classic Fruit Scones': ['Scone'],
    'Beef Wellington': ['Beef Wellington'],
    'Homemade Pizza Dough': ['Pizza'],
    'Stilton & Broccoli Quiche': ['Quiche'],
    'Cheese & Herb Soda Bread': ['Soda Bread'],
    'Classic Rice Pudding': ['Rice Pudding'],
    'Classic English Trifle': ['Trifle'],
    'Apple Crumble': ['Apple Crumble'],
    'Lemon Posset': ['Lemon Posset'],
    'Chocolate Fondant': ['Chocolate Lava Cake', 'Fondant'],
    'Bara Brith': ['Bara Brith'],
    'Triple Chocolate Brownies': ['Brownie', 'Brownies'],
    'Raspberry & White Chocolate Blondies': ['Blondie'],
    'Simnel Cake': ['Simnel'],
    'Easter Biscuits': ['Easter Cookie'],
    'Lamingtons': ['Lamington'],
  };

  if (aliases[title]) {
    terms.push(...aliases[title]);
  }

  return terms;
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const src = fs.readFileSync(RECIPES_PATH, 'utf-8');
  const recipes = extractRecipes(src);
  console.log(`Found ${recipes.length} recipes\n`);

  const imageMap = {};
  const matched = [];
  const unmatched = [];

  for (const recipe of recipes) {
    const terms = getSearchTerms(recipe.title);
    let found = null;

    for (const term of terms) {
      found = await searchMealDB(term);
      if (found) break;
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    if (found) {
      imageMap[recipe.id] = found.image;
      matched.push({ id: recipe.id, title: recipe.title, matchedAs: found.name, image: found.image });
      console.log(`✅ ${recipe.title} → ${found.name}`);
    } else {
      unmatched.push({ id: recipe.id, title: recipe.title });
      console.log(`❌ ${recipe.title} — no match`);
    }
  }

  // Save results
  const outPath = path.join(__dirname, 'image-map.json');
  fs.writeFileSync(outPath, JSON.stringify({ matched, unmatched, imageMap }, null, 2));

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Matched: ${matched.length} / ${recipes.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
  console.log(`Results saved to: ${outPath}`);

  if (unmatched.length > 0) {
    console.log(`\nUnmatched recipes:`);
    unmatched.forEach((r) => console.log(`  - ${r.title} (${r.id})`));
  }
}

main().catch(console.error);

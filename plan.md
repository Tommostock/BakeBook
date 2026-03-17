# Plan: Add New Recipes to BakeBook

## Overview

Add ~22 new recipes across 4 groups, all placed into **existing categories** with no new categories, no schema changes, and no modifications to existing recipes or database.

---

## Recipe Groups & Categorisation

### 1. Cheesecakes → `Cakes` category (IDs: cake-013 to cake-018)
6 recipes:
- **Classic New York Cheesecake** — Dense, creamy baked cheesecake with a biscuit base
- **Baked Vanilla Cheesecake** — Simple British-style baked cheesecake with vanilla
- **Lemon Cheesecake** (no-bake) — Light and tangy with a buttery digestive base
- **Chocolate Cheesecake** (no-bake) — Rich chocolate ganache cheesecake
- **Strawberry Cheesecake** — Fresh strawberry topping on a creamy cheesecake
- **Biscoff Cheesecake** (no-bake) — Lotus Biscoff spread swirled through a creamy filling

### 2. Cakes (new additions) → `Cakes` category (IDs: cake-019 to cake-024)
6 recipes:
- **Coffee Cake** — A classic coffee-flavoured sponge with walnut buttercream
- **Apple Cake** — Moist cake studded with Bramley apple chunks and cinnamon
- **Coconut Cake** — Fluffy sponge with coconut cream frosting and desiccated coconut
- **Pineapple Upside-Down Cake** — Retro caramelised pineapple ring cake
- **Ginger Cake** — Sticky, rich ginger cake with treacle and warm spices
- **Orange Drizzle Cake** — Light sponge soaked in a zesty orange syrup

### 3. Biscuits → `Cookies` category (IDs: cookie-012 to cookie-017)
6 recipes:
- **Hobnobs** — Classic oaty biscuits, crunchy and golden
- **Custard Creams** — Vanilla custard-filled sandwich biscuits
- **Bourbons** — Chocolate sandwich biscuits with chocolate buttercream
- **Digestive Biscuits** — Wholesome wholemeal biscuits, slightly sweet
- **Jammy Dodgers** — Shortbread biscuits with a jammy centre
- **Viennese Whirls** — Buttery piped biscuits sandwiched with jam and buttercream

### 4. Baby Recipes (age 1-2) → `Cakes` category (IDs: cake-025 to cake-028)
4 recipes — all **low/no refined sugar**, **soft textures**, tagged `['Baby-Friendly', 'Toddler']`:
- **Banana Oat Mini Muffins** — Naturally sweetened with banana, no added sugar
- **Sweet Potato & Apple Mini Cakes** — Vegetable-based soft cakes with apple purée
- **Blueberry Yoghurt Baby Cake** — Soft sponge made with Greek yoghurt and blueberries
- **Carrot & Apple Fingers** — Soft baked fingers perfect for little hands

---

## Files to Modify

### 1. `/home/user/BakeBook/data/recipes.ts` (ONLY ADDITIONS — append to array)
- Append 23 new recipe objects to the end of the existing `recipes` array
- All recipes follow the exact same `Recipe` interface
- No existing recipe entries are touched
- IDs follow established patterns: `cake-013` through `cake-028`, `cookie-012` through `cookie-017`

### 2. `/home/user/BakeBook/lib/seasonal.ts` (ONLY ADDITIONS — add IDs to seasonal arrays)
- Add select new recipes to seasonal mappings where appropriate:
  - **Spring**: Lemon Cheesecake (`cake-015`), Strawberry Cheesecake (`cake-017`)
  - **Summer**: Strawberry Cheesecake (`cake-017`), Pineapple Upside-Down Cake (`cake-022`)
  - **Autumn**: Apple Cake (`cake-020`), Ginger Cake (`cake-023`)
  - **Winter**: Biscoff Cheesecake (`cake-018`), Orange Drizzle Cake (`cake-024`)

---

## What Does NOT Change
- **No new categories** — all recipes go into existing `Cakes` or `Cookies`
- **No type changes** — `RecipeCategory` union stays the same
- **No helper changes** — `CATEGORIES` array and `CATEGORY_EMOJIS` stay the same
- **No UI changes** — existing screens, components, and routing work automatically
- **No existing recipes modified** — we only append to the array
- **No database/schema changes** — Supabase schema untouched
- **No store changes** — Zustand store works as-is

## How Baby Recipes Are Identified
Baby recipes use the existing `dietaryTags` field with tags `['Baby-Friendly', 'Toddler', 'Vegetarian']`. Users can search "baby" or "toddler" and the existing search function will match on dietary tags. Each baby recipe will also include clear tips about age-appropriateness and allergen awareness.

## Key Conventions Followed
- British English throughout (e.g. "colour", "flavour", "caster sugar")
- Metric measurements (g, ml, tsp, tbsp)
- Temperatures in °C (fan)
- Descriptive `tips` field with baker's advice
- Realistic `prepTime`, `bakeTime`, `totalTime` values
- Appropriate `difficulty` ratings
- `imageUrl` follows pattern: `/assets/recipes/recipe-name.jpg`
- `isFeatured` set on 2-3 standout recipes only

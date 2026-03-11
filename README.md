# Suzie's BakeBook 🎂

A beautiful, production-ready baking recipe app built as a gift for Suzie — 2x London Bake Off Champion and Best Mum In The World.

**Live Demo:** https://suziesbakebook.vercel.app/

## Features

✨ **Beautiful Design**
- Elegant calligraphy branding with decorative heart
- Pastel color palette (pink, peach, lavender)
- Responsive design for all devices

📱 **Core Functionality**
- **Recipe Library** — 10 starter recipes across all categories
- **Search & Filter** — By name, category, difficulty, ingredients
- **Recipe Details** — Full ingredients, step-by-step instructions, baker's tips
- **Baking Timer** — Built-in timer for bake times
- **Favorites** — Bookmark recipes for quick access
- **Baking Journal** — Log bakes with photos, ratings, and notes
- **Personal Notes** — Add tips and adjustments to recipes

🔧 **Technical Stack**
- **Framework:** Expo + React Native + Expo Router
- **Styling:** React Native with custom theme system
- **Fonts:** Great Vibes (calligraphy), Playfair Display (serif), Open Sans (sans)
- **State:** Zustand + AsyncStorage
- **Ready For:** Supabase backend integration
- **Deployment:** Vercel (web), Expo EAS (iOS/Android)

## Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Development Server

```bash
npm install
npm run web
```

Opens at http://localhost:8081

### Build for Web Export

```bash
npx expo export --platform web
```

Creates a `dist/` folder ready for deployment.

## Project Structure

```
BakeBook/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation (Home, Search, Favorites, Journal, Profile)
│   └── recipe/[id].tsx    # Recipe detail screen
├── components/            # Reusable React components
│   ├── RecipeCard.tsx
│   ├── Timer.tsx
│   └── ...
├── lib/
│   ├── store.ts          # Zustand state management
│   └── helpers.ts        # Utility functions
├── constants/
│   └── theme.ts          # Colors, fonts, spacing
├── data/
│   └── recipes.ts        # Recipe seed data
├── types/
│   └── recipe.ts         # TypeScript interfaces
└── database/
    └── schema.sql        # Supabase schema (future)
```

## Deployment

### Vercel (Web)

The app is configured to deploy to Vercel automatically:

1. Connect your GitHub repo to Vercel
2. Vercel automatically builds and deploys on every push
3. Live at: https://suziesbakebook.vercel.app/

If deployments are stuck:
- Check Vercel Dashboard for build logs
- Clear Vercel cache: Settings → Git Integration → Clear Cache
- Trigger manual rebuild: Deployments → Re-deploy

### Future: iOS/Android with Expo EAS

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store / Play Store
eas submit
```

## Database Integration (Roadmap)

The app includes a complete Supabase schema ready for multi-user support:

```sql
-- Run in Supabase SQL Editor:
-- (see database/schema.sql)
```

Future features:
- Real-time multi-user sync
- Cloud backup
- User authentication
- Share recipes

## Adding More Recipes

Edit `data/recipes.ts`:

```typescript
{
  id: 'bread-002',
  title: 'Focaccia',
  category: 'Bread',
  description: '...',
  ingredients: [...],
  steps: [...],
  // ... (see existing recipes for format)
}
```

## Customization

### Colors
Edit `constants/theme.ts` to change the pastel palette.

### Fonts
Update Google Fonts imports in `app/_layout.tsx` and add to theme.

### Layout
Modify `app/(tabs)/index.tsx` for the home screen layout.

## License

Created with ❤️ for Suzie

---

Built with Expo, React Native, and lots of love. 🍰

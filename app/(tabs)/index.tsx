import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { RecipeCard } from '../../components/RecipeCard';
import { CategoryPill } from '../../components/CategoryPill';
import { SectionHeader } from '../../components/SectionHeader';
// BakeryCollage removed — clean background matches rest of app
import { CATEGORIES, CATEGORY_EMOJIS } from '../../lib/helpers';
import { useAppStore } from '../../lib/store';
import { useAllRecipes } from '../../lib/recipes';
import { getCurrentSeason, getSeasonalLabel, getSeasonalEmoji, getSeasonalRecipes } from '../../lib/seasonal';

export default function HomeScreen() {
  const router = useRouter();
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const allRecipes = useAllRecipes();

  const season = getCurrentSeason();
  const seasonalLabel = `${getSeasonalLabel(season)} ${getSeasonalEmoji(season)}`;
  const seasonalRecipes = useMemo(
    () => getSeasonalRecipes(allRecipes),
    [allRecipes]
  );

  const featuredRecipes = useMemo(
    () => allRecipes.filter((r) => r.isFeatured).slice(0, 8),
    [allRecipes]
  );

  const recentRecipes = useMemo(
    () =>
      recentlyViewed
        .map((id) => allRecipes.find((r) => r.id === id))
        .filter(Boolean)
        .slice(0, 8) as typeof allRecipes,
    [recentlyViewed, allRecipes]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header / Hero */}
        <View style={styles.hero}>
          <Text style={styles.brandSuzie}>Suzie's</Text>
          <Text style={styles.brandBakeBook}>BakeBook</Text>
          <View style={styles.divider} />
          <Text style={styles.dedicationText}>
            For our beautiful mum,
          </Text>
          <Text style={styles.dedicationFrom}>
            Love Harry & Oliver
          </Text>
        </View>

        {/* Categories */}
        <SectionHeader title="Categories" />
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => (
            <CategoryPill
              label={item}
              emoji={CATEGORY_EMOJIS[item]}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search',
                  params: { category: item },
                })
              }
            />
          )}
        />

        {/* Seasonal Highlights */}
        {seasonalRecipes.length > 0 && (
          <>
            <SectionHeader title={seasonalLabel} />
            <FlatList
              horizontal
              data={seasonalRecipes}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
              renderItem={({ item }) => <RecipeCard recipe={item} variant="medium" />}
            />
          </>
        )}

        {/* Featured Recipes */}
        <SectionHeader
          title="Featured Recipes"
          onSeeAll={() => router.push('/(tabs)/search')}
        />
        <FlatList
          horizontal
          data={featuredRecipes}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => <RecipeCard recipe={item} variant="medium" />}
        />

        {/* Quick & Easy */}
        <SectionHeader title="Quick & Easy" />
        <FlatList
          horizontal
          data={allRecipes.filter((r) => r.difficulty === 'Easy').slice(0, 8)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => <RecipeCard recipe={item} variant="small" />}
        />

        {/* Recently Viewed */}
        {recentRecipes.length > 0 && (
          <>
            <SectionHeader title="Recently Viewed" />
            <FlatList
              horizontal
              data={recentRecipes}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
              renderItem={({ item }) => (
                <RecipeCard recipe={item} variant="small" />
              )}
            />
          </>
        )}

        {/* Browse All */}
        <SectionHeader
          title="All Recipes"
          onSeeAll={() => router.push('/(tabs)/search')}
        />
        <View style={styles.gridContainer}>
          {allRecipes.slice(0, 6).map((recipe) => (
            <Pressable
              key={recipe.id}
              style={styles.gridCard}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <Image
                source={{ uri: recipe.imageUrl }}
                style={styles.gridImage}
                contentFit="cover"
                transition={300}
              />
              <Text style={styles.gridTitle} numberOfLines={2}>
                {recipe.title}
              </Text>
              <Text style={styles.gridCategory}>{recipe.category}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  hero: {
    backgroundColor: Colors.surfaceAlt,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  brandSuzie: {
    fontFamily: Fonts.calligraphy,
    fontSize: 58,
    color: Colors.text,
    marginBottom: -16,
    textAlign: 'center',
  },
  brandBakeBook: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 4,
    textAlign: 'center',
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: Colors.primaryDark,
    marginVertical: 10,
    borderRadius: 1,
  },
  dedicationText: {
    fontFamily: Fonts.serifRegular,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dedicationFrom: {
    fontFamily: Fonts.serifRegular,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  gridCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surfaceAlt,
  },
  gridTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
    padding: Spacing.sm,
    paddingBottom: 2,
  },
  gridCategory: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
});

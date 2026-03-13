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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../../constants/theme';
import { RecipeCard } from '../../components/RecipeCard';
import { CategoryPill } from '../../components/CategoryPill';
import { SectionHeader } from '../../components/SectionHeader';
import { AnimatedEntry } from '../../components/AnimatedEntry';
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Top Logo Bar */}
        <AnimatedEntry delay={0} slideFrom="none">
          <View style={styles.logoBar}>
            <View>
              <Text style={styles.logoSuzie}>Suzie's</Text>
              <Text style={styles.logoBakeBook}>BakeBook</Text>
            </View>
            <Pressable
              style={styles.searchIcon}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Ionicons name="search" size={22} color={Colors.text} />
            </Pressable>
          </View>
        </AnimatedEntry>

        {/* Categories */}
        <AnimatedEntry delay={50}>
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
        </AnimatedEntry>

        {/* Seasonal Highlights */}
        {seasonalRecipes.length > 0 && (
          <AnimatedEntry delay={100}>
            <SectionHeader title={seasonalLabel} />
            <FlatList
              horizontal
              data={seasonalRecipes}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
              renderItem={({ item }) => <RecipeCard recipe={item} variant="medium" />}
            />
          </AnimatedEntry>
        )}

        {/* Featured Recipes */}
        <AnimatedEntry delay={150}>
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
        </AnimatedEntry>

        {/* Quick & Easy */}
        <AnimatedEntry delay={200}>
          <SectionHeader title="Quick & Easy" />
          <FlatList
            horizontal
            data={allRecipes.filter((r) => r.difficulty === 'Easy').slice(0, 8)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => <RecipeCard recipe={item} variant="small" />}
          />
        </AnimatedEntry>

        {/* Recently Viewed */}
        {recentRecipes.length > 0 && (
          <AnimatedEntry delay={250}>
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
          </AnimatedEntry>
        )}

        {/* Browse All */}
        <AnimatedEntry delay={300}>
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
                <View style={styles.gridImageContainer}>
                  <Image
                    source={{ uri: recipe.imageUrl }}
                    style={styles.gridImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.25)']}
                    style={styles.gridOverlay}
                  />
                </View>
                <Text style={styles.gridTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <Text style={styles.gridCategory}>{recipe.category}</Text>
              </Pressable>
            ))}
          </View>
        </AnimatedEntry>
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

  /* ── Compact logo bar ── */
  logoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  logoSuzie: {
    fontFamily: Fonts.calligraphy,
    fontSize: 32,
    color: Colors.primaryDark,
    lineHeight: 36,
  },
  logoBakeBook: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    color: Colors.text,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  searchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
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
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surfaceAlt,
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
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

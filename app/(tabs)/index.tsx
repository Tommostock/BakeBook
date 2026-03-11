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
import { CATEGORIES, CATEGORY_EMOJIS } from '../../lib/helpers';
import { useAppStore } from '../../lib/store';
import { recipes } from '../../data/recipes';

export default function HomeScreen() {
  const router = useRouter();
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);

  const featuredRecipes = useMemo(
    () => recipes.filter((r) => r.isFeatured).slice(0, 8),
    []
  );

  const recentRecipes = useMemo(
    () =>
      recentlyViewed
        .map((id) => recipes.find((r) => r.id === id))
        .filter(Boolean)
        .slice(0, 8) as typeof recipes,
    [recentlyViewed]
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
          <Ionicons
            name="heart"
            size={260}
            color="rgba(232, 160, 184, 0.2)"
            style={styles.heroHeart}
          />
          <View style={styles.heroContent}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandSuzie}>Suzie's</Text>
              <Text style={styles.brandBakeBook}>BAKEBOOK</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>
              2 x London Bake Off Champion & Best Mum In The World
            </Text>
          </View>
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
          data={recipes.filter((r) => r.difficulty === 'Easy').slice(0, 8)}
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
          {recipes.slice(0, 6).map((recipe) => (
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
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  heroHeart: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -75,
    zIndex: 0,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  brandContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: -4,
  },
  brandSuzie: {
    fontFamily: Fonts.calligraphy,
    fontSize: 58,
    color: Colors.primaryDark,
    marginBottom: -16,
    zIndex: 1,
    textAlign: 'center',
  },
  brandBakeBook: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 8,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: Colors.primary,
    marginVertical: Spacing.md,
    borderRadius: 1,
  },
  subtitle: {
    fontFamily: Fonts.serif,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: -0.3,
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

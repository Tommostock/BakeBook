import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../../constants/theme';
import { CategoryPill } from '../../components/CategoryPill';
import { RecipeFormModal } from '../../components/RecipeFormModal';
import { FilterSheet, FilterOptions, EMPTY_FILTERS, countActiveFilters } from '../../components/FilterSheet';
import { CATEGORIES, CATEGORY_EMOJIS, searchRecipes, formatTime, DIFFICULTY_COLORS } from '../../lib/helpers';
import { useAllRecipes } from '../../lib/recipes';
import type { Recipe } from '../../types/recipe';

// Animated search result row (#19)
function AnimatedRecipeRow({ item, index, onPress }: { item: Recipe; index: number; onPress: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = Math.min(index * 60, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable style={styles.recipeRow} onPress={onPress}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.recipeImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.recipeInfo}>
          <View style={styles.categoryRow2}>
            <Text style={styles.recipeCategory}>{item.category}</Text>
            {item.isUserRecipe && (
              <View style={styles.myRecipeBadge}>
                <Text style={styles.myRecipeBadgeText}>MY RECIPE</Text>
              </View>
            )}
          </View>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.recipeMeta}>
            <Text style={styles.metaText}>⏱ {formatTime(item.totalTime)}</Text>
            <Text
              style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + '20', color: DIFFICULTY_COLORS[item.difficulty] }]}
            >
              {item.difficulty}
            </Text>
            <Text style={styles.metaText}>🍽 {item.servings}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const allRecipes = useAllRecipes();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category || null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>(EMPTY_FILTERS);
  const [searchFocused, setSearchFocused] = useState(false);
  const activeFilterCount = countActiveFilters(advancedFilters);

  // Animated search bar border (#17)
  const searchBorderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchBorderAnim, {
      toValue: searchFocused || query.length > 0 ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [searchFocused, query]);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const results = useMemo(
    () => searchRecipes(allRecipes, query, selectedCategory, selectedDifficulty, {
      maxTotalTime: advancedFilters.maxTotalTime,
      dietaryTags: advancedFilters.dietaryTags,
      maxIngredients: advancedFilters.maxIngredients,
    }),
    [allRecipes, query, selectedCategory, selectedDifficulty, advancedFilters]
  );

  // Key to force re-render animations when results change
  const [resultsKey, setResultsKey] = useState(0);
  const prevResultsRef = useRef<string>('');
  useEffect(() => {
    const key = results.map(r => r.id).join(',');
    if (key !== prevResultsRef.current) {
      prevResultsRef.current = key;
      setResultsKey(k => k + 1);
    }
  }, [results]);

  const renderRecipeRow = ({ item, index }: { item: Recipe; index: number }) => (
    <AnimatedRecipeRow
      key={`${item.id}-${resultsKey}`}
      item={item}
      index={index}
      onPress={() => router.push(`/recipe/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Recipes</Text>
      </View>

      {/* Animated Search Bar (#17) */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            borderColor: searchBorderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.borderLight, Colors.primaryDark],
            }),
            backgroundColor: searchBorderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.surface, Colors.white],
            }),
          },
        ]}
      >
        <Ionicons name="search" size={20} color={searchFocused ? Colors.primaryDark : Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ingredient, category..."
          placeholderTextColor={Colors.textLight}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </Pressable>
        )}
        <Pressable style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? Colors.primaryDark : Colors.textSecondary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Category Filter */}
      <View style={styles.categoryRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, alignItems: 'center' }}
        >
          {['All', ...CATEGORIES].map((item) => (
            <CategoryPill
              key={item}
              label={item === 'All' ? 'All' : item}
              emoji={item === 'All' ? '📋' : CATEGORY_EMOJIS[item as keyof typeof CATEGORY_EMOJIS]}
              isSelected={item === 'All' ? !selectedCategory : selectedCategory === item}
              onPress={() => setSelectedCategory(item === 'All' ? null : item)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Difficulty Filter */}
      <View style={styles.difficultyRow}>
        {['All', 'Easy', 'Medium', 'Hard'].map((d) => {
          const isAll = d === 'All';
          const isSelected = isAll ? !selectedDifficulty : selectedDifficulty === d;
          return (
            <Pressable
              key={d}
              style={[
                styles.difficultyPill,
                isSelected && !isAll && { backgroundColor: DIFFICULTY_COLORS[d] + '30' },
                isSelected && isAll && styles.difficultyPillAllSelected,
              ]}
              onPress={() => setSelectedDifficulty(isAll ? null : (selectedDifficulty === d ? null : d))}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: isAll ? Colors.textSecondary : DIFFICULTY_COLORS[d] },
                  isSelected && { fontFamily: Fonts.sansBold },
                  isSelected && isAll && { color: Colors.primaryDark },
                ]}
              >
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results Count */}
      <Text style={styles.resultCount}>
        {results.length} recipe{results.length !== 1 ? 's' : ''} found
      </Text>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeRow}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />

      {/* FAB — Add Recipe */}
      <Pressable
        style={styles.fab}
        onPress={() => setShowRecipeForm(true)}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      {/* Recipe Form Modal */}
      <RecipeFormModal
        visible={showRecipeForm}
        onClose={() => setShowRecipeForm(false)}
      />

      {/* Advanced Filters */}
      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    ...Shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.text,
    marginLeft: Spacing.sm,
    paddingVertical: 4,
  },
  categoryRow: {
    height: 52,
    marginVertical: Spacing.xs,
  },
  categoryRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  difficultyRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  difficultyPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  difficultyPillAllSelected: {
    backgroundColor: Colors.primary + '40',
    borderColor: Colors.primaryDark,
  },
  difficultyText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  resultCount: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  recipeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  recipeImage: {
    width: 110,
    height: 110,
    backgroundColor: Colors.surfaceAlt,
  },
  recipeInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  recipeCategory: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  myRecipeBadge: {
    backgroundColor: Colors.primaryDark + '20',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  myRecipeBadgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 8,
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  recipeTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyText: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterBtn: {
    marginLeft: Spacing.sm,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primaryDark,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 9,
    color: Colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.strong,
  },
});

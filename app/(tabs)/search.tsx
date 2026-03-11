import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { CategoryPill } from '../../components/CategoryPill';
import { CATEGORIES, CATEGORY_EMOJIS, searchRecipes, formatTime, DIFFICULTY_COLORS } from '../../lib/helpers';
import { recipes } from '../../data/recipes';
import type { Recipe } from '../../types/recipe';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category || null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const results = useMemo(
    () => searchRecipes(recipes, query, selectedCategory, selectedDifficulty),
    [query, selectedCategory, selectedDifficulty]
  );

  const renderRecipeRow = ({ item }: { item: Recipe }) => (
    <Pressable
      style={styles.recipeRow}
      onPress={() => router.push(`/recipe/${item.id}`)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.recipeImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeCategory}>{item.category}</Text>
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
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Recipes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ingredient, category..."
          placeholderTextColor={Colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={['All', ...CATEGORIES]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }}
        renderItem={({ item }) => (
          <CategoryPill
            label={item === 'All' ? 'All' : item}
            emoji={item === 'All' ? '📋' : CATEGORY_EMOJIS[item as keyof typeof CATEGORY_EMOJIS]}
            isSelected={item === 'All' ? !selectedCategory : selectedCategory === item}
            onPress={() => setSelectedCategory(item === 'All' ? null : item)}
          />
        )}
      />

      {/* Difficulty Filter */}
      <View style={styles.difficultyRow}>
        {['Easy', 'Medium', 'Hard'].map((d) => (
          <Pressable
            key={d}
            style={[
              styles.difficultyPill,
              selectedDifficulty === d && { backgroundColor: DIFFICULTY_COLORS[d] + '30' },
            ]}
            onPress={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: DIFFICULTY_COLORS[d] },
                selectedDifficulty === d && { fontFamily: Fonts.sansBold },
              ]}
            >
              {d}
            </Text>
          </Pressable>
        ))}
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
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.text,
    marginLeft: Spacing.sm,
    paddingVertical: 4,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  difficultyText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  resultCount: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  recipeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
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
});

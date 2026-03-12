import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { formatTime } from '../lib/helpers';
import type { Recipe } from '../types/recipe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'large' | 'medium' | 'small';
}

export function RecipeCard({ recipe, variant = 'medium' }: RecipeCardProps) {
  const router = useRouter();

  const cardWidth =
    variant === 'large'
      ? SCREEN_WIDTH - Spacing.lg * 2
      : variant === 'medium'
      ? SCREEN_WIDTH * 0.6
      : SCREEN_WIDTH * 0.42;

  const imageHeight = variant === 'large' ? 200 : variant === 'medium' ? 160 : 120;

  return (
    <Pressable
      style={[styles.card, { width: cardWidth }]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={[styles.image, { height: imageHeight }]}
        contentFit="cover"
        transition={300}
        placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
      />
      {recipe.isUserRecipe && (
        <View style={styles.myRecipeBadge}>
          <Text style={styles.myRecipeBadgeText}>MY RECIPE</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.category}>{recipe.category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>⏱ {formatTime(recipe.totalTime)}</Text>
          <Text style={[styles.difficulty, { color: recipe.difficulty === 'Easy' ? '#4CAF50' : recipe.difficulty === 'Medium' ? '#FF9800' : '#E53935' }]}>
            {recipe.difficulty}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  image: {
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
  },
  content: {
    padding: Spacing.md,
  },
  category: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  difficulty: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myRecipeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(232, 160, 184, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    zIndex: 1,
  },
  myRecipeBadgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});

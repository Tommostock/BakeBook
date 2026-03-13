import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../constants/theme';
import { formatTime } from '../lib/helpers';
import type { Recipe } from '../types/recipe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'large' | 'medium' | 'small';
}

export function RecipeCard({ recipe, variant = 'medium' }: RecipeCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const cardWidth =
    variant === 'large'
      ? SCREEN_WIDTH - Spacing.lg * 2
      : variant === 'medium'
      ? SCREEN_WIDTH * 0.6
      : SCREEN_WIDTH * 0.42;

  const imageHeight = variant === 'large' ? 200 : variant === 'medium' ? 160 : 120;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, { width: cardWidth }]}>
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/recipe/${recipe.id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={[styles.image, { height: imageHeight }]}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
          />
          {/* Bottom gradient overlay for readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
        </View>
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
            <View style={[styles.difficultyDot, {
              backgroundColor: recipe.difficulty === 'Easy' ? '#4CAF50' : recipe.difficulty === 'Medium' ? '#FF9800' : '#E53935',
            }]} />
            <Text style={[styles.difficulty, { color: recipe.difficulty === 'Easy' ? '#4CAF50' : recipe.difficulty === 'Medium' ? '#FF9800' : '#E53935' }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.soft,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  content: {
    padding: Spacing.md,
  },
  category: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficulty: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
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

import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  Animated,
  PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { useAllRecipes } from '../../lib/recipes';
import { formatTime, DIFFICULTY_COLORS } from '../../lib/helpers';
import type { Recipe } from '../../types/recipe';

type SortMode = 'recent' | 'name' | 'difficulty' | 'time';
const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'recent', label: 'Recently Added' },
  { key: 'name', label: 'Name' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'time', label: 'Quickest' },
];

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

// Swipeable favourite card (#30)
function SwipeableCard({ item, onRemove, onPress }: { item: Recipe; onRemove: () => void; onPress: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;
  const threshold = -80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < threshold) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -400,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(cardHeight, {
              toValue: 0,
              duration: 250,
              delay: 150,
              useNativeDriver: false,
            }),
          ]).start(() => onRemove());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={{
        maxHeight: cardHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200],
        }),
        opacity: cardHeight,
        marginBottom: Spacing.md,
      }}
    >
      {/* Delete background */}
      <View style={styles.swipeBackground}>
        <Ionicons name="trash-outline" size={24} color={Colors.white} />
        <Text style={styles.swipeText}>Remove</Text>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        <Pressable style={styles.card} onPress={onPress}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.info}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>⏱ {formatTime(item.totalTime)}</Text>
              <Text style={[styles.difficulty, { color: DIFFICULTY_COLORS[item.difficulty] }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>
          <Ionicons name="heart" size={22} color={Colors.primaryDark} style={styles.heartIcon} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const allRecipes = useAllRecipes();
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showSort, setShowSort] = useState(false);

  const favoriteRecipes = useMemo(() => {
    const recipes = favorites
      .map((id) => allRecipes.find((r) => r.id === id))
      .filter(Boolean) as Recipe[];

    switch (sortMode) {
      case 'name':
        return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
      case 'difficulty':
        return [...recipes].sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));
      case 'time':
        return [...recipes].sort((a, b) => a.totalTime - b.totalTime);
      default:
        return recipes;
    }
  }, [favorites, allRecipes, sortMode]);

  const renderItem = ({ item }: { item: Recipe }) => (
    <SwipeableCard
      item={item}
      onRemove={() => toggleFavorite(item.id)}
      onPress={() => router.push(`/recipe/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favourites</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{favoriteRecipes.length} saved</Text>
          {favoriteRecipes.length > 1 && (
            <Pressable
              style={styles.sortBtn}
              onPress={() => setShowSort(!showSort)}
            >
              <Ionicons name="swap-vertical" size={18} color={Colors.primaryDark} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Sort options dropdown (#31) */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[styles.sortOption, sortMode === opt.key && styles.sortOptionActive]}
              onPress={() => { setSortMode(opt.key); setShowSort(false); }}
            >
              <Text style={[styles.sortOptionText, sortMode === opt.key && styles.sortOptionTextActive]}>
                {opt.label}
              </Text>
              {sortMode === opt.key && (
                <Ionicons name="checkmark" size={16} color={Colors.primaryDark} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={favoriteRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any recipe to save it here
            </Text>
            <Pressable
              style={styles.browseBtn}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.browseBtnText}>Browse Recipes</Text>
            </Pressable>
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
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  count: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sortBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  sortDropdown: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortOptionActive: {
    backgroundColor: Colors.surfaceAlt,
  },
  sortOptionText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.text,
  },
  sortOptionTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.primaryDark,
  },
  swipeBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: Colors.error,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.white,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: Colors.surfaceAlt,
  },
  info: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  category: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 19,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  difficulty: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
  },
  heartIcon: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadows.medium,
  },
  browseBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
});

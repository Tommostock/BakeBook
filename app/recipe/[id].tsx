import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TextInput,
  Alert,
  Share,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { Timer } from '../../components/Timer';
import { useAppStore } from '../../lib/store';
import { recipes } from '../../data/recipes';
import { formatTime, DIFFICULTY_COLORS, generateId } from '../../lib/helpers';
import type { RecipeNote } from '../../types/recipe';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorite = useAppStore((s) => s.isFavorite);
  const recipeNotes = useAppStore((s) => s.recipeNotes);
  const addRecipeNote = useAppStore((s) => s.addRecipeNote);
  const deleteRecipeNote = useAppStore((s) => s.deleteRecipeNote);

  const recipe = useMemo(() => recipes.find((r) => r.id === id), [id]);
  const notes = useMemo(
    () => recipeNotes.filter((n) => n.recipeId === id),
    [recipeNotes, id]
  );
  const [newNote, setNewNote] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showTimer, setShowTimer] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (id) addRecentlyViewed(id);
  }, [id]);

  const playFavoriteAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleToggleFavorite = (recipeId: string) => {
    toggleFavorite(recipeId);
    playFavoriteAnimation();
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(recipe.id);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: RecipeNote = {
      id: generateId(),
      recipeId: recipe.id,
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    addRecipeNote(note);
    setNewNote('');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title} from Suzie's BakeBook!`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroButtons}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </Pressable>
            <View style={styles.heroRight}>
              <Pressable style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={Colors.white} />
              </Pressable>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable style={styles.iconBtn} onPress={() => handleToggleFavorite(recipe.id)}>
                  <Ionicons
                    name={fav ? 'heart' : 'heart-outline'}
                    size={22}
                    color={fav ? Colors.primary : Colors.white}
                  />
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Category */}
          <Text style={styles.category}>{recipe.category}</Text>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Time & Difficulty Bar */}
          <View style={styles.metaBar}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.metaLabel}>Prep</Text>
              <Text style={styles.metaValue}>{formatTime(recipe.prepTime)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.metaLabel}>Bake</Text>
              <Text style={styles.metaValue}>{formatTime(recipe.bakeTime)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="hourglass-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.metaValue}>{formatTime(recipe.totalTime)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.metaLabel}>Serves</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
          </View>

          {/* Difficulty Badge */}
          <View style={styles.difficultyRow}>
            <Text
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor: DIFFICULTY_COLORS[recipe.difficulty] + '18',
                  color: DIFFICULTY_COLORS[recipe.difficulty],
                },
              ]}
            >
              {recipe.difficulty}
            </Text>
            {recipe.dietaryTags?.map((tag) => (
              <Text key={tag} style={styles.dietaryTag}>{tag}</Text>
            ))}
          </View>

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <Pressable
              key={i}
              style={styles.ingredientRow}
              onPress={() => toggleIngredient(i)}
            >
              <Ionicons
                name={checkedIngredients.has(i) ? 'checkbox' : 'square-outline'}
                size={20}
                color={checkedIngredients.has(i) ? Colors.primaryDark : Colors.textLight}
              />
              <Text
                style={[
                  styles.ingredientText,
                  checkedIngredients.has(i) && styles.ingredientChecked,
                ]}
              >
                {ing.amount}
                {ing.unit ? ` ${ing.unit}` : ''} {ing.name}
              </Text>
            </Pressable>
          ))}

          {/* Steps */}
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/* Tips */}
          {recipe.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Baker's Tips</Text>
              <Text style={styles.tipsText}>{recipe.tips}</Text>
            </View>
          )}

          {/* Timer */}
          <Pressable
            style={styles.timerToggle}
            onPress={() => setShowTimer(!showTimer)}
          >
            <Ionicons name="timer-outline" size={20} color={Colors.primaryDark} />
            <Text style={styles.timerToggleText}>
              {showTimer ? 'Hide Timer' : 'Show Baking Timer'}
            </Text>
          </Pressable>
          {showTimer && <Timer defaultMinutes={recipe.bakeTime} />}

          {/* Personal Notes */}
          <Text style={styles.sectionTitle}>My Notes</Text>
          <View style={styles.noteInputRow}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (e.g., 'Use less sugar next time')"
              placeholderTextColor={Colors.textLight}
              value={newNote}
              onChangeText={setNewNote}
            />
            <Pressable style={styles.noteAddBtn} onPress={handleAddNote}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </Pressable>
          </View>
          {notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteText}>{note.text}</Text>
              <View style={styles.noteFooter}>
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleDateString('en-GB')}
                </Text>
                <Pressable onPress={() => deleteRecipeNote(note.id)} hitSlop={10}>
                  <Ionicons name="close-circle-outline" size={18} color={Colors.textLight} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceAlt,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  heroRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  category: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  metaBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metaLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
  },
  metaDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  dietaryTag: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    color: Colors.textSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  ingredientText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  ingredientChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.text,
  },
  stepText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    flex: 1,
  },
  tipsBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  tipsTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  tipsText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  timerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  timerToggleText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.primaryDark,
  },
  noteInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noteInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  noteAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  noteText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 19,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  noteDate: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textLight,
  },
});

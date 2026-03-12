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
import { RecipeFormModal } from '../../components/RecipeFormModal';
import { useAppStore } from '../../lib/store';
import { useAllRecipes, isUserRecipe } from '../../lib/recipes';
import { formatTime, DIFFICULTY_COLORS, generateId } from '../../lib/helpers';
import { scaleAllIngredients } from '../../lib/ingredients';
import { convertAllIngredients } from '../../lib/unitConversion';
import type { UnitSystem } from '../../lib/unitConversion';
import type { RecipeNote, Ingredient } from '../../types/recipe';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const fav = useAppStore((s) => s.favorites.includes(id ?? ''));
  const recipeNotes = useAppStore((s) => s.recipeNotes);
  const addRecipeNote = useAppStore((s) => s.addRecipeNote);
  const deleteRecipeNote = useAppStore((s) => s.deleteRecipeNote);
  const deleteUserRecipe = useAppStore((s) => s.deleteUserRecipe);
  const preferredUnits = useAppStore((s) => s.preferredUnits);
  const setPreferredUnits = useAppStore((s) => s.setPreferredUnits);

  const allRecipes = useAllRecipes();
  const recipe = useMemo(() => allRecipes.find((r) => r.id === id), [allRecipes, id]);
  const isOwn = id ? isUserRecipe(id) : false;

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const notes = useMemo(
    () => recipeNotes.filter((n) => n.recipeId === id),
    [recipeNotes, id]
  );
  const [newNote, setNewNote] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [showTimer, setShowTimer] = useState(false);
  const [scaledServings, setScaledServings] = useState<number | null>(null);

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

  // Compute display ingredients: scale first, then convert units
  const displayIngredients = useMemo(() => {
    if (!recipe) return [];
    const currentServings = scaledServings ?? recipe.servings;
    let ings = scaleAllIngredients(recipe.ingredients, recipe.servings, currentServings);
    if (preferredUnits === 'imperial') {
      ings = convertAllIngredients(ings, 'imperial');
    }
    return ings;
  }, [recipe, scaledServings, preferredUnits]);

  const isScaled = scaledServings !== null && scaledServings !== recipe?.servings;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </SafeAreaView>
    );
  }

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
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

  const handleLogBake = () => {
    router.push(`/(tabs)/journal?recipeId=${recipe.id}`);
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
            <Pressable style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </Pressable>
            <View style={styles.heroRight}>
              {isOwn && (
                <>
                  <Pressable style={styles.iconBtn} onPress={() => setShowEditForm(true)}>
                    <Ionicons name="create-outline" size={22} color={Colors.white} />
                  </Pressable>
                  <Pressable style={styles.iconBtn} onPress={() => setShowDeleteConfirm(true)}>
                    <Ionicons name="trash-outline" size={22} color={Colors.white} />
                  </Pressable>
                </>
              )}
              <Pressable style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={Colors.white} />
              </Pressable>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable style={styles.iconBtn} onPress={() => handleToggleFavorite(recipe.id)}>
                  <Ionicons
                    name={fav ? 'heart' : 'heart-outline'}
                    size={22}
                    color={fav ? Colors.primaryDark : Colors.white}
                  />
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Category */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.category}>{recipe.category}</Text>
            {isOwn && (
              <View style={{ backgroundColor: Colors.primaryDark + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: Colors.primaryDark, letterSpacing: 0.5 }}>MY RECIPE</Text>
              </View>
            )}
          </View>
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

          {/* Servings Scaler */}
          <View style={styles.servingsRow}>
            <Pressable
              style={styles.servingsBtn}
              onPress={() => {
                const current = scaledServings ?? recipe.servings;
                if (current > 1) setScaledServings(current - 1);
              }}
            >
              <Ionicons name="remove" size={18} color={Colors.primaryDark} />
            </Pressable>
            <Text style={[styles.servingsValue, isScaled && styles.servingsValueScaled]}>
              {scaledServings ?? recipe.servings} {(scaledServings ?? recipe.servings) === 1 ? 'serving' : 'servings'}
            </Text>
            <Pressable
              style={styles.servingsBtn}
              onPress={() => {
                const current = scaledServings ?? recipe.servings;
                if (current < recipe.servings * 4) setScaledServings(current + 1);
              }}
            >
              <Ionicons name="add" size={18} color={Colors.primaryDark} />
            </Pressable>
            {isScaled && (
              <Pressable
                style={styles.servingsResetBtn}
                onPress={() => setScaledServings(null)}
              >
                <Ionicons name="refresh" size={14} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Ingredients */}
          <View style={styles.ingredientsHeader}>
            <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>Ingredients</Text>
            <View style={styles.unitToggle}>
              <Pressable
                style={[styles.unitBtn, preferredUnits === 'metric' && styles.unitBtnActive]}
                onPress={() => setPreferredUnits('metric')}
              >
                <Text style={[styles.unitBtnText, preferredUnits === 'metric' && styles.unitBtnTextActive]}>Metric</Text>
              </Pressable>
              <Pressable
                style={[styles.unitBtn, preferredUnits === 'imperial' && styles.unitBtnActive]}
                onPress={() => setPreferredUnits('imperial')}
              >
                <Text style={[styles.unitBtnText, preferredUnits === 'imperial' && styles.unitBtnTextActive]}>Imperial</Text>
              </Pressable>
            </View>
          </View>
          {displayIngredients.map((ing, i) => (
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
            <Pressable key={i} style={styles.stepRow} onPress={() => toggleStep(i)}>
              <View style={[styles.stepNumber, checkedSteps.has(i) && styles.stepNumberDone]}>
                {checkedSteps.has(i) ? (
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                ) : (
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepText, checkedSteps.has(i) && styles.stepTextDone]}>{step}</Text>
            </Pressable>
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

      {/* Sticky Log Bake footer */}
      <View style={styles.logBakeBar}>
        <Pressable style={styles.logBakeBtn} onPress={handleLogBake}>
          <Ionicons name="book-outline" size={18} color={Colors.text} />
          <Text style={styles.logBakeBtnText}>Log This Bake</Text>
        </Pressable>
      </View>
      {/* Edit Form Modal */}
      {isOwn && (
        <RecipeFormModal
          visible={showEditForm}
          onClose={() => setShowEditForm(false)}
          editingRecipe={recipe}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Recipe</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete "{recipe.title}"? This cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, styles.confirmBtnDelete]}
                onPress={() => {
                  deleteUserRecipe(id!);
                  setShowDeleteConfirm(false);
                  router.canGoBack() ? router.back() : router.replace('/');
                }}
              >
                <Text style={styles.confirmBtnDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  servingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
    minWidth: 90,
    textAlign: 'center',
  },
  servingsValueScaled: {
    color: Colors.primaryDark,
  },
  servingsResetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.surface,
  },
  unitBtnActive: {
    backgroundColor: Colors.primaryDark,
  },
  unitBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  unitBtnTextActive: {
    color: Colors.white,
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
  stepNumberDone: {
    backgroundColor: Colors.primaryDark,
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
  stepTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
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
  logBakeBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  logBakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
  },
  logBakeBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  confirmBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '80%',
    maxWidth: 320,
  },
  confirmTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 17,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  confirmText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: Colors.surfaceAlt,
  },
  confirmBtnCancelText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  confirmBtnDelete: {
    backgroundColor: Colors.error,
  },
  confirmBtnDeleteText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
});

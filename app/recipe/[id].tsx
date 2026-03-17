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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Timer } from '../../components/Timer';
import { BakeMode } from '../../components/BakeMode';
import { RecipeFormModal } from '../../components/RecipeFormModal';
import { useAppStore } from '../../lib/store';
import { useAllRecipes, isUserRecipe } from '../../lib/recipes';
import { formatTime, DIFFICULTY_COLORS, generateId } from '../../lib/helpers';
import { scaleAllIngredients } from '../../lib/ingredients';
import { convertAllIngredients } from '../../lib/unitConversion';
import { formatRecipeShareShort, formatRecipeShareFull } from '../../lib/shareUtils';
import { parseStepTimers } from '../../lib/stepTimers';
import { useTimerStore } from '../../lib/timerStore';
import type { UnitSystem } from '../../lib/unitConversion';
import type { RecipeNote, Ingredient } from '../../types/recipe';

function formatChainTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors: C, shadows: S } = useTheme();
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
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showBakeMode, setShowBakeMode] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const addTimer = useTimerStore((s) => s.addTimer);
  const startTimerAction = useTimerStore((s) => s.startTimer);
  const removeChain = useTimerStore((s) => s.removeChain);
  const allTimers = useTimerStore((s) => s.timers);

  // Parse step timers for bake-along
  const stepTimers = useMemo(
    () => (recipe ? parseStepTimers(recipe.steps) : []),
    [recipe]
  );

  // Check if a bake-along chain is already active for this recipe
  const bakeAlongChainId = `bake-along-${id}`;
  const chainTimers = useMemo(
    () => allTimers.filter((t) => t.chainId === bakeAlongChainId),
    [allTimers, bakeAlongChainId]
  );
  const isBakeAlongActive = chainTimers.length > 0;
  const bakeAlongProgress = useMemo(() => {
    if (chainTimers.length === 0) return { done: 0, total: 0, currentLabel: '' };
    const done = chainTimers.filter((t) => t.remainingSeconds === 0 && t.totalSeconds > 0).length;
    const current = chainTimers.find((t) => t.isRunning);
    return { done, total: chainTimers.length, currentLabel: current?.label ?? '' };
  }, [chainTimers]);

  const handleStartBakeAlong = () => {
    if (stepTimers.length === 0) return;
    // Generate IDs for all timers first so we can set nextTimerId
    const ids = stepTimers.map(() => generateId());
    stepTimers.forEach((st, i) => {
      addTimer({
        id: ids[i],
        label: `Step ${st.stepIndex + 1}: ${st.label}`,
        totalSeconds: st.seconds,
        remainingSeconds: st.seconds,
        recipeTitle: recipe?.title,
        nextTimerId: i < ids.length - 1 ? ids[i + 1] : undefined,
        chainId: bakeAlongChainId,
        stepIndex: st.stepIndex,
      });
    });
    // Auto-start the first timer
    startTimerAction(ids[0]);
  };

  const handleStopBakeAlong = () => {
    removeChain(bakeAlongChainId);
  };

  const handleAddStepTimer = (stepIndex: number, label: string, seconds: number) => {
    const timerId = generateId();
    addTimer({
      id: timerId,
      label: `Step ${stepIndex + 1}: ${label}`,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      recipeTitle: recipe?.title,
    });
    startTimerAction(timerId);
  };

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
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <Text style={[styles.errorText, { color: C.textSecondary }]}>Recipe not found</Text>
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

  const handleShare = () => {
    setShowShareSheet(true);
  };

  const doShare = async (full: boolean) => {
    setShowShareSheet(false);
    const text = full ? formatRecipeShareFull(recipe) : formatRecipeShareShort(recipe);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        Alert.alert('Copied!', 'Recipe copied to clipboard');
      } else {
        await Share.share({ message: text });
      }
    } catch {}
  };

  const handleLogBake = () => {
    router.push(`/(tabs)/journal?recipeId=${recipe.id}`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
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
            <Pressable style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </Pressable>
            <View style={styles.heroRight}>
              {isOwn && (
                <>
                  <Pressable style={styles.iconBtn} onPress={() => setShowEditForm(true)} accessibilityRole="button" accessibilityLabel="Edit recipe">
                    <Ionicons name="create-outline" size={22} color={Colors.white} />
                  </Pressable>
                  <Pressable style={styles.iconBtn} onPress={() => setShowDeleteConfirm(true)} accessibilityRole="button" accessibilityLabel="Delete recipe">
                    <Ionicons name="trash-outline" size={22} color={Colors.white} />
                  </Pressable>
                </>
              )}
              <Pressable style={styles.iconBtn} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share recipe">
                <Ionicons name="share-outline" size={22} color={Colors.white} />
              </Pressable>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable style={styles.iconBtn} onPress={() => handleToggleFavorite(recipe.id)} accessibilityRole="button" accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}>
                  <Ionicons
                    name={fav ? 'heart' : 'heart-outline'}
                    size={22}
                    color={fav ? C.primaryDark : Colors.white}
                  />
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: C.background }]}>
          {/* Title & Category */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.category, { color: C.primaryDark }]}>{recipe.category}</Text>
            {isOwn && (
              <View style={{ backgroundColor: C.primaryDark + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: C.primaryDark, letterSpacing: 0.5 }}>MY RECIPE</Text>
              </View>
            )}
          </View>
          <Text style={[styles.title, { color: C.text }]}>{recipe.title}</Text>
          <Text style={[styles.description, { color: C.textSecondary }]}>{recipe.description}</Text>

          {/* Time & Difficulty Bar */}
          <View style={[styles.metaBar, { backgroundColor: C.surfaceAlt }]}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={C.primaryDark} />
              <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Prep</Text>
              <Text style={[styles.metaValue, { color: C.text }]}>{formatTime(recipe.prepTime)}</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: C.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={18} color={C.primaryDark} />
              <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Bake</Text>
              <Text style={[styles.metaValue, { color: C.text }]}>{formatTime(recipe.bakeTime)}</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: C.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name="hourglass-outline" size={18} color={C.primaryDark} />
              <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Total</Text>
              <Text style={[styles.metaValue, { color: C.text }]}>{formatTime(recipe.totalTime)}</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: C.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={18} color={C.primaryDark} />
              <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Serves</Text>
              <Text style={[styles.metaValue, { color: C.text }]}>{recipe.servings}</Text>
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
          <View style={[styles.servingsRow, { backgroundColor: C.surfaceAlt }]}>
            <Pressable
              style={[styles.servingsBtn, { backgroundColor: C.white, borderColor: C.borderLight }]}
              onPress={() => {
                const current = scaledServings ?? recipe.servings;
                if (current > 1) setScaledServings(current - 1);
              }}
            >
              <Ionicons name="remove" size={18} color={C.primaryDark} />
            </Pressable>
            <Text style={[styles.servingsValue, { color: C.text }, isScaled && { color: C.primaryDark }]}>
              {scaledServings ?? recipe.servings} {(scaledServings ?? recipe.servings) === 1 ? 'serving' : 'servings'}
            </Text>
            <Pressable
              style={[styles.servingsBtn, { backgroundColor: C.white, borderColor: C.borderLight }]}
              onPress={() => {
                const current = scaledServings ?? recipe.servings;
                if (current < recipe.servings * 4) setScaledServings(current + 1);
              }}
            >
              <Ionicons name="add" size={18} color={C.primaryDark} />
            </Pressable>
            {isScaled && (
              <Pressable
                style={styles.servingsResetBtn}
                onPress={() => setScaledServings(null)}
              >
                <Ionicons name="refresh" size={14} color={C.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Ingredients */}
          <View style={styles.ingredientsHeader}>
            <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0, color: C.text }]}>Ingredients</Text>
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
              style={[styles.ingredientRow, { borderBottomColor: C.borderLight }]}
              onPress={() => toggleIngredient(i)}
            >
              <Ionicons
                name={checkedIngredients.has(i) ? 'checkbox' : 'square-outline'}
                size={20}
                color={checkedIngredients.has(i) ? C.primaryDark : C.textLight}
              />
              <Text
                style={[
                  styles.ingredientText,
                  { color: C.text },
                  checkedIngredients.has(i) && { textDecorationLine: 'line-through', color: C.textLight },
                ]}
              >
                {ing.amount}
                {ing.unit ? ` ${ing.unit}` : ''} {ing.name}
              </Text>
            </Pressable>
          ))}

          {/* Steps — with progress indicator (#24) */}
          <View style={styles.stepsHeaderRow}>
            <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0, color: C.text }]}>Instructions</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Pressable style={styles.bakeModeBtn} onPress={() => setShowBakeMode(true)}>
                <Ionicons name="expand-outline" size={14} color={C.primaryDark} />
                <Text style={styles.bakeModeBtnText}>Bake Mode</Text>
              </Pressable>
              <Text style={styles.stepsProgress}>
                {checkedSteps.size}/{recipe.steps.length}
              </Text>
            </View>
          </View>
          {/* Animated progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: C.borderLight }]}>
            <LinearGradient
              colors={checkedSteps.size === recipe.steps.length ? ['#4CAF50', '#66BB6A'] : [C.primaryDark, C.primary] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${recipe.steps.length > 0 ? (checkedSteps.size / recipe.steps.length) * 100 : 0}%` as `${number}%` },
              ]}
            />
          </View>

          {/* Bake-Along Timers */}
          {stepTimers.length > 0 && (
            <View style={styles.bakeAlongContainer}>
              {!isBakeAlongActive ? (
                <Pressable style={styles.bakeAlongBtn} onPress={handleStartBakeAlong}>
                  <Ionicons name="play-circle" size={20} color={C.white} />
                  <Text style={styles.bakeAlongBtnText}>
                    Start Bake-Along ({stepTimers.length} timer{stepTimers.length !== 1 ? 's' : ''})
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.bakeAlongActiveCard}>
                  <View style={styles.bakeAlongActiveHeader}>
                    <View style={styles.bakeAlongActiveLeft}>
                      <Ionicons name="timer" size={18} color={C.primaryDark} />
                      <Text style={styles.bakeAlongActiveTitle}>Bake-Along Active</Text>
                    </View>
                    <Pressable style={styles.bakeAlongStopBtn} onPress={handleStopBakeAlong}>
                      <Ionicons name="close" size={16} color={C.error} />
                      <Text style={styles.bakeAlongStopText}>Stop</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.bakeAlongActiveInfo}>
                    {bakeAlongProgress.done}/{bakeAlongProgress.total} complete
                    {bakeAlongProgress.currentLabel ? ` — ${bakeAlongProgress.currentLabel}` : ''}
                  </Text>
                  {/* Chain progress dots */}
                  <View style={styles.bakeAlongDots}>
                    {chainTimers.map((ct, i) => {
                      const isDone = ct.remainingSeconds === 0 && ct.totalSeconds > 0;
                      const isActive = ct.isRunning;
                      return (
                        <View
                          key={ct.id}
                          style={[
                            styles.bakeAlongDot,
                            isDone && styles.bakeAlongDotDone,
                            isActive && styles.bakeAlongDotActive,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              )}
              <Text style={styles.bakeAlongHint}>
                Timers auto-chain: each starts when the previous finishes
              </Text>
            </View>
          )}

          {recipe.steps.map((step, i) => {
            const timersForStep = stepTimers.filter((st) => st.stepIndex === i);
            // Check if this step has an active chain timer
            const chainTimer = chainTimers.find((ct) => ct.stepIndex === i);
            const isChainStepDone = chainTimer && chainTimer.remainingSeconds === 0 && chainTimer.totalSeconds > 0;
            const isChainStepRunning = chainTimer?.isRunning;

            return (
              <View key={i}>
                <Pressable style={styles.stepRow} onPress={() => toggleStep(i)}>
                  <View style={[
                    styles.stepNumber,
                    { backgroundColor: C.primary },
                    checkedSteps.has(i) && { backgroundColor: C.primaryDark },
                    isChainStepRunning && { backgroundColor: C.primaryDark },
                    isChainStepDone && { backgroundColor: C.success },
                  ]}>
                    {checkedSteps.has(i) ? (
                      <Ionicons name="checkmark" size={14} color={C.white} />
                    ) : isChainStepDone ? (
                      <Ionicons name="checkmark" size={14} color={C.white} />
                    ) : (
                      <Text style={[styles.stepNumberText, { color: C.text }, isChainStepRunning && { color: C.white }]}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepText, { color: C.text }, checkedSteps.has(i) && { textDecorationLine: 'line-through', color: C.textLight }]}>{step}</Text>
                </Pressable>
                {/* Inline timer buttons for this step */}
                {timersForStep.length > 0 && !isBakeAlongActive && (
                  <View style={styles.stepTimerRow}>
                    {timersForStep.map((st, j) => (
                      <Pressable
                        key={j}
                        style={styles.stepTimerBtn}
                        onPress={() => handleAddStepTimer(st.stepIndex, st.label, st.seconds)}
                      >
                        <Ionicons name="timer-outline" size={13} color={C.primaryDark} />
                        <Text style={styles.stepTimerBtnText}>{st.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {/* Show chain timer status inline */}
                {chainTimer && isChainStepRunning && (
                  <View style={styles.stepTimerRow}>
                    <View style={styles.stepTimerActiveIndicator}>
                      <Ionicons name="timer" size={13} color={C.primaryDark} />
                      <Text style={styles.stepTimerActiveText}>
                        {formatChainTime(chainTimer.remainingSeconds)} remaining
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Tips */}
          {recipe.tips && (
            <View style={[styles.tipsBox, { backgroundColor: C.surfaceAlt, borderLeftColor: C.primary }]}>
              <Text style={[styles.tipsTitle, { color: C.text }]}>💡 Baker's Tips</Text>
              <Text style={[styles.tipsText, { color: C.textSecondary }]}>{recipe.tips}</Text>
            </View>
          )}

          {/* Timer */}
          <Pressable
            style={styles.timerToggle}
            onPress={() => setShowTimer(!showTimer)}
          >
            <Ionicons name="timer-outline" size={20} color={C.primaryDark} />
            <Text style={[styles.timerToggleText, { color: C.primaryDark }]}>
              {showTimer ? 'Hide Timer' : 'Show Baking Timer'}
            </Text>
          </Pressable>
          {showTimer && (
            <Timer
              defaultMinutes={recipe.bakeTime}
              prepTime={recipe.prepTime}
              bakeTime={recipe.bakeTime}
              recipeTitle={recipe.title}
            />
          )}

          {/* Personal Notes */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>My Notes</Text>
          <View style={styles.noteInputRow}>
            <TextInput
              style={[styles.noteInput, { color: C.text, backgroundColor: C.surface, borderColor: C.borderLight }]}
              placeholder="Add a note (e.g., 'Use less sugar next time')"
              placeholderTextColor={C.textLight}
              value={newNote}
              onChangeText={setNewNote}
            />
            <Pressable style={styles.noteAddBtn} onPress={handleAddNote}>
              <Ionicons name="add" size={20} color={C.white} />
            </Pressable>
          </View>
          {notes.map((note) => (
            <View key={note.id} style={[styles.noteCard, { backgroundColor: C.surface, borderColor: C.borderLight }]}>
              <Text style={[styles.noteText, { color: C.text }]}>{note.text}</Text>
              <View style={styles.noteFooter}>
                <Text style={[styles.noteDate, { color: C.textLight }]}>
                  {new Date(note.createdAt).toLocaleDateString('en-GB')}
                </Text>
                <Pressable onPress={() => deleteRecipeNote(note.id)} hitSlop={10}>
                  <Ionicons name="close-circle-outline" size={18} color={C.textLight} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Log Bake footer */}
      <View style={[styles.logBakeBar, { backgroundColor: C.background, borderTopColor: C.borderLight }]}>
        <Pressable style={styles.logBakeBtn} onPress={handleLogBake}>
          <Ionicons name="book-outline" size={18} color={C.white} />
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
          <View style={[styles.confirmBox, { backgroundColor: C.white }]}>
            <Text style={[styles.confirmTitle, { color: C.text }]}>Delete Recipe</Text>
            <Text style={[styles.confirmText, { color: C.textSecondary }]}>
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

      {/* Bake Mode */}
      <BakeMode
        visible={showBakeMode}
        onClose={() => setShowBakeMode(false)}
        steps={recipe.steps}
        recipeTitle={recipe.title}
        tips={recipe.tips}
      />

      {/* Share Action Sheet */}
      {showShareSheet && (
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: C.white }]}>
            <Text style={[styles.confirmTitle, { color: C.text }]}>Share Recipe</Text>
            <Text style={[styles.confirmText, { color: C.textSecondary }]}>
              Choose how to share "{recipe.title}"
            </Text>
            <Pressable
              style={styles.shareOption}
              onPress={() => doShare(false)}
            >
              <Ionicons name="document-text-outline" size={20} color={C.primaryDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.shareOptionTitle}>Share Summary</Text>
                <Text style={styles.shareOptionDesc}>Title, description & timing</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.shareOption}
              onPress={() => doShare(true)}
            >
              <Ionicons name="list-outline" size={20} color={C.primaryDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.shareOptionTitle}>Share Full Recipe</Text>
                <Text style={styles.shareOptionDesc}>Includes ingredients & steps</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, styles.confirmBtnCancel, { marginTop: Spacing.md }]}
              onPress={() => setShowShareSheet(false)}
            >
              <Text style={styles.confirmBtnCancelText}>Cancel</Text>
            </Pressable>
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
  stepsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  stepsProgress: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
    paddingBottom: 80,
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
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    ...Shadows.medium,
  },
  logBakeBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.white,
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
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  shareOptionTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
  },
  shareOptionDesc: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  /* ── Bake-Along Timers ── */
  bakeAlongContainer: {
    marginBottom: Spacing.md,
  },
  bakeAlongBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.full,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  bakeAlongBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  bakeAlongHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 6,
  },
  bakeAlongActiveCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '40',
  },
  bakeAlongActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bakeAlongActiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bakeAlongActiveTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.primaryDark,
  },
  bakeAlongStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.error + '15',
  },
  bakeAlongStopText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.error,
  },
  bakeAlongActiveInfo: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  bakeAlongDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  bakeAlongDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.borderLight,
  },
  bakeAlongDotDone: {
    backgroundColor: Colors.success,
  },
  bakeAlongDotActive: {
    backgroundColor: Colors.primaryDark,
  },

  /* ── Step timer inline buttons ── */
  stepTimerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 40,
    marginTop: -8,
    marginBottom: Spacing.md,
  },
  stepTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.primaryDark + '15',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '30',
  },
  stepTimerBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.primaryDark,
  },
  stepTimerActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.primaryDark + '20',
    borderRadius: Radius.full,
  },
  stepTimerActiveText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.primaryDark,
  },
  stepNumberRunning: {
    backgroundColor: Colors.primaryDark,
  },
  stepNumberChainDone: {
    backgroundColor: Colors.success,
  },

  /* ── Bake Mode button ── */
  bakeModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.primaryDark + '15',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '30',
  },
  bakeModeBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.primaryDark,
  },
});

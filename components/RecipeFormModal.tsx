import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { CategoryPill } from './CategoryPill';
import { useAppStore } from '../lib/store';
import { generateId, CATEGORIES, CATEGORY_EMOJIS } from '../lib/helpers';
import type { Recipe, Ingredient, RecipeCategory } from '../types/recipe';

interface Props {
  visible: boolean;
  onClose: () => void;
  editingRecipe?: Recipe;
}

const DIFFICULTIES: Recipe['difficulty'][] = ['Easy', 'Medium', 'Hard'];

const emptyIngredient = (): Ingredient => ({ name: '', amount: '', unit: '' });

export function RecipeFormModal({ visible, onClose, editingRecipe }: Props) {
  const addUserRecipe = useAppStore((s) => s.addUserRecipe);
  const updateUserRecipe = useAppStore((s) => s.updateUserRecipe);

  // Form state
  const [photo, setPhoto] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeCategory | ''>('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('Medium');
  const [prepTime, setPrepTime] = useState('');
  const [bakeTime, setBakeTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [tips, setTips] = useState('');

  const fileInputRef = useRef<any>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingRecipe) {
      setPhoto(editingRecipe.imageUrl || '');
      setTitle(editingRecipe.title);
      setCategory(editingRecipe.category);
      setDescription(editingRecipe.description);
      setDifficulty(editingRecipe.difficulty);
      setPrepTime(String(editingRecipe.prepTime));
      setBakeTime(String(editingRecipe.bakeTime));
      setServings(String(editingRecipe.servings));
      setIngredients(
        editingRecipe.ingredients.length > 0
          ? editingRecipe.ingredients
          : [emptyIngredient()]
      );
      setSteps(editingRecipe.steps.length > 0 ? editingRecipe.steps : ['']);
      setTips(editingRecipe.tips || '');
    } else {
      resetForm();
    }
  }, [editingRecipe, visible]);

  const resetForm = () => {
    setPhoto('');
    setTitle('');
    setCategory('');
    setDescription('');
    setDifficulty('Medium');
    setPrepTime('');
    setBakeTime('');
    setServings('');
    setIngredients([emptyIngredient()]);
    setSteps(['']);
    setTips('');
  };

  // ── Photo picking ──────────────────────────────────────────────────
  const fileToBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const pickPhoto = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleWebFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUri = await fileToBase64(file);
      setPhoto(dataUri);
    }
    e.target.value = '';
  };

  // ── Dynamic ingredients ────────────────────────────────────────────
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const addIngredient = () => setIngredients((prev) => [...prev, emptyIngredient()]);

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Dynamic steps ──────────────────────────────────────────────────
  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, '']);

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a recipe title.');
      return;
    }
    if (!category) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Missing ingredients', 'Please add at least one ingredient.');
      return;
    }
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      Alert.alert('Missing steps', 'Please add at least one step.');
      return;
    }

    const prep = parseInt(prepTime, 10) || 0;
    const bake = parseInt(bakeTime, 10) || 0;

    const recipe: Recipe = {
      id: editingRecipe ? editingRecipe.id : `user-${generateId()}`,
      title: title.trim(),
      category: category as RecipeCategory,
      description: description.trim(),
      ingredients: validIngredients,
      steps: validSteps,
      prepTime: prep,
      bakeTime: bake,
      totalTime: prep + bake,
      difficulty,
      servings: parseInt(servings, 10) || 4,
      imageUrl: photo,
      tips: tips.trim() || undefined,
      isUserRecipe: true,
    };

    if (editingRecipe) {
      updateUserRecipe(recipe);
    } else {
      addUserRecipe(recipe);
    }
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} hitSlop={12}>
            <Text style={styles.headerCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
          </Text>
          <Pressable onPress={handleSave} hitSlop={12}>
            <Text style={styles.headerSave}>Save</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Photo */}
            <Pressable style={styles.photoArea} onPress={pickPhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImage} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={36} color={Colors.textLight} />
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
            </Pressable>
            {Platform.OS === 'web' && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleWebFileChange}
              />
            )}

            {/* Title */}
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Lemon Drizzle Cake"
              placeholderTextColor={Colors.textLight}
            />

            {/* Category */}
            <Text style={styles.label}>Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}
            >
              {CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  emoji={CATEGORY_EMOJIS[cat]}
                  isActive={category === cat}
                  onPress={() => setCategory(cat as RecipeCategory)}
                />
              ))}
            </ScrollView>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of the recipe..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            {/* Difficulty */}
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.pillRow}>
              {DIFFICULTIES.map((d) => (
                <Pressable
                  key={d}
                  style={[styles.diffPill, difficulty === d && styles.diffPillActive]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text
                    style={[styles.diffText, difficulty === d && styles.diffTextActive]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Times & Servings */}
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Prep (min)</Text>
                <TextInput
                  style={styles.input}
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="30"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Bake (min)</Text>
                <TextInput
                  style={styles.input}
                  value={bakeTime}
                  onChangeText={setBakeTime}
                  placeholder="45"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  style={styles.input}
                  value={servings}
                  onChangeText={setServings}
                  placeholder="8"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Ingredients */}
            <Text style={styles.label}>Ingredients *</Text>
            {ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <TextInput
                  style={[styles.input, styles.ingAmount]}
                  value={ing.amount}
                  onChangeText={(v) => updateIngredient(i, 'amount', v)}
                  placeholder="200"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.ingUnit]}
                  value={ing.unit || ''}
                  onChangeText={(v) => updateIngredient(i, 'unit', v)}
                  placeholder="g"
                  placeholderTextColor={Colors.textLight}
                />
                <TextInput
                  style={[styles.input, styles.ingName]}
                  value={ing.name}
                  onChangeText={(v) => updateIngredient(i, 'name', v)}
                  placeholder="plain flour"
                  placeholderTextColor={Colors.textLight}
                />
                {ingredients.length > 1 && (
                  <Pressable onPress={() => removeIngredient(i)} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable style={styles.addBtn} onPress={addIngredient}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.addBtnText}>Add Ingredient</Text>
            </Pressable>

            {/* Steps */}
            <Text style={styles.label}>Steps *</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.stepInput]}
                  value={step}
                  onChangeText={(v) => updateStep(i, v)}
                  placeholder={`Step ${i + 1}...`}
                  placeholderTextColor={Colors.textLight}
                  multiline
                />
                {steps.length > 1 && (
                  <Pressable onPress={() => removeStep(i)} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable style={styles.addBtn} onPress={addStep}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.addBtnText}>Add Step</Text>
            </Pressable>

            {/* Tips */}
            <Text style={styles.label}>Tips (optional)</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={tips}
              onChangeText={setTips}
              placeholder="Any helpful tips..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerCancel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    color: Colors.text,
  },
  headerSave: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.primaryDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  photoArea: {
    width: '100%',
    height: 180,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm + 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  diffPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  diffPillActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  diffText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  diffTextActive: {
    color: Colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ingAmount: {
    width: 60,
    textAlign: 'center',
  },
  ingUnit: {
    width: 48,
    textAlign: 'center',
  },
  ingName: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  stepNumberText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.white,
  },
  stepInput: {
    flex: 1,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.primaryDark,
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useTheme } from '../lib/useTheme';
import { useAllRecipes } from '../lib/recipes';

export interface FilterOptions {
  maxTotalTime: number | null;    // in minutes, null = any
  dietaryTags: string[];          // empty = any
  flavourTags: string[];          // empty = any
  seasonTags: string[];           // empty = any
  maxIngredients: number | null;  // null = any
  maxServings: number | null;     // null = any
}

export const EMPTY_FILTERS: FilterOptions = {
  maxTotalTime: null,
  dietaryTags: [],
  flavourTags: [],
  seasonTags: [],
  maxIngredients: null,
  maxServings: null,
};

/**
 * Count how many active (non-default) filters are set.
 */
export function countActiveFilters(filters: FilterOptions): number {
  let count = 0;
  if (filters.maxTotalTime !== null) count++;
  if (filters.dietaryTags.length > 0) count++;
  if (filters.flavourTags.length > 0) count++;
  if (filters.seasonTags.length > 0) count++;
  if (filters.maxIngredients !== null) count++;
  if (filters.maxServings !== null) count++;
  return count;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

const TIME_OPTIONS = [
  { label: 'Under 15m', value: 15 },
  { label: 'Under 30m', value: 30 },
  { label: 'Under 45m', value: 45 },
  { label: 'Under 1h', value: 60 },
  { label: 'Under 2h', value: 120 },
  { label: '2h+', value: null as number | null },
];

const INGREDIENT_OPTIONS = [
  { label: 'Simple (<6)', value: 6 },
  { label: 'Medium (<10)', value: 10 },
  { label: 'Any', value: null as number | null },
];

const SERVINGS_OPTIONS = [
  { label: '1–2', value: 2 },
  { label: '4–6', value: 6 },
  { label: '8–10', value: 10 },
  { label: '12+', value: null as number | null },
];

export function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const { colors: C } = useTheme();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const allRecipes = useAllRecipes();

  // Extract all unique tags from recipe data
  const allDietaryTags = useMemo(() => {
    const tags = new Set<string>();
    allRecipes.forEach((r) => r.dietaryTags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [allRecipes]);

  const allFlavourTags = useMemo(() => {
    const tags = new Set<string>();
    allRecipes.forEach((r) => r.flavourTags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [allRecipes]);

  const allSeasonTags = useMemo(() => {
    const tags = new Set<string>();
    allRecipes.forEach((r) => r.seasonTags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [allRecipes]);

  // Reset local filters when opened
  React.useEffect(() => {
    if (visible) setLocalFilters(filters);
  }, [visible, filters]);

  const toggleTag = (field: 'dietaryTags' | 'flavourTags' | 'seasonTags', tag: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(tag)
        ? prev[field].filter((t: string) => t !== tag)
        : [...prev[field], tag],
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters(EMPTY_FILTERS);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={[styles.header, { borderBottomColor: C.borderLight }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.cancelText, { color: C.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.title, { color: C.text }]}>Filters</Text>
          <Pressable onPress={handleApply}>
            <Text style={[styles.applyText, { color: C.primaryDark }]}>Apply</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Flavour */}
          {allFlavourTags.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: C.text }]}>Flavour</Text>
              <View style={styles.pillRow}>
                {allFlavourTags.map((tag) => {
                  const isSelected = localFilters.flavourTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => toggleTag('flavourTags', tag)}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color={C.white} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Season / Occasion */}
          {allSeasonTags.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: C.text }]}>Season & Occasion</Text>
              <View style={styles.pillRow}>
                {allSeasonTags.map((tag) => {
                  const isSelected = localFilters.seasonTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => toggleTag('seasonTags', tag)}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color={C.white} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Max Time */}
          <Text style={[styles.sectionLabel, { color: C.text }]}>Maximum Time</Text>
          <View style={styles.pillRow}>
            {TIME_OPTIONS.map((opt) => {
              const isSelected = localFilters.maxTotalTime === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setLocalFilters((prev) => ({ ...prev, maxTotalTime: opt.value }))}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Servings */}
          <Text style={[styles.sectionLabel, { color: C.text }]}>Servings</Text>
          <View style={styles.pillRow}>
            {SERVINGS_OPTIONS.map((opt) => {
              const isSelected = localFilters.maxServings === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setLocalFilters((prev) => ({ ...prev, maxServings: opt.value }))}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dietary Tags */}
          {allDietaryTags.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: C.text }]}>Dietary</Text>
              <View style={styles.pillRow}>
                {allDietaryTags.map((tag) => {
                  const isSelected = localFilters.dietaryTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => toggleTag('dietaryTags', tag)}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color={C.white} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Ingredient Count */}
          <Text style={[styles.sectionLabel, { color: C.text }]}>Number of Ingredients</Text>
          <View style={styles.pillRow}>
            {INGREDIENT_OPTIONS.map((opt) => {
              const isSelected = localFilters.maxIngredients === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setLocalFilters((prev) => ({ ...prev, maxIngredients: opt.value }))}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Clear All */}
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Ionicons name="refresh-outline" size={16} color={C.textSecondary} />
            <Text style={styles.clearBtnText}>Clear All Filters</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  applyText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.primaryDark,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillSelected: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  pillText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.text,
  },
  pillTextSelected: {
    color: Colors.white,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  clearBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

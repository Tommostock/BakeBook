import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { useAllRecipes } from '../../lib/recipes';
import { CATEGORY_EMOJIS, DIFFICULTY_COLORS } from '../../lib/helpers';
import { computeSkillStats, computeAchievements } from '../../lib/skills';
import { SkillProgressCard } from '../../components/SkillProgressCard';
import { BadgeGrid } from '../../components/BadgeGrid';
import type { RecipeCategory } from '../../types/recipe';

const DIFFICULTY_EMOJIS: Record<string, string> = {
  Easy: '🟢',
  Medium: '🟠',
  Hard: '🔴',
};

export default function ProfileScreen() {
  const favorites = useAppStore((s) => s.favorites);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const allRecipes = useAllRecipes();
  const userRecipes = useAppStore((s) => s.userRecipes);

  const skills = useMemo(
    () => computeSkillStats(journalEntries, allRecipes),
    [journalEntries, allRecipes]
  );

  const achievements = useMemo(
    () => computeAchievements(journalEntries, allRecipes),
    [journalEntries, allRecipes]
  );

  const hasBakes = journalEntries.length > 0;

  // Sort categories by bake count (descending)
  const sortedCategories = useMemo(() => {
    return Object.entries(skills.byCategory)
      .sort(([, a], [, b]) => b.count - a.count);
  }, [skills.byCategory]);

  const stats = [
    { label: 'Total Recipes', value: allRecipes.length, icon: 'book-outline' as const },
    { label: 'My Recipes', value: userRecipes.length, icon: 'create-outline' as const },
    { label: 'Favorites', value: favorites.length, icon: 'heart-outline' as const },
    { label: 'Journal Entries', value: journalEntries.length, icon: 'pencil-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Ionicons name="trophy" size={52} color={Colors.primaryDark} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.name}>Suzie Stock</Text>
          <Text style={styles.tagline}>2 x London Bake Off Champion</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color={Colors.primaryDark} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Your Baking Journey ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Baking Journey</Text>

          {!hasBakes ? (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles-outline" size={36} color={Colors.textLight} />
              <Text style={styles.emptyText}>Start baking to earn badges!</Text>
              <Text style={styles.emptySubtext}>
                Log your bakes in the Journal to track your skills and unlock achievements.
              </Text>
            </View>
          ) : (
            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{skills.totalBakes}</Text>
                <Text style={styles.overviewLabel}>Total Bakes</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{skills.uniqueRecipesBaked}</Text>
                <Text style={styles.overviewLabel}>Unique Recipes</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>
                  {skills.averageRating > 0 ? skills.averageRating.toFixed(1) : '–'}
                </Text>
                <Text style={styles.overviewLabel}>Avg Rating</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Achievements ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <BadgeGrid achievements={achievements} />
        </View>

        {/* ── Skills by Category ── */}
        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills by Category</Text>
            <View style={styles.cardList}>
              {sortedCategories.map(([category, stat]) => (
                <SkillProgressCard
                  key={category}
                  label={category}
                  emoji={CATEGORY_EMOJIS[category as RecipeCategory] || '🍴'}
                  stat={stat}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Skills by Difficulty ── */}
        {hasBakes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills by Difficulty</Text>
            <View style={styles.cardList}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <SkillProgressCard
                  key={diff}
                  label={diff}
                  emoji={DIFFICULTY_EMOJIS[diff]}
                  stat={skills.byDifficulty[diff]}
                  accentColor={DIFFICULTY_COLORS[diff]}
                />
              ))}
            </View>
          </View>
        )}

        <Text style={styles.version}>
          Suzie's BakeBook v1.0.0{'\n'}
          Made with ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surfaceAlt,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  name: {
    fontFamily: Fonts.calligraphy,
    fontSize: 46,
    color: Colors.primaryDark,
  },
  tagline: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 24,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
  },
  emptyText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
  },

  // Overview row
  overviewRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 22,
    color: Colors.primaryDark,
  },
  overviewLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overviewDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },

  // Card list
  cardList: {
    gap: Spacing.sm,
  },

  version: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    lineHeight: 20,
  },
});

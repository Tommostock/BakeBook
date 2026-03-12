import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { useAllRecipes } from '../../lib/recipes';
import { CATEGORY_EMOJIS, DIFFICULTY_COLORS } from '../../lib/helpers';
import { computeSkillStats, computeAchievements } from '../../lib/skills';
import { SkillProgressCard } from '../../components/SkillProgressCard';
import { BadgeGrid } from '../../components/BadgeGrid';
import { BakeryFrame } from '../../components/BakeryFrame';
import { BakeryCollage } from '../../components/BakeryCollage';
import type { RecipeCategory } from '../../types/recipe';

// Shiny pink trophy SVG with gradient highlight
const TROPHY_SVG = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF8EC7"/>
      <stop offset="30%" stop-color="#FFB6D9"/>
      <stop offset="50%" stop-color="#FF8EC7"/>
      <stop offset="70%" stop-color="#F06292"/>
      <stop offset="100%" stop-color="#E91E8C"/>
    </linearGradient>
    <linearGradient id="shine" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="white" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="white" stop-opacity="0"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F06292"/>
      <stop offset="100%" stop-color="#C2185B"/>
    </linearGradient>
  </defs>
  <!-- Cup body -->
  <path d="M22 16 L22 38 C22 48 30 54 40 54 C50 54 58 48 58 38 L58 16 Z" fill="url(#pink)" stroke="#C2185B" stroke-width="1"/>
  <!-- Shine overlay on cup -->
  <path d="M26 18 L26 36 C26 44 32 50 40 50 C42 50 44 49 46 48 L46 18 Z" fill="url(#shine)"/>
  <!-- Left handle -->
  <path d="M22 22 C14 22 10 28 10 34 C10 40 14 44 22 44" stroke="url(#pink)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M22 22 C14 22 10 28 10 34 C10 40 14 44 22 44" stroke="#C2185B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Right handle -->
  <path d="M58 22 C66 22 70 28 70 34 C70 40 66 44 58 44" stroke="url(#pink)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M58 22 C66 22 70 28 70 34 C70 40 66 44 58 44" stroke="#C2185B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Stem -->
  <rect x="36" y="54" width="8" height="8" fill="url(#pink)" stroke="#C2185B" stroke-width="0.8"/>
  <!-- Base -->
  <rect x="28" y="62" width="24" height="5" rx="2" fill="url(#base)" stroke="#C2185B" stroke-width="0.8"/>
  <!-- Rim -->
  <rect x="20" y="14" width="40" height="4" rx="2" fill="url(#pink)" stroke="#C2185B" stroke-width="0.8"/>
  <!-- Star on cup -->
  <path d="M40 28 L42 33 L47 33 L43 36.5 L44.5 42 L40 38.5 L35.5 42 L37 36.5 L33 33 L38 33 Z" fill="white" opacity="0.9"/>
  <!-- Sparkle top-right -->
  <g transform="translate(60,12)">
    <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFB6D9" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFB6D9" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#FFB6D9" stroke-width="1" stroke-linecap="round"/>
    <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" stroke="#FFB6D9" stroke-width="1" stroke-linecap="round"/>
  </g>
  <!-- Sparkle top-left -->
  <g transform="translate(16,10) scale(0.7)">
    <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFB6D9" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFB6D9" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  <!-- Sparkle right -->
  <g transform="translate(72,24) scale(0.6)">
    <line x1="0" y1="-3" x2="0" y2="3" stroke="#FF8EC7" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-3" y1="0" x2="3" y2="0" stroke="#FF8EC7" stroke-width="1.5" stroke-linecap="round"/>
  </g>
</svg>`;

const TROPHY_URI = `data:image/svg+xml,${encodeURIComponent(TROPHY_SVG)}`;

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
        {/* Profile Header — matches home page hero style */}
        <View style={styles.hero}>
          <BakeryCollage />
          <BakeryFrame width={260} contentPaddingVertical={12}>
            <View style={styles.brandContainer}>
              <Text style={styles.name}>Suzie Stock</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.tagline}>2 x London Bake Off Champion</Text>
            <Image
              source={{ uri: TROPHY_URI }}
              style={styles.trophy}
              contentFit="contain"
            />
          </BakeryFrame>
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
  hero: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  brandContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: -4,
  },
  name: {
    fontFamily: Fonts.calligraphy,
    fontSize: 34,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  divider: {
    width: 44,
    height: 2,
    backgroundColor: Colors.primary,
    marginVertical: 6,
    borderRadius: 1,
  },
  tagline: {
    fontFamily: Fonts.calligraphy,
    fontSize: 14,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  trophy: {
    width: 38,
    height: 38,
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

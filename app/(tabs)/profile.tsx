import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { useAllRecipes } from '../../lib/recipes';
import { CATEGORY_EMOJIS, DIFFICULTY_COLORS } from '../../lib/helpers';
import { computeSkillStats, computeAchievements } from '../../lib/skills';
import { computeBakerLevel } from '../../lib/levels';
import { SkillProgressCard } from '../../components/SkillProgressCard';
import { BadgeGrid } from '../../components/BadgeGrid';
import { AnimatedEntry } from '../../components/AnimatedEntry';
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

  // Baker Level (#39)
  const bakerLevel = useMemo(
    () => computeBakerLevel(journalEntries, allRecipes, achievements),
    [journalEntries, allRecipes, achievements]
  );

  const hasBakes = journalEntries.length > 0;

  const sortedCategories = useMemo(() => {
    return Object.entries(skills.byCategory)
      .sort(([, a], [, b]) => b.count - a.count);
  }, [skills.byCategory]);

  const stats = [
    { label: 'Total Recipes', value: allRecipes.length, icon: 'book-outline' as const },
    { label: 'My Recipes', value: userRecipes.length, icon: 'create-outline' as const },
    { label: 'Favourites', value: favorites.length, icon: 'heart-outline' as const },
    { label: 'Journal Entries', value: journalEntries.length, icon: 'pencil-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Page Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* About Card */}
        <AnimatedEntry delay={0}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutName}>Suzie Stock</Text>
            <View style={styles.aboutChampRow}>
              <Ionicons name="trophy" size={16} color={Colors.primaryDark} />
              <Text style={styles.aboutChamp}>2 x London Bake Off Champion</Text>
              <Ionicons name="trophy" size={16} color={Colors.primaryDark} />
            </View>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutDedication}>
              For our beautiful mum,{'\n'}Love Harry & Oliver
            </Text>
          </View>
        </AnimatedEntry>

        {/* Baker Level Card (#39) */}
        <AnimatedEntry delay={50}>
          <View style={styles.levelCard}>
            <LinearGradient
              colors={[Colors.primaryDark, '#D48BA6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.levelGradient}
            >
              <View style={styles.levelTopRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelNumber}>{bakerLevel.level}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelTitle}>{bakerLevel.title}</Text>
                  <Text style={styles.levelXP}>{bakerLevel.totalXP} XP earned</Text>
                </View>
              </View>
              <View style={styles.levelProgressTrack}>
                <View
                  style={[
                    styles.levelProgressFill,
                    { width: `${bakerLevel.progress * 100}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.levelProgressText}>
                {bakerLevel.currentXP}/{bakerLevel.xpForNextLevel} XP to Level {bakerLevel.level + 1}
              </Text>
            </LinearGradient>
          </View>
        </AnimatedEntry>

        {/* Stats */}
        <AnimatedEntry delay={100}>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color={Colors.primaryDark} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </AnimatedEntry>

        {/* Your Baking Journey */}
        <AnimatedEntry delay={150}>
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
        </AnimatedEntry>

        {/* Achievements */}
        <AnimatedEntry delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <BadgeGrid achievements={achievements} />
          </View>
        </AnimatedEntry>

        {/* Skills by Category */}
        {sortedCategories.length > 0 && (
          <AnimatedEntry delay={250}>
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
          </AnimatedEntry>
        )}

        {/* Skills by Difficulty */}
        {hasBakes && (
          <AnimatedEntry delay={300}>
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
          </AnimatedEntry>
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

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.3,
  },

  /* About card */
  aboutCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.soft,
  },
  aboutName: {
    fontFamily: Fonts.calligraphy,
    fontSize: 32,
    color: Colors.primaryDark,
  },
  aboutChampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  aboutChamp: {
    fontFamily: Fonts.serifRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  aboutDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  aboutDedication: {
    fontFamily: Fonts.serifRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  /* Level Card (#39) */
  levelCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  levelGradient: {
    padding: Spacing.lg,
  },
  levelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  levelNumber: {
    fontFamily: Fonts.sansBold,
    fontSize: 22,
    color: Colors.white,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.white,
  },
  levelXP: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  levelProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  levelProgressText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    textAlign: 'right',
  },

  /* Stats */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.soft,
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
    fontSize: 22,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    ...Shadows.soft,
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
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.soft,
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

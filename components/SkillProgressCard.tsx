import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import type { SkillStat } from '../lib/skills';

interface Props {
  label: string;
  emoji: string;
  stat: SkillStat;
  accentColor?: string;
}

export function SkillProgressCard({ label, emoji, stat, accentColor = Colors.primaryDark }: Props) {
  const { count, badge, nextBadge, recipesNeeded } = stat;

  // Progress toward next badge (0–1)
  const prevThreshold = badge?.threshold ?? 0;
  const nextThreshold = nextBadge?.threshold ?? prevThreshold;
  const range = nextThreshold - prevThreshold;
  const progress = range > 0 ? (count - prevThreshold) / range : 1;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.labelCol}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.countText}>
            {count} {count === 1 ? 'bake' : 'bakes'}
          </Text>
        </View>
        {badge && (
          <View style={styles.badgeChip}>
            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      {nextBadge && (
        <View style={styles.progressArea}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {recipesNeeded} more to {nextBadge.emoji} {nextBadge.name}
          </Text>
        </View>
      )}

      {!nextBadge && count > 0 && (
        <Text style={[styles.progressText, { marginTop: Spacing.xs, color: accentColor }]}>
          🏆 Max level reached!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  labelCol: {
    flex: 1,
  },
  label: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  countText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  progressArea: {
    marginTop: Spacing.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

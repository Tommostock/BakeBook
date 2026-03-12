import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import type { Achievement } from '../lib/skills';

interface Props {
  achievements: Achievement[];
}

const GRID_COLUMNS = 3;
const GRID_GAP = Spacing.sm;
const SCREEN_PADDING = Spacing.lg * 2; // left + right
const CARD_WIDTH =
  (Dimensions.get('window').width - SCREEN_PADDING - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export function BadgeGrid({ achievements }: Props) {
  return (
    <View style={styles.grid}>
      {achievements.map((a) => (
        <View key={a.id} style={[styles.badge, !a.earned && styles.badgeLocked]}>
          <View style={styles.iconArea}>
            {a.earned ? (
              <Text style={styles.emoji}>{a.emoji}</Text>
            ) : (
              <Ionicons name="lock-closed" size={20} color={Colors.textLight} />
            )}
          </View>
          <Text
            style={[styles.name, !a.earned && styles.nameLocked]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {a.name}
          </Text>
          <Text
            style={[styles.desc, !a.earned && styles.descLocked]}
            numberOfLines={2}
          >
            {a.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  badge: {
    width: CARD_WIDTH,
    height: 110,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  badgeLocked: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
  },
  iconArea: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 22,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  nameLocked: {
    color: Colors.textLight,
  },
  desc: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  descLocked: {
    color: Colors.textLight,
  },
});

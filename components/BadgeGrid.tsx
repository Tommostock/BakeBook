import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import type { Achievement } from '../lib/skills';

interface Props {
  achievements: Achievement[];
}

export function BadgeGrid({ achievements }: Props) {
  return (
    <View style={styles.grid}>
      {achievements.map((a) => (
        <View key={a.id} style={[styles.badge, !a.earned && styles.badgeLocked]}>
          <Text style={[styles.emoji, !a.earned && styles.emojiLocked]}>
            {a.earned ? a.emoji : ''}
          </Text>
          {!a.earned && (
            <Ionicons
              name="lock-closed"
              size={20}
              color={Colors.textLight}
              style={styles.lockIcon}
            />
          )}
          <Text
            style={[styles.name, !a.earned && styles.nameLocked]}
            numberOfLines={1}
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
    gap: Spacing.sm,
  },
  badge: {
    width: '30%',
    minHeight: 110,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  badgeLocked: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emojiLocked: {
    opacity: 0,
  },
  lockIcon: {
    position: 'absolute',
    top: Spacing.md,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  nameLocked: {
    color: Colors.textLight,
  },
  desc: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
  descLocked: {
    color: Colors.textLight,
  },
});

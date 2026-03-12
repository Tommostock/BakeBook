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
          {/* Icon area — fixed height, always centered */}
          <View style={styles.iconArea}>
            {a.earned ? (
              <Text style={styles.emoji}>{a.emoji}</Text>
            ) : (
              <Ionicons name="lock-closed" size={22} color={Colors.textLight} />
            )}
          </View>
          {/* Name — single line, consistent */}
          <Text
            style={[styles.name, !a.earned && styles.nameLocked]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {a.name}
          </Text>
          {/* Description — exactly 2 lines reserved */}
          <View style={styles.descArea}>
            <Text
              style={[styles.desc, !a.earned && styles.descLocked]}
              numberOfLines={2}
            >
              {a.description}
            </Text>
          </View>
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
    height: 112,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  badgeLocked: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
  },
  iconArea: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 24,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  nameLocked: {
    color: Colors.textLight,
  },
  descArea: {
    height: 28,
    justifyContent: 'flex-start',
  },
  desc: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  descLocked: {
    color: Colors.textLight,
  },
});

import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

interface CategoryPillProps {
  label: string;
  emoji: string;
  isSelected?: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, emoji, isSelected, onPress }: CategoryPillProps) {
  return (
    <Pressable
      style={[styles.pill, isSelected && styles.pillSelected]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.black,
    fontFamily: Fonts.sansSemiBold,
  },
});

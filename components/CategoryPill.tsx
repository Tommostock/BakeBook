import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../constants/theme';
import { useTheme } from '../lib/useTheme';

interface CategoryPillProps {
  label: string;
  emoji: string;
  isSelected?: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, emoji, isSelected, onPress }: CategoryPillProps) {
  const { colors: C, shadows: S } = useTheme();
  return (
    <Pressable
      style={[
        styles.pill,
        { backgroundColor: C.white, borderColor: C.borderLight },
        S.soft,
        isSelected && { backgroundColor: C.primary, borderColor: C.primaryDark },
      ]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: C.text }, isSelected && { color: C.black }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
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
  },
});

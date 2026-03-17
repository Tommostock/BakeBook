import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { useTheme } from '../lib/useTheme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const { colors: C } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: C.text }]}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: C.primaryDark }]}>See All →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.primaryDark,
  },
});

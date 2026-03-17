import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Shadows } from '../constants/theme';
import { useTheme } from '../lib/useTheme';
import type { Achievement } from '../lib/skills';

interface Props {
  achievements: Achievement[];
}

const GRID_COLUMNS = 3;
const GRID_GAP = Spacing.sm;
const SCREEN_PADDING = Spacing.lg * 2;
const CARD_WIDTH =
  (Dimensions.get('window').width - SCREEN_PADDING - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

// Animated badge with scale-in + glow for earned badges (#37)
function AnimatedBadge({ achievement, index }: { achievement: Achievement; index: number }) {
  const { colors: C, shadows: S } = useTheme();
  const scaleAnim = useRef(new Animated.Value(achievement.earned ? 0.5 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (achievement.earned) {
      // Entrance animation
      Animated.sequence([
        Animated.delay(index * 80),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Subtle glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [achievement.earned]);

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: C.white, borderColor: C.primaryDark },
        S.soft,
        !achievement.earned && { backgroundColor: C.surface, borderColor: C.borderLight, borderWidth: 1 },
        achievement.earned && {
          transform: [{ scale: scaleAnim }],
          borderColor: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [C.primaryDark, C.primary] as [string, string],
          }) as any,
        },
      ]}
    >
      <View style={styles.iconArea}>
        {achievement.earned ? (
          <Text style={styles.emoji}>{achievement.emoji}</Text>
        ) : (
          <Ionicons name="lock-closed" size={20} color={C.textLight} />
        )}
      </View>
      <Text
        style={[styles.name, { color: C.text }, !achievement.earned && { color: C.textLight }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {achievement.name}
      </Text>
      <Text
        style={[styles.desc, { color: C.textSecondary }, !achievement.earned && { color: C.textLight }]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>
    </Animated.View>
  );
}

export function BadgeGrid({ achievements }: Props) {
  return (
    <View style={styles.grid}>
      {achievements.map((a, index) => (
        <AnimatedBadge key={a.id} achievement={a} index={index} />
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
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
    ...Shadows.soft,
  },
  badgeLocked: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    borderWidth: 1,
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

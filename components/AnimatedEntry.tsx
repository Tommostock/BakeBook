import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedEntryProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  slideFrom?: 'bottom' | 'left' | 'right' | 'none';
  slideDistance?: number;
}

export function AnimatedEntry({
  children,
  delay = 0,
  duration = 400,
  style,
  slideFrom = 'bottom',
  slideDistance = 20,
}: AnimatedEntryProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ];

    if (slideFrom !== 'none') {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, []);

  const translateStyle =
    slideFrom === 'bottom'
      ? { translateY: slideAnim }
      : slideFrom === 'left'
      ? { translateX: Animated.multiply(slideAnim, -1) }
      : slideFrom === 'right'
      ? { translateX: slideAnim }
      : {};

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: slideFrom !== 'none' ? [translateStyle as any] : [],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

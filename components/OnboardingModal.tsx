import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface OnboardingCard {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
}

const CARDS: OnboardingCard[] = [
  {
    icon: 'cafe-outline',
    title: "Suzie's",
    subtitle: 'BAKEBOOK',
    description: 'Your personal collection of 110+ baking recipes, handpicked for every occasion.',
  },
  {
    icon: 'search-outline',
    title: 'Browse & Search',
    subtitle: '',
    description: 'Explore categories from bread to cakes, filter by difficulty, time, and dietary needs.',
  },
  {
    icon: 'book-outline',
    title: 'Journal & Notes',
    subtitle: '',
    description: 'Track your bakes with photos, ratings, and personal notes. Watch your skills grow!',
  },
  {
    icon: 'create-outline',
    title: 'Create & Share',
    subtitle: '',
    description: 'Add your own recipes, scale servings, convert units, and share with friends and family.',
  },
];

export function OnboardingModal() {
  const { width } = useWindowDimensions();
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (hasSeenOnboarding) return null;

  const dismiss = () => setHasSeenOnboarding(true);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  const goToPage = (page: number) => {
    scrollRef.current?.scrollTo({ x: page * width, animated: true });
    setCurrentPage(page);
  };

  const isLastPage = currentPage === CARDS.length - 1;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.container, { width: width * 0.9, maxWidth: 400 }]}>
          {/* Skip button */}
          <Pressable style={styles.skipBtn} onPress={dismiss}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          {/* Scrollable cards */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: '100%' }}
          >
            {CARDS.map((card, index) => (
              <View key={index} style={[styles.card, { width: width * 0.9 > 400 ? 400 : width * 0.9 }]}>
                {/* Icon area */}
                <View style={styles.iconArea}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={card.icon} size={48} color={Colors.primaryDark} />
                  </View>
                </View>

                {/* Text area */}
                <View style={styles.textArea}>
                  {index === 0 ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.welcomeCalligraphy}>{card.title}</Text>
                      <Text style={styles.welcomeSerif}>{card.subtitle}</Text>
                    </View>
                  ) : (
                    <Text style={styles.cardTitle}>{card.title}</Text>
                  )}
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom: dots + button */}
          <View style={styles.bottom}>
            <View style={styles.dotRow}>
              {CARDS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === currentPage && styles.dotActive]}
                />
              ))}
            </View>

            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                if (isLastPage) {
                  dismiss();
                } else {
                  goToPage(currentPage + 1);
                }
              }}
            >
              <Text style={styles.actionBtnText}>
                {isLastPage ? 'Get Started' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  skipBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  iconArea: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  textArea: {
    alignItems: 'center',
  },
  welcomeCalligraphy: {
    fontFamily: Fonts.calligraphy,
    fontSize: 48,
    color: Colors.primaryDark,
    marginBottom: -12,
  },
  welcomeSerif: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 6,
  },
  cardTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  bottom: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primaryDark,
  },
  actionBtn: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    color: Colors.white,
  },
});

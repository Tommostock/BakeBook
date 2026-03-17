import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useTheme } from '../lib/useTheme';
import { parseStepTimers, StepTimer } from '../lib/stepTimers';
import { useTimerStore } from '../lib/timerStore';
import { generateId } from '../lib/helpers';

interface BakeModeProps {
  visible: boolean;
  onClose: () => void;
  steps: string[];
  recipeTitle: string;
  tips?: string;
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BakeMode({ visible, onClose, steps, recipeTitle, tips }: BakeModeProps) {
  const { colors: C } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { height: screenHeight } = useWindowDimensions();

  const addTimer = useTimerStore((s) => s.addTimer);
  const startTimer = useTimerStore((s) => s.startTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);
  const removeChain = useTimerStore((s) => s.removeChain);
  const allTimers = useTimerStore((s) => s.timers);

  // Parse timers for all steps
  const stepTimers = useMemo(() => parseStepTimers(steps), [steps]);

  // Timers for the current step
  const currentStepTimers = useMemo(
    () => stepTimers.filter((st) => st.stepIndex === currentStep),
    [stepTimers, currentStep]
  );

  // Active bake-mode timers (tagged with bake-mode prefix)
  const bakeModeTimers = useMemo(
    () => allTimers.filter((t) => t.chainId === 'bake-mode'),
    [allTimers]
  );

  // Current step's active timer
  const activeStepTimer = useMemo(
    () => bakeModeTimers.find((t) => t.stepIndex === currentStep),
    [bakeModeTimers, currentStep]
  );

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const allDone = completedSteps.size === steps.length;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [visible]);

  const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: false,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleNext = () => {
    if (isLastStep) return;
    // Mark current step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    animateTransition('next', () => setCurrentStep((s) => s + 1));
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    animateTransition('prev', () => setCurrentStep((s) => s - 1));
  };

  const handleGoToStep = (index: number) => {
    if (index === currentStep) return;
    animateTransition(index > currentStep ? 'next' : 'prev', () => setCurrentStep(index));
  };

  const handleStartStepTimer = (st: StepTimer) => {
    const timerId = generateId();
    addTimer({
      id: timerId,
      label: st.label,
      totalSeconds: st.seconds,
      remainingSeconds: st.seconds,
      recipeTitle,
      chainId: 'bake-mode',
      stepIndex: st.stepIndex,
    });
    startTimer(timerId);
  };

  const handleClose = () => {
    // Clean up all bake-mode timers (finished and idle ones)
    bakeModeTimers.forEach((t) => {
      if (t.remainingSeconds === 0 || !t.isRunning) {
        removeTimer(t.id);
      }
    });
    onClose();
  };

  const handleFinish = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    // Clean up all bake-mode timers
    removeChain('bake-mode');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={[bm.safe, { backgroundColor: C.background }]}>
        <LinearGradient
          colors={[C.background, C.surfaceAlt] as [string, string]}
          style={bm.gradientBg}
        >
          {/* Header */}
          <View style={bm.header}>
            <Pressable style={[bm.closeBtn, { backgroundColor: C.surfaceAlt }]} onPress={handleClose}>
              <Ionicons name="close" size={24} color={C.text} />
            </Pressable>
            <View style={bm.headerCenter}>
              <Text style={[bm.headerTitle, { color: C.text }]} numberOfLines={1}>{recipeTitle}</Text>
              <Text style={[bm.headerSubtitle, { color: C.primaryDark }]}>
                Step {currentStep + 1} of {steps.length}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Step progress dots */}
          <View style={bm.dotsRow}>
            {steps.map((_, i) => (
              <Pressable key={i} onPress={() => handleGoToStep(i)} hitSlop={8}>
                <View
                  style={[
                    bm.dot,
                    i === currentStep && bm.dotCurrent,
                    completedSteps.has(i) && bm.dotCompleted,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Main step content */}
          <Animated.View style={[bm.stepContainer, { opacity: fadeAnim }]}>
            <ScrollView
              contentContainerStyle={bm.stepScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Step number badge */}
              <View style={bm.stepBadge}>
                {completedSteps.has(currentStep) ? (
                  <Ionicons name="checkmark" size={24} color={C.white} />
                ) : (
                  <Text style={bm.stepBadgeText}>{currentStep + 1}</Text>
                )}
              </View>

              {/* Step text — large and readable */}
              <Text style={[bm.stepText, { color: C.text }]}>{steps[currentStep]}</Text>

              {/* Step timer section */}
              {currentStepTimers.length > 0 && (
                <View style={bm.timerSection}>
                  {currentStepTimers.map((st, j) => {
                    const active = bakeModeTimers.find(
                      (t) => t.stepIndex === st.stepIndex && t.totalSeconds === st.seconds
                    );
                    const isDone = active && active.remainingSeconds === 0 && active.totalSeconds > 0;
                    const isRunning = active?.isRunning;

                    return (
                      <View key={j} style={bm.timerCard}>
                        {!active ? (
                          <Pressable
                            style={bm.timerStartBtn}
                            onPress={() => handleStartStepTimer(st)}
                          >
                            <Ionicons name="timer-outline" size={22} color={C.white} />
                            <Text style={bm.timerStartText}>Start {st.label}</Text>
                          </Pressable>
                        ) : (
                          <View style={bm.timerActiveCard}>
                            <Ionicons
                              name={isDone ? 'checkmark-circle' : 'timer'}
                              size={28}
                              color={isDone ? C.success : C.primaryDark}
                            />
                            <Text style={[bm.timerCountdown, isDone && { color: C.success }]}>
                              {isDone ? 'Done!' : formatCountdown(active.remainingSeconds)}
                            </Text>
                            <Text style={bm.timerLabel}>{st.label}</Text>
                            {/* Progress bar */}
                            <View style={bm.timerProgress}>
                              <View
                                style={[
                                  bm.timerProgressFill,
                                  {
                                    width: `${active.totalSeconds > 0 ? ((active.totalSeconds - active.remainingSeconds) / active.totalSeconds) * 100 : 0}%`,
                                    backgroundColor: isDone ? C.success : C.primaryDark,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Show tips on the last step */}
              {isLastStep && tips && (
                <View style={[bm.tipsBox, { backgroundColor: C.white }]}>
                  <Text style={[bm.tipsTitle, { color: C.text }]}>Baker's Tips</Text>
                  <Text style={[bm.tipsText, { color: C.textSecondary }]}>{tips}</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          {/* Navigation footer */}
          <View style={[bm.footer, { borderTopColor: C.borderLight, backgroundColor: C.background }]}>
            <Pressable
              style={[bm.navBtn, bm.navBtnPrev, isFirstStep && bm.navBtnDisabled]}
              onPress={handlePrev}
              disabled={isFirstStep}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isFirstStep ? C.textLight : C.primaryDark}
              />
              <Text style={[bm.navBtnText, isFirstStep && bm.navBtnTextDisabled]}>Previous</Text>
            </Pressable>

            {isLastStep ? (
              <Pressable style={bm.finishBtn} onPress={handleFinish}>
                <Ionicons name="checkmark-circle" size={22} color={C.white} />
                <Text style={bm.finishBtnText}>Finish</Text>
              </Pressable>
            ) : (
              <Pressable style={bm.navBtn} onPress={handleNext}>
                <Text style={bm.navBtnText}>Next</Text>
                <Ionicons name="chevron-forward" size={22} color={C.primaryDark} />
              </Pressable>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const bm = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientBg: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 2,
  },

  /* Progress dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.borderLight,
  },
  dotCurrent: {
    backgroundColor: Colors.primaryDark,
    width: 24,
    borderRadius: 5,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },

  /* Step content */
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  stepScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  stepBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  stepBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 22,
    color: Colors.white,
  },
  stepText: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    color: Colors.text,
    lineHeight: 32,
    textAlign: 'center',
  },

  /* Timer section */
  timerSection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  timerCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  timerStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  timerStartText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    color: Colors.white,
  },
  timerActiveCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '30',
  },
  timerCountdown: {
    fontFamily: Fonts.sansBold,
    fontSize: 36,
    color: Colors.primaryDark,
    letterSpacing: 2,
    marginTop: Spacing.sm,
  },
  timerLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timerProgress: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* Tips */
  tipsBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  tipsTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  tipsText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  /* Footer navigation */
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  navBtnPrev: {},
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.primaryDark,
  },
  navBtnTextDisabled: {
    color: Colors.textLight,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
  },
  finishBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.white,
  },
});

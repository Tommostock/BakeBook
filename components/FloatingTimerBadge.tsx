import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useTimerStore } from '../lib/timerStore';

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function FloatingTimerBadge() {
  const timers = useTimerStore((s) => s.timers);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);
  const [showOverlay, setShowOverlay] = useState(false);

  const runningCount = timers.filter((t) => t.isRunning).length;
  const completedCount = timers.filter((t) => t.remainingSeconds === 0 && t.totalSeconds > 0).length;

  if (timers.length === 0) return null;

  return (
    <>
      {/* Floating badge */}
      <Pressable
        style={[
          styles.badge,
          completedCount > 0 && styles.badgeDone,
        ]}
        onPress={() => setShowOverlay(true)}
      >
        <Ionicons name="timer-outline" size={16} color={Colors.white} />
        <Text style={styles.badgeText}>
          {completedCount > 0
            ? `${completedCount} done!`
            : runningCount > 0
            ? `${runningCount} running`
            : `${timers.length} timer${timers.length !== 1 ? 's' : ''}`
          }
        </Text>
      </Pressable>

      {/* Timer status overlay */}
      <Modal
        visible={showOverlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverlay(false)}
      >
        <Pressable style={styles.overlayBg} onPress={() => setShowOverlay(false)}>
          <View style={styles.overlayCard} onStartShouldSetResponder={() => true}>
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>Active Timers</Text>
              <Pressable onPress={() => setShowOverlay(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {timers.map((timer) => {
                const isDone = timer.remainingSeconds === 0 && timer.totalSeconds > 0;
                const progress = timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0;
                return (
                  <View key={timer.id} style={styles.timerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timerLabel}>{timer.label}</Text>
                      {timer.recipeTitle && (
                        <Text style={styles.timerRecipe}>{timer.recipeTitle}</Text>
                      )}
                      <Text style={[styles.timerTime, isDone && styles.timerTimeDone]}>
                        {isDone ? 'Done! 🎉' : formatTime(timer.remainingSeconds)}
                      </Text>
                      {/* Progress bar */}
                      <View style={styles.progressBg}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${(1 - progress) * 100}%` },
                            isDone && styles.progressFillDone,
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.timerActions}>
                      {!isDone && (
                        <Pressable
                          style={styles.timerActionBtn}
                          onPress={() => timer.isRunning ? pauseTimer(timer.id) : startTimer(timer.id)}
                        >
                          <Ionicons
                            name={timer.isRunning ? 'pause' : 'play'}
                            size={16}
                            color={Colors.primaryDark}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        style={styles.timerActionBtn}
                        onPress={() => isDone ? removeTimer(timer.id) : resetTimer(timer.id)}
                      >
                        <Ionicons
                          name={isDone ? 'close' : 'refresh'}
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 52,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 999,
  },
  badgeDone: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.white,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  overlayCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  overlayTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  timerLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
  },
  timerRecipe: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  timerTime: {
    fontFamily: Fonts.sansBold,
    fontSize: 20,
    color: Colors.primaryDark,
    marginTop: 4,
    letterSpacing: 1,
  },
  timerTimeDone: {
    color: '#4CAF50',
  },
  progressBg: {
    height: 3,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryDark,
    borderRadius: 2,
  },
  progressFillDone: {
    backgroundColor: '#4CAF50',
  },
  timerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
  },
  timerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

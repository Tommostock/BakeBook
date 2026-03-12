import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useTimerStore, TimerInstance } from '../lib/timerStore';
import { generateId } from '../lib/helpers';

interface TimerProps {
  defaultMinutes?: number;
  prepTime?: number;
  bakeTime?: number;
  recipeTitle?: string;
}

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

function formatDisplay(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TimerCard({ timer }: { timer: TimerInstance }) {
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);

  // elapsed goes 0→1 (left to right fill)
  const elapsed =
    timer.totalSeconds > 0
      ? (timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds
      : 0;
  const isDone = timer.remainingSeconds === 0 && timer.totalSeconds > 0;

  return (
    <View style={styles.timerCard}>
      {/* Coloured fill that grows left → right */}
      <View
        style={[
          styles.timerFill,
          {
            width: `${elapsed * 100}%`,
            backgroundColor: isDone ? Colors.success : Colors.primaryDark,
          },
        ]}
      />

      {/* Content overlaid on top */}
      <View style={styles.timerContent}>
        <View style={styles.timerTextArea}>
          <Text style={styles.timerLabel} numberOfLines={1}>
            {timer.label}
          </Text>
          <Text style={styles.timerTime}>
            {formatDisplay(timer.remainingSeconds)}
          </Text>
        </View>

        {/* Play / Pause button */}
        <Pressable
          style={styles.timerPlayBtn}
          onPress={() =>
            timer.isRunning ? pauseTimer(timer.id) : startTimer(timer.id)
          }
          disabled={isDone}
        >
          <Ionicons
            name={isDone ? 'checkmark' : timer.isRunning ? 'pause' : 'play'}
            size={22}
            color={isDone ? Colors.success : Colors.primaryDark}
          />
        </Pressable>
      </View>

      {/* Thin reset / close row below */}
      <View style={styles.timerActions}>
        <Pressable
          style={styles.timerActionBtn}
          onPress={() => resetTimer(timer.id)}
          hitSlop={6}
        >
          <Ionicons name="refresh" size={14} color={Colors.white} />
          <Text style={styles.timerActionText}>Reset</Text>
        </Pressable>
        <Pressable
          style={styles.timerActionBtn}
          onPress={() => removeTimer(timer.id)}
          hitSlop={6}
        >
          <Ionicons name="close" size={14} color={Colors.white} />
          <Text style={styles.timerActionText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Timer({ defaultMinutes = 0, prepTime, bakeTime, recipeTitle }: TimerProps) {
  const timers = useTimerStore((s) => s.timers);
  const addTimer = useTimerStore((s) => s.addTimer);
  const [customMins, setCustomMins] = useState('');

  const addPresetTimer = (label: string, minutes: number) => {
    addTimer({
      id: generateId(),
      label,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      recipeTitle,
    });
  };

  const addCustomTimer = () => {
    const mins = parseInt(customMins, 10);
    if (isNaN(mins) || mins <= 0) return;
    addPresetTimer(`Custom ${mins}m`, mins);
    setCustomMins('');
  };

  return (
    <View style={styles.container}>
      {/* Suggested timers for this recipe */}
      {(prepTime || bakeTime) && (
        <View style={styles.suggestRow}>
          <Text style={styles.suggestLabel}>Quick Start:</Text>
          {prepTime ? (
            <Pressable
              style={styles.suggestBtn}
              onPress={() => addPresetTimer('Prep', prepTime)}
            >
              <Ionicons name="time-outline" size={14} color={Colors.primaryDark} />
              <Text style={styles.suggestBtnText}>Prep {prepTime}m</Text>
            </Pressable>
          ) : null}
          {bakeTime ? (
            <Pressable
              style={styles.suggestBtn}
              onPress={() => addPresetTimer('Bake', bakeTime)}
            >
              <Ionicons name="flame-outline" size={14} color={Colors.primaryDark} />
              <Text style={styles.suggestBtnText}>Bake {bakeTime}m</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Preset buttons */}
      <View style={styles.presetRow}>
        {PRESETS.map((mins) => (
          <Pressable
            key={mins}
            style={styles.presetBtn}
            onPress={() => addPresetTimer(`${mins >= 60 ? `${mins / 60}h` : `${mins}m`} timer`, mins)}
          >
            <Text style={styles.presetText}>
              {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Custom time input */}
      <View style={styles.customRow}>
        <TextInput
          style={styles.customInput}
          placeholder="Custom mins"
          placeholderTextColor={Colors.textLight}
          value={customMins}
          onChangeText={setCustomMins}
          keyboardType="numeric"
        />
        <Pressable style={styles.customAddBtn} onPress={addCustomTimer}>
          <Ionicons name="add" size={18} color={Colors.white} />
        </Pressable>
      </View>

      {/* Active timer cards */}
      {timers.map((timer) => (
        <TimerCard key={timer.id} timer={timer} />
      ))}

      {timers.length === 0 && (
        <Text style={styles.emptyText}>Tap a preset or enter custom minutes to start a timer</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  suggestLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.primaryDark + '18',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '40',
  },
  suggestBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  presetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minWidth: 44,
    alignItems: 'center',
  },
  presetText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
  },
  customRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  customInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  customAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },

  /* ── Timer card: the fill IS the background ── */
  timerCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  timerFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: Radius.md,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: 4,
  },
  timerTextArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timerLabel: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.white,
    flex: 1,
  },
  timerTime: {
    fontFamily: Fonts.sansBold,
    fontSize: 18,
    color: Colors.white,
    letterSpacing: 1,
  },
  timerPlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  timerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    paddingTop: 2,
  },
  timerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    opacity: 0.7,
  },
  timerActionText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.white,
  },
});

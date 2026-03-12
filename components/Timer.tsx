import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

interface TimerProps {
  defaultMinutes?: number;
}

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

export function Timer({ defaultMinutes = 0 }: TimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
  const [remaining, setRemaining] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining]);

  const formatDisplay = useCallback((secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const setPreset = (mins: number) => {
    if (isRunning) return;
    setTotalSeconds(mins * 60);
    setRemaining(mins * 60);
  };

  const adjustTime = (deltaMins: number) => {
    if (isRunning) return;
    const newSeconds = Math.max(0, totalSeconds + deltaMins * 60);
    setTotalSeconds(newSeconds);
    setRemaining(newSeconds);
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const isDone = remaining === 0 && totalSeconds > 0;

  return (
    <View style={styles.container}>
      {/* Circular timer display */}
      <View style={styles.timerCircle}>
        {/* Progress ring */}
        <View style={[styles.progressRing, { opacity: totalSeconds > 0 ? 1 : 0.3 }]}>
          <View
            style={[
              styles.progressArc,
              {
                borderColor: isDone ? Colors.success : Colors.primaryDark,
                borderRightColor: 'transparent',
                borderBottomColor: progress > 0.25 ? (isDone ? Colors.success : Colors.primaryDark) : 'transparent',
                borderLeftColor: progress > 0.5 ? (isDone ? Colors.success : Colors.primaryDark) : 'transparent',
                borderTopColor: progress > 0.75 ? (isDone ? Colors.success : Colors.primaryDark) : 'transparent',
                transform: [{ rotate: `${progress * 360}deg` }],
              },
            ]}
          />
        </View>
        <Text style={[styles.timeDisplay, isDone && styles.timeDisplayDone]}>
          {formatDisplay(remaining)}
        </Text>
        {isDone && <Text style={styles.doneLabel}>Done! 🎉</Text>}
      </View>

      {/* +/- fine-tune buttons */}
      {!isRunning && (
        <View style={styles.adjustRow}>
          <Pressable style={styles.adjustBtn} onPress={() => adjustTime(-1)}>
            <Ionicons name="remove" size={18} color={Colors.text} />
            <Text style={styles.adjustText}>1 min</Text>
          </Pressable>
          <Pressable style={styles.adjustBtn} onPress={() => adjustTime(1)}>
            <Ionicons name="add" size={18} color={Colors.text} />
            <Text style={styles.adjustText}>1 min</Text>
          </Pressable>
        </View>
      )}

      {/* Preset buttons */}
      {!isRunning && (
        <View style={styles.presetRow}>
          {PRESETS.map((mins) => {
            const isActive = totalSeconds === mins * 60;
            return (
              <Pressable
                key={mins}
                style={[styles.presetBtn, isActive && styles.presetBtnActive]}
                onPress={() => setPreset(mins)}
              >
                <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Main controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.mainBtn, isRunning ? styles.pauseBtn : styles.startBtn]}
          onPress={() => {
            if (totalSeconds === 0) return;
            setIsRunning(!isRunning);
          }}
          disabled={totalSeconds === 0}
        >
          <Ionicons name={isRunning ? 'pause' : 'play'} size={24} color={Colors.white} />
        </Pressable>
        <Pressable
          style={styles.resetBtn}
          onPress={() => {
            setIsRunning(false);
            setRemaining(totalSeconds);
          }}
        >
          <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.borderLight,
    position: 'relative',
    marginBottom: Spacing.md,
  },
  progressRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 90,
    overflow: 'hidden',
  },
  progressArc: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 4,
  },
  timeDisplay: {
    fontFamily: Fonts.sansBold,
    fontSize: 42,
    color: Colors.text,
    letterSpacing: 2,
  },
  timeDisplayDone: {
    color: Colors.success,
  },
  doneLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.success,
    marginTop: -4,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  adjustText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.text,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
  presetBtnActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  presetText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
  },
  presetTextActive: {
    color: Colors.white,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  mainBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: Colors.primaryDark,
  },
  pauseBtn: {
    backgroundColor: '#FF9800',
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

interface TimerProps {
  defaultMinutes?: number;
}

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

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const newSeconds = Math.max(0, totalSeconds + delta * 60);
    setTotalSeconds(newSeconds);
    setRemaining(newSeconds);
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Baking Timer</Text>
      <View style={styles.timerRow}>
        <Pressable onPress={() => adjustTime(-1)} style={styles.adjustBtn} disabled={isRunning}>
          <Ionicons name="remove-circle-outline" size={28} color={isRunning ? Colors.textLight : Colors.text} />
        </Pressable>
        <View style={styles.display}>
          <Text style={styles.time}>{formatDisplay(remaining)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        <Pressable onPress={() => adjustTime(1)} style={styles.adjustBtn} disabled={isRunning}>
          <Ionicons name="add-circle-outline" size={28} color={isRunning ? Colors.textLight : Colors.text} />
        </Pressable>
      </View>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, isRunning ? styles.pauseBtn : styles.startBtn]}
          onPress={() => setIsRunning(!isRunning)}
          disabled={totalSeconds === 0}
        >
          <Ionicons name={isRunning ? 'pause' : 'play'} size={18} color={Colors.white} />
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.resetBtn]}
          onPress={() => {
            setIsRunning(false);
            setRemaining(totalSeconds);
          }}
        >
          <Ionicons name="refresh" size={18} color={Colors.text} />
          <Text style={[styles.buttonText, { color: Colors.text }]}>Reset</Text>
        </Pressable>
      </View>
      {remaining === 0 && totalSeconds > 0 && (
        <Text style={styles.doneText}>Timer complete! 🎉</Text>
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
  label: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  adjustBtn: {
    padding: Spacing.sm,
  },
  display: {
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
  },
  time: {
    fontFamily: Fonts.sansBold,
    fontSize: 48,
    color: Colors.text,
    letterSpacing: 2,
  },
  progressBar: {
    width: 160,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    gap: 6,
  },
  startBtn: {
    backgroundColor: Colors.primaryDark,
  },
  pauseBtn: {
    backgroundColor: '#FF9800',
  },
  resetBtn: {
    backgroundColor: Colors.borderLight,
  },
  buttonText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  doneText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    color: Colors.success,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

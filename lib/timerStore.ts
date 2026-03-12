import { create } from 'zustand';
import { Platform } from 'react-native';

export interface TimerInstance {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  recipeTitle?: string;
}

interface TimerState {
  timers: TimerInstance[];
  addTimer: (timer: Omit<TimerInstance, 'isRunning'>) => void;
  removeTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  tickAll: () => void;
}

let tickInterval: ReturnType<typeof setInterval> | null = null;

export const useTimerStore = create<TimerState>((set, get) => ({
  timers: [],

  addTimer: (timer) => {
    set((state) => ({
      timers: [...state.timers, { ...timer, isRunning: false }],
    }));
  },

  removeTimer: (id) => {
    set((state) => ({
      timers: state.timers.filter((t) => t.id !== id),
    }));
    // Stop global tick if no timers remain running
    const { timers } = get();
    if (!timers.some((t) => t.isRunning)) {
      stopGlobalTick();
    }
  },

  startTimer: (id) => {
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id && t.remainingSeconds > 0 ? { ...t, isRunning: true } : t
      ),
    }));
    startGlobalTick(get);
  },

  pauseTimer: (id) => {
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id ? { ...t, isRunning: false } : t
      ),
    }));
    const { timers } = get();
    if (!timers.some((t) => t.isRunning)) {
      stopGlobalTick();
    }
  },

  resetTimer: (id) => {
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t
      ),
    }));
  },

  tickAll: () => {
    const completedTimers: TimerInstance[] = [];

    set((state) => ({
      timers: state.timers.map((t) => {
        if (!t.isRunning || t.remainingSeconds <= 0) return t;
        const next = t.remainingSeconds - 1;
        if (next <= 0) {
          completedTimers.push(t);
          return { ...t, remainingSeconds: 0, isRunning: false };
        }
        return { ...t, remainingSeconds: next };
      }),
    }));

    // Fire completion alerts for each finished timer
    completedTimers.forEach((t) => fireCompletionAlert(t));

    // Stop ticking if nothing is running
    const { timers } = get();
    if (!timers.some((t) => t.isRunning)) {
      stopGlobalTick();
    }
  },
}));

function startGlobalTick(_get: () => TimerState) {
  if (tickInterval) return; // already ticking
  tickInterval = setInterval(() => {
    useTimerStore.getState().tickAll();
  }, 1000);
}

function stopGlobalTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

/**
 * Play a completion sound and vibrate.
 */
function fireCompletionAlert(timer: TimerInstance) {
  // Haptic vibration (web fallback)
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    navigator.vibrate?.(300);
  }

  // Web Audio API beep
  if (Platform.OS === 'web' && typeof AudioContext !== 'undefined') {
    try {
      const ctx = new AudioContext();
      // Play 3 short beeps
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    } catch {}
  }
}

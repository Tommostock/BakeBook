/**
 * Parses recipe step text to extract timer durations.
 * Returns an array of { stepIndex, label, seconds } for steps with detected times.
 */

export interface StepTimer {
  stepIndex: number;
  label: string;
  seconds: number;
}

// Matches patterns like "bake for 25 minutes", "prove for 1 hour", "rest 30 mins",
// "cool for 10-15 minutes", "refrigerate for 1-2 hours", "leave for 45 minutes"
const TIME_PATTERN =
  /\b(bake|prove|proof|rest|cool|chill|simmer|boil|cook|leave|refrigerate|freeze|rise|set aside|blind bake|prove again)\b[^.]*?\b(\d+)(?:\s*[-–]\s*\d+)?\s*(minutes?|mins?|hours?|hrs?)\b/gi;

export function parseStepTimers(steps: string[]): StepTimer[] {
  const result: StepTimer[] = [];

  steps.forEach((step, i) => {
    // Reset regex lastIndex
    TIME_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = TIME_PATTERN.exec(step)) !== null) {
      const action = match[1];
      const num = parseInt(match[2], 10);
      const unit = match[3].toLowerCase();

      if (isNaN(num) || num <= 0) continue;

      const seconds = unit.startsWith('h') ? num * 3600 : num * 60;
      const label = `${capitalize(action)} ${formatDuration(seconds)}`;

      // Avoid duplicates for the same step
      if (!result.some((r) => r.stepIndex === i && r.seconds === seconds)) {
        result.push({ stepIndex: i, label, seconds });
      }
    }
  });

  return result;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDuration(secs: number): string {
  if (secs >= 3600) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.floor(secs / 60)}m`;
}

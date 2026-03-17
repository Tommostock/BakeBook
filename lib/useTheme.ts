import { useMemo } from 'react';
import { Colors, DarkColors, Shadows, type ThemeColors } from '../constants/theme';
import { useAppStore } from './store';

export function useTheme() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const colors = isDarkMode ? DarkColors : Colors;

  const shadows = useMemo(() => {
    if (!isDarkMode) return Shadows;
    return {
      soft: {
        ...Shadows.soft,
        shadowColor: '#000',
        shadowOpacity: 0.3,
      },
      medium: {
        ...Shadows.medium,
        shadowColor: '#000',
        shadowOpacity: 0.4,
      },
      strong: {
        ...Shadows.strong,
        shadowColor: '#000',
        shadowOpacity: 0.5,
      },
    };
  }, [isDarkMode]);

  return { colors, shadows, isDarkMode };
}

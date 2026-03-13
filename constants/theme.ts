export const Colors = {
  primary: '#F8C8DC',
  primaryDark: '#E8A0B8',
  background: '#FFFAF7',
  surface: '#FFF9FB',
  surfaceAlt: '#FFF0F5',
  text: '#2D2D2D',
  textSecondary: '#777777',
  textLight: '#AAAAAA',
  border: '#F0E4E8',
  borderLight: '#F8F0F3',
  white: '#FFFFFF',
  black: '#1A1A1A',
  star: '#FFB800',
  success: '#4CAF50',
  error: '#E53935',
  shadow: 'rgba(0,0,0,0.06)',

  // Gradient tokens
  gradientPink: ['#F8C8DC', '#E8A0B8'] as readonly string[],
  gradientPeach: ['#F8C8DC', '#F5D0C5'] as readonly string[],
  gradientSoft: ['#FFF9FB', '#FFF0F5'] as readonly string[],
  gradientWarm: ['#FFFAF7', '#FFF0F5'] as readonly string[],

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
};

export const Fonts = {
  calligraphy: 'GreatVibes_400Regular',
  serif: 'PlayfairDisplay_700Bold',
  serifRegular: 'PlayfairDisplay_400Regular',
  sans: 'OpenSans_400Regular',
  sansMedium: 'OpenSans_500Medium',
  sansSemiBold: 'OpenSans_600SemiBold',
  sansBold: 'OpenSans_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Enhanced shadow presets
export const Shadows = {
  soft: {
    shadowColor: '#E8A0B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: '#E8A0B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },
  strong: {
    shadowColor: '#E8A0B8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 8,
  },
};

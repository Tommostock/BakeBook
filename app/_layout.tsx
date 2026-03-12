import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import {
  GreatVibes_400Regular,
} from '@expo-google-fonts/great-vibes';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '../lib/store';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FloatingTimerBadge } from '../components/FloatingTimerBadge';
import { OnboardingModal } from '../components/OnboardingModal';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadPersistedState = useAppStore((s) => s.loadPersistedState);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    GreatVibes_400Regular,
  });

  useEffect(() => {
    loadPersistedState();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <FloatingTimerBadge />
      <OnboardingModal />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}

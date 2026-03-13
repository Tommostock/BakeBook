import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
  const [isOffline, setIsOffline] = useState(false);

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

  // Offline detection (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
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
      {isOffline && (
        <View style={offlineStyles.banner}>
          <Text style={offlineStyles.text}>
            📡 You're offline — browsing cached recipes
          </Text>
        </View>
      )}
      <FloatingTimerBadge />
      <OnboardingModal />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFAF7' },
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

const offlineStyles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'OpenSans_500Medium',
    fontSize: 13,
    color: '#856404',
  },
});

import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Shadows } from '../../constants/theme';
import { Platform, Animated, View, StyleSheet } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ITEMS: { name: string; title: string; icon: IoniconsName; iconFocused: IoniconsName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'search', title: 'Search', icon: 'search-outline', iconFocused: 'search' },
  { name: 'favorites', title: 'Favourites', icon: 'heart-outline', iconFocused: 'heart' },
  { name: 'journal', title: 'Journal', icon: 'book-outline', iconFocused: 'book' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

// Animated tab icon with bounce on focus
function AnimatedTabIcon({
  focused,
  color,
  icon,
  iconFocused,
  isCenter,
}: {
  focused: boolean;
  color: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
  isCenter: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.25,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.timing(translateY, {
        toValue: -2,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      Animated.timing(translateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  // Centre FAB style for Search (the middle tab)
  if (isCenter) {
    return (
      <Animated.View
        style={[
          styles.centerFab,
          {
            transform: [{ scale: scaleAnim }, { translateY }],
            backgroundColor: focused ? Colors.primaryDark : Colors.primary,
          },
        ]}
      >
        <Ionicons
          name={focused ? iconFocused : icon}
          size={26}
          color={focused ? Colors.white : Colors.text}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY }] }}>
      <Ionicons
        name={focused ? iconFocused : icon}
        size={24}
        color={color}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: Fonts.sansMedium,
          fontSize: 10,
          marginTop: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'web' ? 12 : 20,
          left: 16,
          right: 16,
          backgroundColor: Colors.white,
          borderRadius: 28,
          height: Platform.OS === 'web' ? 68 : 70,
          paddingBottom: Platform.OS === 'web' ? 8 : 10,
          paddingTop: 8,
          borderTopWidth: 0,
          ...Shadows.strong,
        },
      }}
    >
      {TAB_ITEMS.map((tab, index) => {
        const isCenter = index === 2; // Favourites is centre tab
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarLabel: isCenter ? '' : tab.title,
              tabBarIcon: ({ focused, color }) => (
                <AnimatedTabIcon
                  focused={focused}
                  color={color}
                  icon={tab.icon}
                  iconFocused={tab.iconFocused}
                  isCenter={isCenter}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...Shadows.medium,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { recipes } from '../../data/recipes';

export default function ProfileScreen() {
  const favorites = useAppStore((s) => s.favorites);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const recipeNotes = useAppStore((s) => s.recipeNotes);

  const stats = [
    { label: 'Total Recipes', value: recipes.length, icon: 'book-outline' as const },
    { label: 'Favorites', value: favorites.length, icon: 'heart-outline' as const },
    { label: 'Journal Entries', value: journalEntries.length, icon: 'pencil-outline' as const },
    { label: 'Recipe Notes', value: recipeNotes.length, icon: 'chatbubble-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Ionicons name="heart" size={52} color={Colors.primaryDark} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.name}>Suzie Stock</Text>
          <Text style={styles.tagline}>2 x London Bake Off Champion</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color={Colors.primaryDark} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.version}>
          Suzie's BakeBook v1.0.0{'\n'}
          Made with ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surfaceAlt,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: Colors.text,
  },
  tagline: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 24,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  version: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { StarRating } from '../../components/StarRating';
import { useAppStore } from '../../lib/store';
import { recipes } from '../../data/recipes';
import { generateId } from '../../lib/helpers';
import type { JournalEntry } from '../../types/recipe';

const MAX_PHOTOS = 6;

export default function JournalScreen() {
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const deleteJournalEntry = useAppStore((s) => s.deleteJournalEntry);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);

  const pickPhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library to add photos.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newUris].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedRecipeId) {
      Alert.alert('Select a recipe', 'Please choose which recipe you baked.');
      return;
    }
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    const entry: JournalEntry = {
      id: generateId(),
      recipeId: selectedRecipeId,
      recipeTitle: recipe?.title || 'Unknown recipe',
      photos,
      notes,
      rating,
      dateBaked: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    addJournalEntry(entry);
    setModalVisible(false);
    setSelectedRecipeId('');
    setNotes('');
    setRating(0);
    setPhotos([]);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedRecipeId('');
    setNotes('');
    setRating(0);
    setPhotos([]);
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to remove this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ]);
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const recipe = recipes.find((r) => r.id === item.recipeId);
    const displayPhotos = item.photos?.length ? item.photos : item.photoUri ? [item.photoUri] : [];
    const headerPhoto = displayPhotos[0] || recipe?.imageUrl;

    return (
      <View style={styles.entryCard}>
        {headerPhoto && (
          <Image
            source={{ uri: headerPhoto }}
            style={styles.entryImage}
            contentFit="cover"
          />
        )}
        {displayPhotos.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.entryPhotoStrip}
            contentContainerStyle={{ gap: 4, paddingHorizontal: 4 }}
          >
            {displayPhotos.slice(1).map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.entryPhotoThumb}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.recipeTitle}</Text>
            <Pressable onPress={() => confirmDelete(item.id)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={Colors.textLight} />
            </Pressable>
          </View>
          <Text style={styles.entryDate}>
            {new Date(item.dateBaked).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <StarRating rating={item.rating} size={16} />
          {item.notes ? (
            <Text style={styles.entryNotes}>{item.notes}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Baking Journal</Text>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={journalEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Your journal is empty</Text>
            <Text style={styles.emptyText}>
              Record your bakes with photos, notes, and ratings
            </Text>
            <Pressable
              style={styles.startBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.startBtnText}>Log Your First Bake</Text>
            </Pressable>
          </View>
        }
      />

      {/* New Entry Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>New Journal Entry</Text>
            <Pressable onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>

            <Text style={styles.fieldLabel}>Which recipe did you bake?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.lg }}
            >
              {recipes.slice(0, 20).map((r) => (
                <Pressable
                  key={r.id}
                  style={[
                    styles.recipeOption,
                    selectedRecipeId === r.id && styles.recipeOptionSelected,
                  ]}
                  onPress={() => setSelectedRecipeId(r.id)}
                >
                  <Image
                    source={{ uri: r.imageUrl }}
                    style={styles.recipeOptionImage}
                    contentFit="cover"
                  />
                  <Text style={styles.recipeOptionTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>How did it turn out?</Text>
            <StarRating rating={rating} onRate={setRating} size={32} />

            {/* Photos */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Photos</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} contentFit="cover" />
                  <Pressable
                    style={styles.photoRemoveBtn}
                    onPress={() => removePhoto(index)}
                    hitSlop={6}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.text} />
                  </Pressable>
                </View>
              ))}
              {photos.length < MAX_PHOTOS && (
                <Pressable style={styles.photoAddBtn} onPress={pickPhoto}>
                  <Ionicons name="camera-outline" size={26} color={Colors.textLight} />
                  <Text style={styles.photoAddText}>Add</Text>
                </Pressable>
              )}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How was your bake? Any changes you made?"
              placeholderTextColor={Colors.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.primaryDark,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceAlt,
  },
  entryPhotoStrip: {
    height: 64,
    backgroundColor: Colors.surface,
  },
  entryPhotoThumb: {
    width: 60,
    height: 56,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
  entryContent: {
    padding: Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  entryTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  entryDate: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  entryNotes: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 19,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  startBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  startBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.text,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  saveText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.primaryDark,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  fieldLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  recipeOption: {
    width: 100,
    marginRight: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recipeOptionSelected: {
    borderColor: Colors.primaryDark,
  },
  recipeOptionImage: {
    width: 100,
    height: 80,
    backgroundColor: Colors.surfaceAlt,
  },
  recipeOptionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.text,
    padding: 4,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoThumbWrap: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    overflow: 'visible',
  },
  photoThumb: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  photoAddBtn: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 4,
  },
  photoAddText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textLight,
  },
  notesInput: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});

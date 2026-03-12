import React, { useState, useEffect, useRef } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { StarRating } from '../../components/StarRating';
import { useAppStore } from '../../lib/store';
import { recipes } from '../../data/recipes';
import { generateId } from '../../lib/helpers';
import type { JournalEntry } from '../../types/recipe';

const MAX_PHOTOS = 6;

export default function JournalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recipeId?: string }>();
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const deleteJournalEntry = useAppStore((s) => s.deleteJournalEntry);

  const { width: screenWidth } = useWindowDimensions();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [ratingWarning, setRatingWarning] = useState(false);

  // Detail view state
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Web file input ref (mobile browsers don't support expo-image-picker reliably)
  const fileInputRef = useRef<any>(null);

  // Auto-open modal when navigated here from a recipe page
  const handledRecipeId = useRef('');
  useEffect(() => {
    if (params.recipeId && params.recipeId !== handledRecipeId.current) {
      handledRecipeId.current = params.recipeId;
      setSelectedRecipeId(params.recipeId);
      setModalVisible(true);
    }
  }, [params.recipeId]);

  const filteredRecipes = recipeSearch.trim()
    ? recipes.filter((r) => r.title.toLowerCase().includes(recipeSearch.toLowerCase()))
    : recipes;

  // Convert a File/Blob to a base64 data URI so photos persist in storage
  const fileToBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const pickPhoto = async () => {
    if (Platform.OS === 'web') {
      // On web (esp. mobile browsers), use a native file input for reliable access
      fileInputRef.current?.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled) {
      const base64Uris = result.assets
        .filter((a) => a.base64)
        .map((a) => `data:image/jpeg;base64,${a.base64}`);
      setPhotos((prev) => [...prev, ...base64Uris].slice(0, MAX_PHOTOS));
    }
  };

  const handleWebFileChange = async (e: any) => {
    const files: File[] = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const selected = files.slice(0, remaining);
    const base64Uris = await Promise.all(selected.map((f) => fileToBase64(f)));
    setPhotos((prev) => [...prev, ...base64Uris].slice(0, MAX_PHOTOS));
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const resetModal = () => {
    setModalVisible(false);
    setSelectedRecipeId('');
    setRecipeSearch('');
    setNotes('');
    setRating(0);
    setPhotos([]);
    setRatingWarning(false);
    handledRecipeId.current = '';
    // Clear the recipeId param so re-visiting the tab doesn't re-open the modal
    if (params.recipeId) {
      router.replace('/(tabs)/journal');
    }
  };

  const handleSave = () => {
    if (!selectedRecipeId) {
      Alert.alert('Select a recipe', 'Please choose which recipe you baked.');
      return;
    }
    if (rating === 0) {
      setRatingWarning(true);
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
    resetModal();
  };

  const handleClose = () => {
    resetModal();
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteJournalEntry(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const recipe = recipes.find((r) => r.id === item.recipeId);
    const displayPhotos = item.photos?.length ? item.photos : item.photoUri ? [item.photoUri] : [];
    const headerPhoto = displayPhotos[0] || recipe?.imageUrl;
    const photoCount = displayPhotos.length;

    return (
      <Pressable
        style={styles.entryCard}
        onPress={() => { setGalleryIndex(0); setViewingEntry(item); }}
      >
        <View style={styles.entryImageWrap}>
          {headerPhoto ? (
            <Image
              source={{ uri: headerPhoto }}
              style={styles.entryImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.entryImage, styles.entryImagePlaceholder]}>
              <Ionicons name="camera-outline" size={28} color={Colors.textLight} />
            </View>
          )}
          {photoCount > 1 && (
            <View style={styles.photoCountBadge}>
              <Ionicons name="images-outline" size={11} color={Colors.white} />
              <Text style={styles.photoCountText}>{photoCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.entryContent}>
          <Text style={styles.entryTitle} numberOfLines={2}>{item.recipeTitle}</Text>
          <Text style={styles.entryDate}>
            {new Date(item.dateBaked).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Text>
          <StarRating rating={item.rating} size={13} />
        </View>
      </Pressable>
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
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.md }}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: Spacing.md }}
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

      {/* Entry Detail Modal */}
      <Modal
        visible={!!viewingEntry}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewingEntry(null)}
      >
        {viewingEntry && (() => {
          const recipe = recipes.find((r) => r.id === viewingEntry.recipeId);
          const displayPhotos = viewingEntry.photos?.length
            ? viewingEntry.photos
            : viewingEntry.photoUri
            ? [viewingEntry.photoUri]
            : [];
          const galleryPhotos = displayPhotos.length ? displayPhotos : recipe?.imageUrl ? [recipe.imageUrl] : [];

          return (
            <SafeAreaView style={styles.modalSafe}>
              {/* Header */}
              <View style={styles.detailHeader}>
                <Pressable onPress={() => setViewingEntry(null)} style={styles.detailCloseBtn}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </Pressable>
                <Text style={styles.detailHeaderTitle} numberOfLines={1}>{viewingEntry.recipeTitle}</Text>
                <Pressable
                  onPress={() => {
                    setViewingEntry(null);
                    confirmDelete(viewingEntry.id);
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.textLight} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Photo Gallery */}
                {galleryPhotos.length > 0 && (
                  <View>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      style={{ width: screenWidth }}
                      onScroll={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                        setGalleryIndex(idx);
                      }}
                      scrollEventThrottle={16}
                    >
                      {galleryPhotos.map((uri, i) => (
                        <Image
                          key={i}
                          source={{ uri }}
                          style={{ width: screenWidth, height: 320 }}
                          contentFit="cover"
                        />
                      ))}
                    </ScrollView>
                    {/* Dot indicators */}
                    {galleryPhotos.length > 1 && (
                      <View style={styles.dotRow}>
                        {galleryPhotos.map((_, i) => (
                          <View
                            key={i}
                            style={[styles.dot, i === galleryIndex && styles.dotActive]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Entry details */}
                <View style={styles.detailContent}>
                  <Text style={styles.detailRecipeTitle}>{viewingEntry.recipeTitle}</Text>
                  <Text style={styles.detailDate}>
                    {new Date(viewingEntry.dateBaked).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </Text>
                  <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.md }}>
                    <StarRating rating={viewingEntry.rating} size={28} />
                  </View>

                  {viewingEntry.notes ? (
                    <View style={styles.detailNotesBox}>
                      <Text style={styles.detailNotesLabel}>Notes</Text>
                      <Text style={styles.detailNotesText}>{viewingEntry.notes}</Text>
                    </View>
                  ) : null}

                  {galleryPhotos.length > 1 && (
                    <View style={styles.detailPhotoGrid}>
                      <Text style={styles.detailNotesLabel}>All Photos ({galleryPhotos.length})</Text>
                      <View style={styles.detailThumbnailRow}>
                        {galleryPhotos.map((uri, i) => (
                          <Pressable
                            key={i}
                            onPress={() => {
                              setGalleryIndex(i);
                              // scroll gallery to this index — handled via state, user can also swipe
                            }}
                          >
                            <Image
                              source={{ uri }}
                              style={[
                                styles.detailThumbnail,
                                i === galleryIndex && styles.detailThumbnailActive,
                              ]}
                              contentFit="cover"
                            />
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
      </Modal>

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
            <TextInput
              style={styles.recipeSearchInput}
              placeholder="Search recipes..."
              placeholderTextColor={Colors.textLight}
              value={recipeSearch}
              onChangeText={setRecipeSearch}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.lg }}
            >
              {filteredRecipes.map((r) => (
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
            <StarRating rating={rating} onRate={(r) => { setRating(r); setRatingWarning(false); }} size={32} />
            {ratingWarning && (
              <Text style={styles.ratingWarning}>⭐ Please choose a rating before saving</Text>
            )}

            {/* Photos */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md }}>
              <Text style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}>Photos</Text>
              <Text style={styles.photoCountHint}>{photos.length} / {MAX_PHOTOS}</Text>
            </View>
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
          {/* Hidden file input for web (mobile browsers) */}
          {Platform.OS === 'web' && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleWebFileChange}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteConfirmId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmId(null)}
      >
        <Pressable style={styles.confirmOverlay} onPress={() => setDeleteConfirmId(null)}>
          <View style={styles.confirmBox}>
            <Ionicons name="warning-outline" size={36} color={Colors.primaryDark} />
            <Text style={styles.confirmTitle}>Delete Entry?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this journal entry? This cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={styles.confirmCancelBtn}
                onPress={() => setDeleteConfirmId(null)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
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
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  entryImageWrap: {
    position: 'relative',
    aspectRatio: 1,
    width: '100%',
  },
  entryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceAlt,
  },
  entryImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoCountText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: Colors.white,
  },
  entryContent: {
    padding: Spacing.sm,
  },
  entryTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 2,
    lineHeight: 18,
  },
  entryDate: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
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
  recipeSearchInput: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
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
  photoCountHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Detail modal
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  detailCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderTitle: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.text,
  },
  detailContent: {
    padding: Spacing.lg,
    paddingBottom: 48,
  },
  detailRecipeTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  detailDate: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailNotesBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  detailNotesLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  detailNotesText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  detailPhotoGrid: {
    marginTop: Spacing.lg,
  },
  detailThumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  detailThumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  detailThumbnailActive: {
    borderColor: Colors.primaryDark,
  },
  // Gallery dots
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primaryDark,
  },
  // Rating warning
  ratingWarning: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#E53E3E',
    marginTop: Spacing.sm,
  },
  // Delete confirmation modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  confirmBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  confirmText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.white,
  },
});

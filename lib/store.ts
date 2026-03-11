import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe, JournalEntry, RecipeNote } from '../types/recipe';

interface AppState {
  favorites: string[];
  journalEntries: JournalEntry[];
  recipeNotes: RecipeNote[];
  recentlyViewed: string[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;

  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  addJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  addRecipeNote: (note: RecipeNote) => void;
  deleteRecipeNote: (id: string) => void;
  getNotesForRecipe: (recipeId: string) => RecipeNote[];
  addRecentlyViewed: (recipeId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedDifficulty: (difficulty: string | null) => void;
  loadPersistedState: () => Promise<void>;
}

const STORAGE_KEYS = {
  favorites: '@bakebook_favorites',
  journal: '@bakebook_journal',
  notes: '@bakebook_notes',
  recent: '@bakebook_recent',
};

export const useAppStore = create<AppState>((set, get) => ({
  favorites: [],
  journalEntries: [],
  recipeNotes: [],
  recentlyViewed: [],
  searchQuery: '',
  selectedCategory: null,
  selectedDifficulty: null,

  toggleFavorite: (recipeId) => {
    set((state) => {
      const isFav = state.favorites.includes(recipeId);
      const newFavorites = isFav
        ? state.favorites.filter((id) => id !== recipeId)
        : [...state.favorites, recipeId];
      AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    });
  },

  isFavorite: (recipeId) => get().favorites.includes(recipeId),

  addJournalEntry: (entry) => {
    set((state) => {
      const newEntries = [entry, ...state.journalEntries];
      AsyncStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(newEntries));
      return { journalEntries: newEntries };
    });
  },

  deleteJournalEntry: (id) => {
    set((state) => {
      const newEntries = state.journalEntries.filter((e) => e.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(newEntries));
      return { journalEntries: newEntries };
    });
  },

  addRecipeNote: (note) => {
    set((state) => {
      const newNotes = [note, ...state.recipeNotes];
      AsyncStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(newNotes));
      return { recipeNotes: newNotes };
    });
  },

  deleteRecipeNote: (id) => {
    set((state) => {
      const newNotes = state.recipeNotes.filter((n) => n.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(newNotes));
      return { recipeNotes: newNotes };
    });
  },

  getNotesForRecipe: (recipeId) =>
    get().recipeNotes.filter((n) => n.recipeId === recipeId),

  addRecentlyViewed: (recipeId) => {
    set((state) => {
      const filtered = state.recentlyViewed.filter((id) => id !== recipeId);
      const newRecent = [recipeId, ...filtered].slice(0, 20);
      AsyncStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(newRecent));
      return { recentlyViewed: newRecent };
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  loadPersistedState: async () => {
    try {
      const [favs, journal, notes, recent] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.favorites),
        AsyncStorage.getItem(STORAGE_KEYS.journal),
        AsyncStorage.getItem(STORAGE_KEYS.notes),
        AsyncStorage.getItem(STORAGE_KEYS.recent),
      ]);
      set({
        favorites: favs ? JSON.parse(favs) : [],
        journalEntries: journal ? JSON.parse(journal) : [],
        recipeNotes: notes ? JSON.parse(notes) : [],
        recentlyViewed: recent ? JSON.parse(recent) : [],
      });
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    }
  },
}));

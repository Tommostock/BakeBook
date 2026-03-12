import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe, JournalEntry, RecipeNote } from '../types/recipe';

interface AppState {
  favorites: string[];
  journalEntries: JournalEntry[];
  recipeNotes: RecipeNote[];
  recentlyViewed: string[];
  userRecipes: Recipe[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;

  toggleFavorite: (recipeId: string) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  addRecipeNote: (note: RecipeNote) => void;
  deleteRecipeNote: (id: string) => void;
  addRecentlyViewed: (recipeId: string) => void;
  addUserRecipe: (recipe: Recipe) => void;
  updateUserRecipe: (recipe: Recipe) => void;
  deleteUserRecipe: (id: string) => void;
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
  userRecipes: '@bakebook_user_recipes',
};

export const useAppStore = create<AppState>((set, get) => ({
  favorites: [],
  journalEntries: [],
  recipeNotes: [],
  recentlyViewed: [],
  userRecipes: [],
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

  addRecentlyViewed: (recipeId) => {
    set((state) => {
      const filtered = state.recentlyViewed.filter((id) => id !== recipeId);
      const newRecent = [recipeId, ...filtered].slice(0, 20);
      AsyncStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(newRecent));
      return { recentlyViewed: newRecent };
    });
  },

  addUserRecipe: (recipe) => {
    set((state) => {
      const newRecipes = [recipe, ...state.userRecipes];
      AsyncStorage.setItem(STORAGE_KEYS.userRecipes, JSON.stringify(newRecipes));
      return { userRecipes: newRecipes };
    });
  },

  updateUserRecipe: (recipe) => {
    set((state) => {
      const newRecipes = state.userRecipes.map((r) =>
        r.id === recipe.id ? recipe : r
      );
      AsyncStorage.setItem(STORAGE_KEYS.userRecipes, JSON.stringify(newRecipes));
      return { userRecipes: newRecipes };
    });
  },

  deleteUserRecipe: (id) => {
    set((state) => {
      const newRecipes = state.userRecipes.filter((r) => r.id !== id);
      const newFavorites = state.favorites.filter((fId) => fId !== id);
      const newNotes = state.recipeNotes.filter((n) => n.recipeId !== id);
      const newRecent = state.recentlyViewed.filter((rId) => rId !== id);
      AsyncStorage.setItem(STORAGE_KEYS.userRecipes, JSON.stringify(newRecipes));
      AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newFavorites));
      AsyncStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(newNotes));
      AsyncStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(newRecent));
      return {
        userRecipes: newRecipes,
        favorites: newFavorites,
        recipeNotes: newNotes,
        recentlyViewed: newRecent,
      };
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  loadPersistedState: async () => {
    try {
      const [favs, journal, notes, recent, userRecipes] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.favorites),
        AsyncStorage.getItem(STORAGE_KEYS.journal),
        AsyncStorage.getItem(STORAGE_KEYS.notes),
        AsyncStorage.getItem(STORAGE_KEYS.recent),
        AsyncStorage.getItem(STORAGE_KEYS.userRecipes),
      ]);
      set({
        favorites: favs ? JSON.parse(favs) : [],
        journalEntries: journal ? JSON.parse(journal) : [],
        recipeNotes: notes ? JSON.parse(notes) : [],
        recentlyViewed: recent ? JSON.parse(recent) : [],
        userRecipes: userRecipes ? JSON.parse(userRecipes) : [],
      });
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    }
  },
}));

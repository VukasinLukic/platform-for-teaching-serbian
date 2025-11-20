/**
 * Authentication Store (Zustand)
 * Global state management for user authentication
 */

import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  // Actions
  initAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore
          const profile = await getUserProfile(user.uid);
          set({
            user,
            userProfile: profile,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          set({
            user,
            userProfile: null,
            loading: false,
            error: error.message,
          });
        }
      } else {
        set({
          user: null,
          userProfile: null,
          loading: false,
          error: null,
        });
      }
    });
  },

  logout: async () => {
    try {
      await auth.signOut();
      set({
        user: null,
        userProfile: null,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: error.message });
    }
  },

  setUser: (user) => {
    set({ user });
  },

  setUserProfile: (profile) => {
    set({ userProfile: profile });
  },

  clearError: () => {
    set({ error: null });
  },

  // Computed values (helpers)
  isAdmin: () => {
    const { userProfile } = get();
    return userProfile?.role === 'admin';
  },

  isAuthenticated: () => {
    const { user } = get();
    return !!user;
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store za notifikacije - cuva sve notifikacije iz admin panela
 * Koristi se za prikaz istorije notifikacija u dropdown-u
 */
export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      // Dodaj novu notifikaciju
      addNotification: ({ type, message, title = null }) => {
        const notification = {
          id: Date.now() + Math.random(),
          type,
          message,
          title,
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 50), // Cuva max 50 notifikacija
          unreadCount: state.unreadCount + 1,
        }));

        return notification.id;
      },

      // Oznaci notifikaciju kao procitanu
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      // Oznaci sve kao procitane
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      // Obrisi notifikaciju
      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      // Obrisi sve notifikacije
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'admin-notifications',
    }
  )
);

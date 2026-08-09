import { create } from 'zustand';
import { apiFetch } from '../api/client';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: NotificationItem) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const list = await apiFetch<NotificationItem[]>('/api/notifications');
      const unread = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount: unread });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'POST' });
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
        return {
          notifications: updated,
          unreadCount: 0,
        };
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },

  addNotification: (item) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === item.id);
      if (exists) return {};
      const updated = [item, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
  },
}));

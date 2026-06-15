import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket.service';
import { useAuthContext } from './auth-provider';
import API from '@/lib/axios-client';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (idOrIds: string | string[]) => Promise<void>; // Updated to handle bulk
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  deleteNotification: (idOrIds: string | string[]) => Promise<void>; // Updated to handle bulk
  resetCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuthContext();

  // 1. Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await API.get('/logs/notifications');
      const dataArray = response.data?.data || response.data || [];
      setNotifications(Array.isArray(dataArray) ? dataArray : []);

      const unread = dataArray.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setNotifications([]);
    }
  }, []);

  // 2. Mark Read (Single or Bulk)
  const markAsRead = async (idOrIds: string | string[]) => {
    const isBulk = Array.isArray(idOrIds);

    // Optimistic UI Update
    setNotifications((prev) =>
      prev.map((n) => {
        if (isBulk) return idOrIds.includes(n._id) ? { ...n, isRead: true } : n;
        return n._id === idOrIds ? { ...n, isRead: true } : n;
      }),
    );

    try {
      if (isBulk) {
        // Bulk call sending array in body
        await API.patch('/logs/notifications/mark-read', { ids: idOrIds });
      } else {
        // Single call using URL param
        await API.patch(`/logs/notifications/mark-read/${idOrIds}`);
      }

      // Recalculate count from updated local state
      setUnreadCount((_prev) => Math.max(0, notifications.filter((n) => !n.isRead).length));
    } catch (err) {
      console.error('Error marking read', err);
      fetchNotifications(); // Rollback on error
    }
  };

  // 3. Mark all as read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await API.patch('/logs/notifications/mark-read'); // No ID = Mark All
    } catch (err) {
      console.error('Error marking all read', err);
      fetchNotifications();
    }
  };

  // 4. Delete (Single or Bulk)
  const deleteNotification = async (idOrIds: string | string[]) => {
    const isBulk = Array.isArray(idOrIds);

    // Optimistic UI Removal
    setNotifications((prev) =>
      prev.filter((n) => {
        if (isBulk) return !idOrIds.includes(n._id);
        return n._id !== idOrIds;
      }),
    );

    try {
      if (isBulk) {
        // Axios delete with body requires 'data' key
        await API.delete('/logs/notifications', { data: { ids: idOrIds } });
      } else {
        await API.delete(`/logs/notifications/${idOrIds}`);
      }
    } catch (err) {
      console.error('Delete failed', err);
      fetchNotifications();
    }
  };

  // 5. Clear all notifications
  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await API.delete('/logs/notifications/clear-all');
    } catch (err) {
      console.error('Error clearing notifications', err);
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();

      socketService.on('notification_received', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      socketService.off('notification_received');
    };
  }, [isAuthenticated, user, fetchNotifications]);

  const resetCount = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        resetCount,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
};

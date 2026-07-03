import { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';
import { getNotificationsApi, markAllAsReadApi } from '../api/notificationApi.js';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      connectSocket();
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  const connectSocket = () => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    newSocket.emit('join', user._id);
    newSocket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    setSocket(newSocket);
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsApi();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read');
    }
  };

  const markOneRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAllRead,
        markOneRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
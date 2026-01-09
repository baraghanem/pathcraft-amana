'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    type: 'milestone' | 'reminder' | 'system' | 'social' | 'streak';
    title: string;
    description: string;
    time: string;
    icon: string;
    read: boolean;
    actionLink?: string;
    actionText?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const response: any = await api.getNotifications();
            if (response.success && response.data?.notifications) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            refreshNotifications();
        } else {
            setNotifications([]);
        }
    }, [isAuthenticated, refreshNotifications]);

    // Polling for new notifications every 2 minutes
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(refreshNotifications, 120000);
        return () => clearInterval(interval);
    }, [isAuthenticated, refreshNotifications]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );

        try {
            await api.markNotificationRead(id);
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            // Revert on error if necessary, but for simplicity we'll just log
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await api.markAllNotificationsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await api.deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification', error);
            refreshNotifications(); // Refresh on error to restore the deleted item if failed
        }
    };

    const clearAllNotifications = async () => {
        // Optimistic update
        setNotifications([]);

        try {
            await api.clearAllNotifications();
        } catch (error) {
            console.error('Failed to clear all notifications', error);
            refreshNotifications();
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                refreshNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAllNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

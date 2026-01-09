'use client';

import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface Notification {
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

import { useNotifications } from "@/app/context/NotificationContext";

export default function NotificationsPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, refreshNotifications } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        refreshNotifications();
    }, [isAuthenticated, router, refreshNotifications]);

    async function handleDeleteNotification(id: string) {
        try {
            await deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    }

    async function handleClearAll() {
        if (confirm('Are you sure you want to clear all notifications?')) {
            try {
                await clearAllNotifications();
            } catch (error) {
                console.error('Failed to clear notifications', error);
            }
        }
    }

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-3xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            className="text-sm"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="outline"
                            className="text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={handleClearAll}
                        >
                            Clear all
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-2 px-1 font-medium transition-colors ${filter === 'all'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`pb-2 px-1 font-medium transition-colors ${filter === 'unread'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
                <Card className="text-center py-16">
                    <div className="text-6xl mb-4">
                        {filter === 'unread' ? '✅' : '🔔'}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                        {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {filter === 'unread'
                            ? 'You have no unread notifications'
                            : "You'll see notifications here when you have activity"
                        }
                    </p>
                    <Link href="/explore">
                        <Button>Explore Learning Paths</Button>
                    </Link>
                </Card>
            )}

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.map(notification => (
                    <Card
                        key={notification.id}
                        className={`flex gap-4 p-5 items-start transition-all hover:shadow-md ${!notification.read
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'
                            : ''
                            }`}
                    >
                        {/* Icon */}
                        <div className="text-3xl bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
                            {notification.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <h3 className={`font-semibold ${!notification.read
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {notification.title}
                                </h3>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {notification.time}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {notification.description}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {notification.actionLink && (
                                    <Link href={notification.actionLink}>
                                        <Button
                                            variant="outline"
                                            className="text-xs h-7 px-3"
                                        >
                                            {notification.actionText || 'View'}
                                        </Button>
                                    </Link>
                                )}

                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Mark as read
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 ml-auto"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Load More (for future pagination) */}
            {filteredNotifications.length > 0 && filteredNotifications.length >= 10 && (
                <div className="mt-6 text-center">
                    <Button variant="outline">Load More</Button>
                </div>
            )}
        </div>
    );
}
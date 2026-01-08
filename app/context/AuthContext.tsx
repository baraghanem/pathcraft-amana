'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-client';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt?: string;
    savedPaths?: Array<{ pathId: string; savedAt: string }>;
    currentStreak?: number;
    longestStreak?: number;
    totalActiveDays?: number;
    lastActivityDate?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Track activity on app open
    useEffect(() => {
        if (user) {
            const trackActivity = async () => {
                try {
                    await api.trackActivity();
                    // Refresh user data to get updated streak
                    const response = await api.getCurrentUser();
                    if (response.success && response.data?.user) {
                        setUser(response.data.user);
                    }
                } catch (error) {
                    console.error('Failed to track activity:', error);
                }
            };
            trackActivity();
        }
    }, [user?.id]);

    async function checkAuth() {
        try {
            const token = api.getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.getCurrentUser();
            if (response.success && response.data?.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            api.logout();
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        try {
            const response = await api.login(email, password);
            if (response.success && response.data?.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            throw error;
        }
    }

    async function register(email: string, password: string, name: string) {
        try {
            const response = await api.register(email, password, name);
            if (response.success && response.data?.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            throw error;
        }
    }

    function logout() {
        api.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export default function SettingsPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile settings
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');

    // Account settings
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [progressUpdates, setProgressUpdates] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [newPathAlerts, setNewPathAlerts] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user) {
            setName(user.name);
            setEmail(user.email);
            setAvatar(user.avatar || '');
        }
    }, [isAuthenticated, user, router]);

    async function handleProfileUpdate() {
        setLoading(true);
        setMessage(null);

        try {
            // TODO: Implement API endpoint for profile update
            // const response = await api.updateProfile({ name, avatar });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    }

    async function handlePasswordChange() {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // TODO: Implement API endpoint for password change
            // const response = await api.changePassword({ currentPassword, newPassword });

            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    }

    async function handleNotificationUpdate() {
        setLoading(true);
        setMessage(null);

        try {
            // TODO: Implement API endpoint for notification settings
            // const response = await api.updateNotificationSettings({ ... });

            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: 'success', text: 'Notification settings updated!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update settings' });
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAccount() {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone and will delete all your paths and progress.'
        );

        if (!confirmed) return;

        const doubleCheck = prompt('Type "DELETE" to confirm account deletion:');
        if (doubleCheck !== 'DELETE') {
            alert('Account deletion cancelled');
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement account deletion API
            // await api.deleteAccount();

            logout();
            router.push('/');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <Card className="lg:w-64 h-fit p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'profile'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        👤 Profile Info
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'account'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        🔒 Account & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'notifications'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        🔔 Notifications
                    </button>
                </Card>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <Card>
                            <h2 className="text-xl font-bold mb-6">Profile Information</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <Button variant="outline" className="text-sm">
                                        Change Avatar
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        JPG, PNG or GIF. Max size 2MB
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Full Name"
                                    value={name}
                                    onChange={(e: any) => setName(e.target.value)}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e: any) => setEmail(e.target.value)}
                                    disabled
                                />
                                <p className="text-xs text-gray-500">
                                    Email cannot be changed. Contact support if you need to update it.
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="font-semibold">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Current Streak</p>
                                        <p className="font-semibold">🔥 {user?.currentStreak || 0} days</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Active Days</p>
                                        <p className="font-semibold">{user?.totalActiveDays || 0} days</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleProfileUpdate} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <>
                            <Card>
                                <h2 className="text-xl font-bold mb-6">Change Password</h2>

                                <div className="space-y-4">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e: any) => setCurrentPassword(e.target.value)}
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e: any) => setNewPassword(e.target.value)}
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e: any) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Button onClick={handlePasswordChange} disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </Card>

                            <Card className="border-red-200 dark:border-red-800">
                                <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
                                    Danger Zone
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                >
                                    Delete Account
                                </Button>
                            </Card>
                        </>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <Card>
                            <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Email Notifications</h3>
                                        <p className="text-sm text-gray-500">
                                            Receive updates and announcements via email
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={emailNotifications}
                                            onChange={(e) => setEmailNotifications(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Progress Updates</h3>
                                        <p className="text-sm text-gray-500">
                                            Get notified when you complete milestones
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={progressUpdates}
                                            onChange={(e) => setProgressUpdates(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Weekly Digest</h3>
                                        <p className="text-sm text-gray-500">
                                            Receive a summary of your weekly progress
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={weeklyDigest}
                                            onChange={(e) => setWeeklyDigest(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium">New Path Alerts</h3>
                                        <p className="text-sm text-gray-500">
                                            Get notified when new paths in your interests are added
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newPathAlerts}
                                            onChange={(e) => setNewPathAlerts(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleNotificationUpdate} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
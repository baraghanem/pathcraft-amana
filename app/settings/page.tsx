'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import { api } from "@/lib/api-client";

export default function SettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        avatar: user?.avatar || ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res: any = await api.request('/api/user/update-profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
            if (res.success) {
                setMessage({ type: 'success', text: 'Profile updated!' });
                // Note: AuthContext should ideally be updated here or it will refresh on next mount
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Update failed' });
        } finally { setLoading(false); }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {message.text && (
                <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <Card className="mb-8">
                <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e: any) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-6 text-red-600">Danger Zone</h2>
                <p className="text-sm text-gray-500 mb-4">Deleting your account is permanent.</p>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Delete Account</Button>
            </Card>
        </div>
    );
}
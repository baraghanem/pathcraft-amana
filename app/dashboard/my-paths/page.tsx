'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface Path {
    _id: string;
    title: string;
    status?: string;
    progress?: number;
    steps?: any[];
}

export default function MyPathsPage() {
    const [paths, setPaths] = useState<Path[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchPaths();
    }, [isAuthenticated]);

    async function fetchPaths() {
        try {
            setLoading(true);
            const response: any = await api.getUserPaths();
            if (response.success && response.data?.paths) {
                setPaths(response.data.paths);
            }
        } catch (error) {
            console.error('Failed to fetch paths:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(pathId: string) {
        if (!confirm('Are you sure you want to delete this path?')) {
            return;
        }

        try {
            await api.deletePath(pathId);
            setPaths(paths.filter(p => p._id !== pathId));
        } catch (error) {
            console.error('Failed to delete path:', error);
            alert('Failed to delete path');
        }
    }

    const filteredPaths = paths; // Can add filtering logic here later

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Paths</h1>
                <Link href="/dashboard/create-path">
                    <Button>+ New Path</Button>
                </Link>
            </div>

            {/* Simple Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'active'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab('active')}
                >
                    All Paths
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-20 animate-pulse bg-gray-200 dark:bg-gray-800" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && paths.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                        You haven't created any paths yet.
                    </p>
                    <Link href="/dashboard/create-path">
                        <Button>Create Your First Path</Button>
                    </Link>
                </div>
            )}

            {/* List of paths */}
            {!loading && paths.length > 0 && (
                <div className="space-y-4">
                    {filteredPaths.map(path => (
                        <Card key={path._id} className="flex items-center justify-between py-4 px-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-24 hidden sm:block">
                                    <div
                                        className="h-full bg-blue-600"
                                        style={{ width: `${((path.steps?.length || 0) > 0 ? 50 : 0)}%` }}
                                    ></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{path.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {path.steps?.length || 0} steps
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Link href={`/path/${path._id}`}>
                                    <Button variant="outline" className="text-sm py-1.5">View</Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="text-sm py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                                    onClick={() => handleDelete(path._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
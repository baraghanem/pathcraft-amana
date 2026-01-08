'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface Path {
    _id: string;
    title: string;
    category: string;
    steps: any[];
}

interface ProgressItem {
    pathId: Path;
    completedSteps: string[];
    status: string;
    completionPercentage?: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalPaths: 0,
        activePaths: 0,
        completedPaths: 0,
        averageProgress: 0,
    });
    const [recentProgress, setRecentProgress] = useState<ProgressItem[]>([]);
    const [createdPaths, setCreatedPaths] = useState<Path[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadDashboardData();
    }, [isAuthenticated]);

    async function loadDashboardData() {
        try {
            setLoading(true);

            // Fetch user's created paths
            const pathsResponse: any = await api.getUserPaths();
            const paths = pathsResponse.success ? pathsResponse.data?.paths || [] : [];
            setCreatedPaths(paths.slice(0, 3)); // Latest 3

            // Fetch user's progress
            const progressResponse: any = await api.getUserProgress();
            const progress = progressResponse.success ? progressResponse.data?.progress || [] : [];
            setRecentProgress(progress.slice(0, 3)); // Latest 3

            // Calculate stats
            const activePaths = progress.filter((p: any) => p.status === 'active').length;
            const completedPaths = progress.filter((p: any) => p.status === 'completed').length;
            const avgProgress = progress.length > 0
                ? Math.round(progress.reduce((sum: number, p: any) => sum + (p.completionPercentage || 0), 0) / progress.length)
                : 0;

            setStats({
                totalPaths: paths.length,
                activePaths,
                completedPaths,
                averageProgress: avgProgress,
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <span className="text-2xl">🔥</span>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {user?.currentStreak || 0} Days
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="text-2xl">🏆</span>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {user?.longestStreak || 0} Days
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card className="p-6">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="text-2xl font-bold">{stats.totalPaths}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Paths Created</div>
                </Card>

                <Card className="p-6">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-2xl font-bold">{stats.activePaths}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Learning</div>
                </Card>

                <Card className="p-6">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold">{stats.completedPaths}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                </Card>

                <Card className="p-6">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold">{stats.averageProgress}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Progress</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Progress */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Continue Learning</h2>
                        <Link href="/explore">
                            <Button variant="ghost" className="text-sm">View All</Button>
                        </Link>
                    </div>

                    {recentProgress.length === 0 ? (
                        <Card className="p-8 text-center">
                            <div className="text-4xl mb-4">🎓</div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You haven't started any paths yet
                            </p>
                            <Link href="/explore">
                                <Button>Explore Paths</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {recentProgress.map((item) => (
                                <Link key={item.pathId._id} href={`/path/${item.pathId._id}/progress`}>
                                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold">{item.pathId.title}</h3>
                                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                                {item.pathId.category}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${item.completionPercentage || 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>{item.completedSteps?.length || 0} / {item.pathId.steps?.length || 0} steps</span>
                                            <span>{item.completionPercentage || 0}%</span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Created Paths */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Your Paths</h2>
                        <Link href="/dashboard/my-paths">
                            <Button variant="ghost" className="text-sm">View All</Button>
                        </Link>
                    </div>

                    {createdPaths.length === 0 ? (
                        <Card className="p-8 text-center">
                            <div className="text-4xl mb-4">✨</div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You haven't created any paths yet
                            </p>
                            <Link href="/dashboard/create-path">
                                <Button>Create Your First Path</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {createdPaths.map((path) => (
                                <Link key={path._id} href={`/path/${path._id}`}>
                                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold mb-1">{path.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>{path.category}</span>
                                                    <span>•</span>
                                                    <span>{path.steps?.length || 0} steps</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}

                            {createdPaths.length > 0 && createdPaths.length < 3 && (
                                <Link href="/dashboard/create-path">
                                    <Card className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer text-center">
                                        <div className="text-gray-400">+ Create New Path</div>
                                    </Card>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/create-path">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="text-3xl mb-3">✨</div>
                            <h3 className="font-bold mb-1">Create Path</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Build a new learning roadmap
                            </p>
                        </Card>
                    </Link>

                    <Link href="/explore">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="text-3xl mb-3">🔍</div>
                            <h3 className="font-bold mb-1">Explore</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Discover community paths
                            </p>
                        </Card>
                    </Link>

                    <Link href="/dashboard/my-paths">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="text-3xl mb-3">📚</div>
                            <h3 className="font-bold mb-1">My Paths</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your paths
                            </p>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
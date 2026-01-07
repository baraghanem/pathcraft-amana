'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface RouteParams {
    params: Promise<{ id: string }>;
}

interface Step {
    _id: string;
    title: string;
    description: string;
    estimatedDuration?: string;
    order: number;
}

interface Path {
    _id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    steps: Step[];
    author: { name: string; avatar?: string };
    cloneCount: number;
    isPublic: boolean;
}

export default function PathDetailsPage({ params }: RouteParams) {
    const [path, setPath] = useState<Path | null>(null);
    const [loading, setLoading] = useState(true);
    const [cloning, setCloning] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        loadPath();
    }, []);

    async function loadPath() {
        try {
            setLoading(true);
            const { id } = await params;
            const response: any = await api.getPath(id);
            if (response.success && response.data?.path) {
                setPath(response.data.path);
            }
        } catch (error) {
            console.error('Failed to load path:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleClone() {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        try {
            setCloning(true);
            const { id } = await params;
            const response: any = await api.clonePath(id);
            if (response.success) {
                alert('Path cloned successfully!');
                router.push('/dashboard/my-paths');
            }
        } catch (error: any) {
            alert(error.message || 'Failed to clone path');
        } finally {
            setCloning(false);
        }
    }

    async function handleStartTracking() {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        try {
            const { id } = await params;
            await api.startTracking(id);
            router.push(`/path/${id}/progress`);
        } catch (error: any) {
            alert(error.message || 'Failed to start tracking');
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!path) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
                <h1 className="text-2xl font-bold mb-4">Path not found</h1>
                <Button onClick={() => router.push('/explore')}>Back to Explore</Button>
            </div>
        );
    }

    const isOwner = user && path.author && user.id === (path.author as any)._id;

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                            {path.category}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                            {path.difficulty}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{path.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span>👤 By {path.author?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>📋 {path.cloneCount} clones</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    {isOwner ? (
                        <Button onClick={() => router.push(`/path/${path._id}/progress`)}>
                            View Progress
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleClone}
                                disabled={cloning}
                                className="flex items-center gap-2"
                            >
                                <span>📋</span> {cloning ? 'Cloning...' : 'Clone Path'}
                            </Button>
                            <Button onClick={handleStartTracking}>
                                Start Learning
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Overview */}
            <section className="mb-10">
                <h2 className="text-xl font-bold mb-4">Overview</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{path.description}</p>
            </section>

            {/* Steps */}
            <section>
                <h2 className="text-xl font-bold mb-6">Learning Steps ({path.steps.length})</h2>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:h-[calc(100%-20px)] before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                    {path.steps
                        .sort((a, b) => a.order - b.order)
                        .map((step, index) => (
                            <div key={step._id} className="relative flex gap-4">
                                {/* Number Indicator */}
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-bold z-10 ring-4 ring-white dark:ring-gray-950">
                                    {index + 1}
                                </div>
                                <Card className="flex-1 pt-1 pb-4 px-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold">{step.title}</h3>
                                        {step.estimatedDuration && (
                                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                ⏱️ {step.estimatedDuration}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                                </Card>
                            </div>
                        ))}
                </div>
            </section>

            {/* CTA Section */}
            {!isOwner && (
                <div className="mt-12 text-center">
                    <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                        <h3 className="text-2xl font-bold mb-2">Ready to start learning?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Clone this path to your account and track your progress
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={handleClone} disabled={cloning}>
                                Clone & Start Learning
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
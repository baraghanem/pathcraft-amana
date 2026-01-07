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
    order: number;
}

interface Progress {
    completedSteps: string[];
    status: string;
    pathId: {
        title: string;
        description: string;
        steps: Step[];
    };
}

export default function PathProgressPage({ params }: RouteParams) {
    const [progress, setProgress] = useState<Progress | null>(null);
    const [loading, setLoading] = useState(true);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [pathId, setPathId] = useState<string>('');
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadProgress();
    }, [isAuthenticated]);

    async function loadProgress() {
        try {
            setLoading(true);
            const { id } = await params;
            setPathId(id);

            const response: any = await api.getProgress(id);
            if (response.success && response.data?.progress) {
                setProgress(response.data.progress);
                setCompletionPercentage(response.data.completionPercentage || 0);
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
            // If no progress exists, try to create it
            try {
                const { id } = await params;
                await api.startTracking(id);
                loadProgress(); // Reload after creating
            } catch (err) {
                console.error('Failed to start tracking:', err);
            }
        } finally {
            setLoading(false);
        }
    }

    async function toggleStepCompletion(stepId: string, currentlyCompleted: boolean) {
        try {
            const response: any = await api.updateStepCompletion(
                pathId,
                stepId,
                !currentlyCompleted
            );

            if (response.success) {
                // Update local state
                setProgress(response.data.progress);
                setCompletionPercentage(response.data.completionPercentage);
            }
        } catch (error) {
            console.error('Failed to update step:', error);
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-3xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-3xl text-center">
                <h1 className="text-2xl font-bold mb-4">Progress not found</h1>
                <Button onClick={() => router.push('/explore')}>Back to Explore</Button>
            </div>
        );
    }

    const path = progress.pathId;
    const steps = path?.steps?.sort((a, b) => a.order - b.order) || [];

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{path?.title || 'Path Progress'}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {completionPercentage}% Complete
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push(`/path/${pathId}`)}
                    className="text-xs h-8"
                >
                    View Details
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-10">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#3b82f6] transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = progress.completedSteps?.includes(step._id);

                    return (
                        <Card
                            key={step._id}
                            className={`p-5 flex items-center justify-between border-gray-100 dark:border-gray-800 transition-all ${isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${isCompleted
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : 'border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {step.description}
                                    </p>
                                    {isCompleted && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                            <span>✓</span>
                                            <span>Completed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant={isCompleted ? 'outline' : 'primary'}
                                className="text-xs ml-4"
                                onClick={() => toggleStepCompletion(step._id, isCompleted)}
                            >
                                {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* Completion Message */}
            {completionPercentage === 100 && (
                <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You've completed this learning path!
                    </p>
                    <div className="mt-4 flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => router.push('/explore')}>
                            Explore More Paths
                        </Button>
                        <Button onClick={() => router.push('/dashboard/my-paths')}>
                            View My Paths
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
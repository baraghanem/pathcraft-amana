'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useState, FormEvent } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface Step {
    title: string;
    description: string;
    estimatedDuration?: string;
    order: number;
}

export default function CreatePathPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [steps, setSteps] = useState<Step[]>([
        { title: '', description: '', estimatedDuration: '', order: 0 }
    ]);
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiTopic, setAiTopic] = useState('');

    const { isAuthenticated } = useAuth();
    const router = useRouter();

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    function addStep() {
        setSteps([...steps, { title: '', description: '', estimatedDuration: '', order: steps.length }]);
    }

    function removeStep(index: number) {
        setSteps(steps.filter((_, i) => i !== index));
    }

    function updateStep(index: number, field: keyof Step, value: any) {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    }

    async function handleGenerateWithAI() {
        if (!aiTopic.trim()) {
            setError('Please enter a topic for AI generation');
            return;
        }

        try {
            setAiLoading(true);
            setError('');
            const response: any = await api.generateRoadmap({
                topic: aiTopic,
                difficulty,
            });

            if (response.success && response.data?.roadmap) {
                const roadmap = response.data.roadmap;
                setTitle(roadmap.title);
                setDescription(roadmap.description);
                setCategory(roadmap.category);
                setDifficulty(roadmap.difficulty);
                setSteps(roadmap.steps.map((step: any, index: number) => ({
                    title: step.title,
                    description: step.description,
                    estimatedDuration: step.estimatedDuration || '',
                    order: index,
                })));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate roadmap');
        } finally {
            setAiLoading(false);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');

        // Validation
        if (!title.trim() || !description.trim() || !category.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        const validSteps = steps.filter(s => s.title.trim() && s.description.trim());
        if (validSteps.length === 0) {
            setError('Please add at least one step');
            return;
        }

        try {
            setLoading(true);
            const pathData = {
                title,
                description,
                category,
                difficulty,
                steps: validSteps,
                isPublic,
            };

            const response: any = await api.createPath(pathData);
            if (response.success) {
                router.push('/dashboard/my-paths');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create path');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Create Learning Path</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* AI Generation Card */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-semibold mb-4">✨ Generate with AI</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Let AI create a learning roadmap for you based on a topic
                </p>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g., React Development, Python Basics"
                        value={aiTopic}
                        onChange={(e: any) => setAiTopic(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleGenerateWithAI}
                        disabled={aiLoading}
                        variant="default"
                    >
                        {aiLoading ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info Card */}
                <Card className="space-y-6">
                    <h2 className="text-xl font-semibold">General Information</h2>
                    <Input
                        label="Path Title *"
                        placeholder="e.g., Mastering Next.js 15"
                        value={title}
                        onChange={(e: any) => setTitle(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                Category *
                            </label>
                            <Input
                                placeholder="e.g., Web Development"
                                value={category}
                                onChange={(e: any) => setCategory(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                Difficulty *
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                                value={difficulty}
                                onChange={(e: any) => setDifficulty(e.target.value)}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                            Description *
                        </label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                            placeholder="What will students learn?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Make this path public
                        </label>
                    </div>
                </Card>

                {/* Steps Card */}
                <Card className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Path Steps</h2>
                        <span className="text-sm text-gray-500">{steps.length} steps</span>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                                    {steps.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                                            onClick={() => removeStep(index)}
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    placeholder="Step title"
                                    value={step.title}
                                    onChange={(e: any) => updateStep(index, 'title', e.target.value)}
                                />
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white dark:bg-gray-900 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                                    placeholder="Step description"
                                    value={step.description}
                                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                                />
                                <Input
                                    placeholder="Estimated duration (optional)"
                                    value={step.estimatedDuration}
                                    onChange={(e: any) => updateStep(index, 'estimatedDuration', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={addStep}
                    >
                        + Add Step
                    </Button>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/my-paths')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Path'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
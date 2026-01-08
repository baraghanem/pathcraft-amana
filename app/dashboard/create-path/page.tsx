'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useState, FormEvent } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { PATH_CATEGORIES, DIFFICULTY_LEVELS } from "@/lib/constants";

interface Step {
    title: string;
    description: string;
    estimatedDuration?: string;
    order: number;
}

interface GeneratedRoadmap {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    steps: Step[];
    timestamp: number;
    prompt: {
        topic: string;
        goal?: string;
        currentLevel?: string;
        difficulty: string;
    };
}

export default function ImprovedCreatePathPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(PATH_CATEGORIES[0]);
    const [difficulty, setDifficulty] = useState<(typeof DIFFICULTY_LEVELS)[number]>('Beginner');
    const [steps, setSteps] = useState<Step[]>([
        { title: '', description: '', estimatedDuration: '', order: 0 }
    ]);
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // AI Generation States
    const [aiLoading, setAiLoading] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiGoal, setAiGoal] = useState('');
    const [aiCurrentLevel, setAiCurrentLevel] = useState('');
    const [showAiAdvanced, setShowAiAdvanced] = useState(false);
    const [generatedRoadmap, setGeneratedRoadmap] = useState<GeneratedRoadmap | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [generationHistory, setGenerationHistory] = useState<GeneratedRoadmap[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
    const [editedStep, setEditedStep] = useState<Step | null>(null);

    // Example topics
    const exampleTopics = [
        "Full Stack Web Development",
        "Machine Learning with Python",
        "Mobile App Development",
        "Data Science Fundamentals",
        "DevOps Engineering",
        "UI/UX Design",
        "Blockchain Development",
        "Cloud Architecture (AWS)",
    ];

    // Load history from localStorage on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pathcraft_ai_history');
            if (saved) {
                try {
                    setGenerationHistory(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to load history:', e);
                }
            }
        }
    });

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
                goal: aiGoal || undefined,
                currentLevel: aiCurrentLevel || undefined,
            });

            if (response.success && response.data?.roadmap) {
                const roadmap = response.data.roadmap;
                const newRoadmap: GeneratedRoadmap = {
                    id: Date.now().toString(),
                    title: roadmap.title,
                    description: roadmap.description,
                    category: roadmap.category,
                    difficulty: roadmap.difficulty,
                    steps: roadmap.steps.map((step: any, index: number) => ({
                        title: step.title,
                        description: step.description,
                        estimatedDuration: step.estimatedDuration || '',
                        order: index,
                    })),
                    timestamp: Date.now(),
                    prompt: {
                        topic: aiTopic,
                        goal: aiGoal,
                        currentLevel: aiCurrentLevel,
                        difficulty,
                    }
                };

                setGeneratedRoadmap(newRoadmap);

                // Add to history
                const updatedHistory = [newRoadmap, ...generationHistory].slice(0, 10); // Keep last 10
                setGenerationHistory(updatedHistory);
                localStorage.setItem('pathcraft_ai_history', JSON.stringify(updatedHistory));

                setShowPreview(true);
            }
        } catch (err: any) {
            // Enhanced error handling
            if (err.message?.includes('AI generation is not configured')) {
                setError('⚠️ AI generation is currently unavailable. Please contact support or create your path manually.');
            } else if (err.message?.includes('Failed to parse')) {
                setError('AI generated an invalid response. Please try again with a different topic.');
            } else if (err.message?.includes('API key')) {
                setError('AI service is not properly configured. Please try again later.');
            } else {
                setError(err.message || 'Failed to generate roadmap. Please try again.');
            }
        } finally {
            setAiLoading(false);
        }
    }

    async function handleRegenerateWithSameInputs() {
        if (!generatedRoadmap) return;

        // Restore prompt values
        setAiTopic(generatedRoadmap.prompt.topic);
        setAiGoal(generatedRoadmap.prompt.goal || '');
        setAiCurrentLevel(generatedRoadmap.prompt.currentLevel || '');
        setDifficulty(generatedRoadmap.prompt.difficulty as any);

        // Close preview and regenerate
        setShowPreview(false);

        // Wait a bit for UI update
        setTimeout(() => {
            handleGenerateWithAI();
        }, 100);
    }

    function loadHistoryItem(item: GeneratedRoadmap) {
        setGeneratedRoadmap(item);
        setShowPreview(true);
        setShowHistory(false);
    }

    function saveToLibrary() {
        if (!generatedRoadmap) return;

        alert('Roadmap saved to your library! (This feature will store roadmaps separately from paths)');
        setShowPreview(false);
        setGeneratedRoadmap(null);

        // TODO: Implement actual save to library API
        // For now, it's already in localStorage history
    }

    function selectExampleTopic(topic: string) {
        setAiTopic(topic);
    }

    function startEditingStep(index: number) {
        if (!generatedRoadmap) return;
        setEditingStepIndex(index);
        setEditedStep({ ...generatedRoadmap.steps[index] });
    }

    function saveEditedStep() {
        if (!generatedRoadmap || editingStepIndex === null || !editedStep) return;

        const updatedSteps = [...generatedRoadmap.steps];
        updatedSteps[editingStepIndex] = editedStep;

        setGeneratedRoadmap({
            ...generatedRoadmap,
            steps: updatedSteps,
        });

        setEditingStepIndex(null);
        setEditedStep(null);
    }

    function cancelEditingStep() {
        setEditingStepIndex(null);
        setEditedStep(null);
    }

    function deleteHistoryItem(id: string) {
        const updatedHistory = generationHistory.filter(item => item.id !== id);
        setGenerationHistory(updatedHistory);
        localStorage.setItem('pathcraft_ai_history', JSON.stringify(updatedHistory));
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all generation history?')) {
            setGenerationHistory([]);
            localStorage.removeItem('pathcraft_ai_history');
        }
    }

    function applyGeneratedRoadmap() {
        if (!generatedRoadmap) return;

        setTitle(generatedRoadmap.title);
        setDescription(generatedRoadmap.description);
        setCategory(generatedRoadmap.category as any);
        setDifficulty(generatedRoadmap.difficulty);
        setSteps(generatedRoadmap.steps);
        setShowPreview(false);
        setGeneratedRoadmap(null);

        // Clear AI form
        setAiTopic('');
        setAiGoal('');
        setAiCurrentLevel('');
    }

    function cancelPreview() {
        setShowPreview(false);
        setGeneratedRoadmap(null);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');

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

            {/* AI Preview Modal */}
            {showPreview && generatedRoadmap && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <Card className="max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Preview AI-Generated Roadmap</h2>
                            <button
                                onClick={cancelPreview}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6 mb-6">
                            {/* Editable Title */}
                            <div>
                                <h3 className="font-semibold text-sm text-gray-500 mb-2">Title</h3>
                                <input
                                    type="text"
                                    className="w-full text-lg font-semibold border-b-2 border-gray-200 focus:border-blue-500 outline-none px-2 py-1"
                                    value={generatedRoadmap.title}
                                    onChange={(e) => setGeneratedRoadmap({
                                        ...generatedRoadmap,
                                        title: e.target.value
                                    })}
                                />
                            </div>

                            {/* Editable Description */}
                            <div>
                                <h3 className="font-semibold text-sm text-gray-500 mb-2">Description</h3>
                                <textarea
                                    className="w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none px-3 py-2"
                                    rows={3}
                                    value={generatedRoadmap.description}
                                    onChange={(e) => setGeneratedRoadmap({
                                        ...generatedRoadmap,
                                        description: e.target.value
                                    })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Editable Category */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500 mb-2">Category</h3>
                                    <input
                                        type="text"
                                        className="w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none px-3 py-2"
                                        value={generatedRoadmap.category}
                                        onChange={(e) => setGeneratedRoadmap({
                                            ...generatedRoadmap,
                                            category: e.target.value
                                        })}
                                    />
                                </div>

                                {/* Editable Difficulty */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500 mb-2">Difficulty</h3>
                                    <select
                                        className="w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none px-3 py-2"
                                        value={generatedRoadmap.difficulty}
                                        onChange={(e) => setGeneratedRoadmap({
                                            ...generatedRoadmap,
                                            difficulty: e.target.value as any
                                        })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Editable Steps */}
                            <div>
                                <h3 className="font-semibold text-sm text-gray-500 mb-3">
                                    Steps ({generatedRoadmap.steps.length})
                                </h3>
                                <div className="space-y-3">
                                    {generatedRoadmap.steps.map((step, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                                            {editingStepIndex === idx ? (
                                                // Edit mode
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        className="w-full font-semibold border-2 border-blue-500 rounded px-3 py-2"
                                                        value={editedStep?.title || ''}
                                                        onChange={(e) => setEditedStep(prev => prev ? { ...prev, title: e.target.value } : null)}
                                                    />
                                                    <textarea
                                                        className="w-full text-sm border-2 border-blue-500 rounded px-3 py-2"
                                                        rows={3}
                                                        value={editedStep?.description || ''}
                                                        onChange={(e) => setEditedStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="w-full text-xs border-2 border-blue-500 rounded px-3 py-2"
                                                        placeholder="Duration (e.g., 2 weeks)"
                                                        value={editedStep?.estimatedDuration || ''}
                                                        onChange={(e) => setEditedStep(prev => prev ? { ...prev, estimatedDuration: e.target.value } : null)}
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={cancelEditingStep}
                                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={saveEditedStep}
                                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View mode
                                                <div className="flex items-start gap-3">
                                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                                        {idx + 1}.
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{step.title}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {step.description}
                                                        </p>
                                                        {step.estimatedDuration && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                ⏱️ {step.estimatedDuration}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => startEditingStep(idx)}
                                                        className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-between border-t pt-4">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleRegenerateWithSameInputs}
                                    disabled={aiLoading}
                                >
                                    🔄 Regenerate
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={saveToLibrary}
                                >
                                    💾 Save to Library
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={cancelPreview}>
                                    Cancel
                                </Button>
                                <Button onClick={applyGeneratedRoadmap}>
                                    ✓ Use This Roadmap
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <Card className="max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Generation History</h2>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {generationHistory.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-4">📜</p>
                                <p>No generation history yet</p>
                                <p className="text-sm mt-2">Generate your first roadmap to see it here!</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={clearHistory}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Clear All History
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {generationHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => loadHistoryItem(item)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                                            {item.category}
                                                        </span>
                                                        <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                                                            {item.difficulty}
                                                        </span>
                                                        <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                                                            {item.steps.length} steps
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteHistoryItem(item.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            )}

            {/* AI Generation Card - Enhanced */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">✨</span>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">Generate with AI</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Let AI create a comprehensive learning roadmap based on your topic
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    >
                        📜 History {generationHistory.length > 0 && `(${generationHistory.length})`}
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Example Topics */}
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Quick examples:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {exampleTopics.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => selectExampleTopic(topic)}
                                    className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400 transition-colors"
                                    disabled={aiLoading}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., React Development, Python Machine Learning"
                            value={aiTopic}
                            onChange={(e: any) => setAiTopic(e.target.value)}
                            className="flex-1"
                            disabled={aiLoading}
                        />
                        <Button
                            onClick={handleGenerateWithAI}
                            disabled={aiLoading || !aiTopic.trim()}
                            variant="primary"
                        >
                            {aiLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⚙️</span>
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </Button>
                    </div>

                    {/* Advanced Options Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowAiAdvanced(!showAiAdvanced)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {showAiAdvanced ? '− Hide' : '+ Show'} Advanced Options
                    </button>

                    {showAiAdvanced && (
                        <div className="space-y-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                            <Input
                                label="Learning Goal (Optional)"
                                placeholder="e.g., Build production-ready applications"
                                value={aiGoal}
                                onChange={(e: any) => setAiGoal(e.target.value)}
                                disabled={aiLoading}
                            />
                            <Input
                                label="Current Knowledge Level (Optional)"
                                placeholder="e.g., I know HTML and CSS basics"
                                value={aiCurrentLevel}
                                onChange={(e: any) => setAiCurrentLevel(e.target.value)}
                                disabled={aiLoading}
                            />
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                    Difficulty Level
                                </label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                                    value={difficulty}
                                    onChange={(e: any) => setDifficulty(e.target.value)}
                                    disabled={aiLoading}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {aiLoading && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                            🤖 AI is crafting your personalized learning roadmap... This may take 10-20 seconds.
                        </div>
                    )}
                </div>
            </Card>

            {/* Rest of the form remains the same... */}
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
                            <select
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                                value={category}
                                onChange={(e: any) => setCategory(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {PATH_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
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
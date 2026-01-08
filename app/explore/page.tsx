'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

const categories = ["Web Development", "Data Science", "Design", "Mobile Dev", "DevOps"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

interface Path {
    _id: string;
    title: string;
    description: string;
    steps: any[];
    author: { name: string; avatar?: string };
    category: string;
    difficulty: string;
    cloneCount: number;
    tags?: string[];
}

export default function EnhancedExplorePage() {
    const [allPaths, setAllPaths] = useState<Path[]>([]);
    const [popularPaths, setPopularPaths] = useState<Path[]>([]);
    const [filteredPaths, setFilteredPaths] = useState<Path[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title'>('newest');

    useEffect(() => {
        fetchPaths();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedCategory, selectedDifficulty, sortBy, allPaths]);

    async function fetchPaths() {
        try {
            setLoading(true);

            // Fetch all paths
            const response: any = await api.getPaths({
                limit: 100,
            });

            if (response.success && response.data?.paths) {
                setAllPaths(response.data.paths);

                // Get popular paths (top 6 by clone count)
                const sorted = [...response.data.paths].sort((a, b) =>
                    (b.cloneCount || 0) - (a.cloneCount || 0)
                );
                setPopularPaths(sorted.slice(0, 6));
            }
        } catch (error) {
            console.error('Failed to fetch paths:', error);
        } finally {
            setLoading(false);
        }
    }

    function applyFilters() {
        let filtered = [...allPaths];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(path =>
                path.title.toLowerCase().includes(query) ||
                path.description.toLowerCase().includes(query) ||
                path.category.toLowerCase().includes(query) ||
                path.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(path => path.category === selectedCategory);
        }

        // Difficulty filter
        if (selectedDifficulty) {
            filtered = filtered.filter(path => path.difficulty === selectedDifficulty);
        }

        // Sort
        switch (sortBy) {
            case 'popular':
                filtered.sort((a, b) => (b.cloneCount || 0) - (a.cloneCount || 0));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
            default:
                // Already in newest first order from API
                break;
        }

        setFilteredPaths(filtered);
    }

    function clearFilters() {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedDifficulty('');
        setSortBy('newest');
    }

    const activeFiltersCount = [
        searchQuery,
        selectedCategory,
        selectedDifficulty,
    ].filter(Boolean).length;

    return (
        <div className="container mx-auto py-12 px-4">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Explore Learning Paths
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Discover community-created roadmaps and start your learning journey
                </p>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                        🔍
                    </span>
                    <Input
                        placeholder="Search for topics, categories, or keywords..."
                        className="pl-12 h-14 text-lg"
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span>📚 {allPaths.length} Total Paths</span>
                    <span>👥 {new Set(allPaths.map(p => p.author?.name)).size} Contributors</span>
                    <span>🔥 {popularPaths.length} Trending</span>
                </div>
            </div>

            {/* Popular Paths Section */}
            {!searchQuery && !selectedCategory && !selectedDifficulty && popularPaths.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span>🔥</span>
                            Most Popular Paths
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularPaths.map((path) => (
                            <Link
                                href={`/path/${path._id}`}
                                key={path._id}
                                className="block hover:no-underline transition-transform hover:-translate-y-1"
                            >
                                <Card className="h-full flex flex-col relative overflow-hidden">
                                    {/* Popular Badge */}
                                    <div className="absolute top-3 right-3 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        🔥 {path.cloneCount || 0}
                                    </div>

                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                            {path.category}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 pr-12">
                                        {path.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                                        {path.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <span>👤 {path.author?.name || 'Anonymous'}</span>
                                        <span>📝 {path.steps?.length || 0} Steps</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Filters Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">Filter & Sort</h3>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Clear all ({activeFiltersCount})
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900"
                        >
                            <option value="newest">Newest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="title">Alphabetical</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Category:</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategory === '' ? 'primary' : 'outline'}
                            className="text-sm py-1.5 px-4 rounded-full"
                            onClick={() => setSelectedCategory('')}
                        >
                            All Categories
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'primary' : 'outline'}
                                className="text-sm py-1.5 px-4 rounded-full"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Pills */}
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Difficulty:</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedDifficulty === '' ? 'primary' : 'outline'}
                            className="text-sm py-1.5 px-4 rounded-full"
                            onClick={() => setSelectedDifficulty('')}
                        >
                            All Levels
                        </Button>
                        {difficulties.map((diff) => (
                            <Button
                                key={diff}
                                variant={selectedDifficulty === diff ? 'primary' : 'outline'}
                                className="text-sm py-1.5 px-4 rounded-full"
                                onClick={() => setSelectedDifficulty(diff)}
                            >
                                {diff}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {filteredPaths.length === allPaths.length ? 'All Paths' : 'Search Results'}
                    <span className="text-gray-500 ml-2">({filteredPaths.length})</span>
                </h2>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="h-48 animate-pulse bg-gray-200 dark:bg-gray-800">
                            <></>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredPaths.length === 0 && (
                <Card className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No paths found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Try adjusting your search or filters
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                </Card>
            )}

            {/* Grid of Paths */}
            {!loading && filteredPaths.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPaths.map((path) => (
                        <Link
                            href={`/path/${path._id}`}
                            key={path._id}
                            className="block hover:no-underline transition-transform hover:-translate-y-1"
                        >
                            <Card className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                        {path.category}
                                    </span>
                                    <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                                        {path.difficulty}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                    {path.title}
                                </h3>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                                    {path.description}
                                </p>

                                {path.tags && path.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {path.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span>👤 {path.author?.name || 'Anonymous'}</span>
                                    <div className="flex items-center gap-3">
                                        <span>📝 {path.steps?.length || 0}</span>
                                        {(path.cloneCount || 0) > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span>📋</span>
                                                <span>{path.cloneCount}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
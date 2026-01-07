'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

// Mock Data will be replaced with real API data
const categories = ["Web Development", "Data Science", "Design", "Mobile Dev", "DevOps"];

interface Path {
    _id: string;
    title: string;
    steps: any[];
    author: { name: string; avatar?: string };
    category: string;
}

export default function ExplorePage() {
    const [roadmaps, setRoadmaps] = useState<Path[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchPaths();
    }, [searchQuery, selectedCategory]);

    async function fetchPaths() {
        try {
            setLoading(true);
            const response: any = await api.getPaths({
                query: searchQuery || undefined,
                category: selectedCategory || undefined,
                limit: 20,
            });

            if (response.success && response.data?.paths) {
                setRoadmaps(response.data.paths);
            }
        } catch (error) {
            console.error('Failed to fetch paths:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Explore Paths</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Discover learning paths created by the community.</p>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <div className="relative w-full md:w-96">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <Input
                            placeholder="Search for a topic..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                            variant={selectedCategory === '' ? 'primary' : 'outline'}
                            className="text-sm py-1 rounded-full"
                            onClick={() => setSelectedCategory('')}
                        >
                            All
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'primary' : 'outline'}
                                className="text-sm py-1 rounded-full"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="h-40 animate-pulse bg-gray-200 dark:bg-gray-800" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && roadmaps.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No paths found. Try adjusting your search or filters.
                    </p>
                </div>
            )}

            {/* Grid of Roadmaps */}
            {!loading && roadmaps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((map) => (
                        <Link
                            href={`/path/${map._id}`}
                            key={map._id}
                            className="block hover:no-underline transition-transform hover:-translate-y-1"
                        >
                            <Card className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg line-clamp-2">{map.title}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full whitespace-nowrap">
                                        {map.category}
                                    </span>
                                </div>
                                <div className="mt-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>👤 {map.author?.name || 'Anonymous'}</span>
                                    <span>📝 {map.steps?.length || 0} Steps</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
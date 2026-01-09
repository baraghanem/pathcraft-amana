'use client';

import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

export default function AdminPage() {
    const [paths, setPaths] = useState([]);

    useEffect(() => {
        // Fetch all paths (you'll need an admin-only API route for this)
        api.request('/api/paths?admin=true').then((res: any) => {
            if (res.success) setPaths(res.data.paths);
        });
    }, []);

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Admin Control Panel</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="bg-blue-600 text-white">
                    <p className="opacity-80">Total Paths</p>
                    <h2 className="text-4xl font-bold">{paths.length}</h2>
                </Card>
                <Card>
                    <p className="text-gray-500">Active Users</p>
                    <h2 className="text-4xl font-bold text-gray-800">124</h2>
                </Card>
                <Card>
                    <p className="text-gray-500">AI Tokens Used</p>
                    <h2 className="text-4xl font-bold text-gray-800">45.2k</h2>
                </Card>
            </div>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paths.map((path: any) => (
                            <tr key={path._id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="p-4 font-medium">{path.title}</td>
                                <td className="p-4">{path.category}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Public</span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <Button variant="outline" className="h-8 text-xs">Features</Button>
                                    <Button variant="ghost" className="h-8 text-xs text-red-600">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
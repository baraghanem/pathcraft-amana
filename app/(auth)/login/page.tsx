'use client';

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Welcome back to PathCraft</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300 dark:before:border-gray-700 dark:after:border-gray-700">
                    <p className="mx-4 mb-0 text-center text-sm text-gray-500 dark:text-gray-400">
                        OR
                    </p>
                </div>

                <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                    <span className="text-lg">🐙</span> Sign in with GitHub (Coming Soon)
                </Button>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-medium text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </Card>
        </div>
    );
}
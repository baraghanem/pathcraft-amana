'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useNotifications } from "../context/NotificationContext";

export const Navbar = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const { unreadCount } = useNotifications();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push('/');
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-gray-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="text-xl">🔔</span>
                    {/* Real-time Unread Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                            {unreadCount}
                        </span>
                    )}
                </Link>
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/logo.png"
                        alt="PathCraft Logo"
                        width={32}
                        height={32}
                        className="transition-transform group-hover:scale-110"
                    />
                    <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                        Path<span className="text-[#3b82f6]">Craft</span>
                    </span>
                </Link>

                <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Link href="/explore" className="hover:text-[#3b82f6] transition-colors">Explore</Link>
                    {isAuthenticated && (
                        <>
                            <Link href="/dashboard" className="hover:text-[#3b82f6] transition-colors">Dashboard</Link>
                            <Link href="/dashboard/my-paths" className="hover:text-[#3b82f6] transition-colors">My Paths</Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : isAuthenticated && user ? (
                        <>
                            <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
                                Hi, {user.name}
                            </span>
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="hidden sm:inline-flex"
                            >
                                Logout
                            </Button>
                            <Link href="/dashboard/create-path">
                                <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">Create Path</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="hidden sm:inline-flex">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
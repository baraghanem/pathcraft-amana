import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl text-gray-900 dark:text-white">
                    Build Your Learning Path. <br className="hidden md:block" />{" "}
                    <span className="text-blue-600">Track Your Progress.</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                    Create custom roadmaps, follow community paths, and achieve your goals faster with structured learning.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <Link href="/explore">
                        <Button className="w-full sm:w-auto text-lg px-8 py-3">Get Started</Button>
                    </Link>
                    <Link href="/explore">
                        <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-3">Explore Paths</Button>
                    </Link>
                </div>
                {/* Placeholder for Hero Image/Illustration present in wireframe */}
                <div className="mt-20 w-full max-w-4xl h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center text-gray-400">
                    [Hero Illustration Placeholder]
                    {/* Use <Image /> here in real app */}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-950 px-4">
                <div className="container mx-auto grid md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">🗺️</div>
                        <h3 className="text-xl font-semibold mb-2">Plan Your Learning</h3>
                        <p className="text-gray-600 dark:text-gray-400">Structure your goals into manageable steps and milestones.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4">✅</div>
                        <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                        <p className="text-gray-600 dark:text-gray-400">Mark steps complete and visualize how far you've come.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4">🚀</div>
                        <h3 className="text-xl font-semibold mb-2">Share Your Path</h3>
                        <p className="text-gray-600 dark:text-gray-400">Help others by sharing your roadmaps with the community.</p>
                    </div>
                </div>
            </section>

            {/* Example Roadmap Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900 px-4 text-center">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold mb-10">Example Roadmap</h2>
                    {/* Placeholder for the roadmap graphic in wireframe */}
                    <div className="w-full max-w-4xl mx-auto h-80 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
                        [Roadmap Visualization Placeholder]
                    </div>
                </div>
            </section>
        </div>
    );
}
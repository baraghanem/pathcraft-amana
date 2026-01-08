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
                <div className="mt-20 w-full max-w-4xl h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center">
                    <Image
                        src="https://illustrations.popsy.co/amber/remote-work.svg"
                        alt="Learning Illustration"
                        width={800}
                        height={600}
                        className="w-full h-full object-contain"
                    />
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
                    <div className="w-full max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            {/* Vertical timeline with steps */}
                            <div className="flex flex-col gap-8">
                                {[
                                    { title: "HTML & CSS Basics", desc: "Learn the building blocks of the web" },
                                    { title: "JavaScript Fundamentals", desc: "Master variables, loops, and functions" },
                                    { title: "Frontend Frameworks", desc: "Build complex UIs with React or Vue" },
                                    { title: "Backend Development", desc: "Server-side logic with Node.js or Python" },
                                    { title: "Deployment & DevOps", desc: "Cloud hosting, CI/CD, and scaling" }
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-blue-500/30">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{step.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
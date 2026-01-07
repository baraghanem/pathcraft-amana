import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathCraft - Build Your Learning Path",
  description: "Track your progress and share knowledge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <AuthProvider>
          {/* We might conditionally render Navbar based on route in a real app, 
              but it's present in almost all wireframes except Login, so we leave it here for now. */}
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          {/* Add Footer here later */}
        </AuthProvider>
      </body>
    </html>
  );
}
"use client";

import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/auth/Navbar";

export default function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl mx-auto text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          
          {session ? (
            // Authenticated user content
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {session.user?.name}! 🎉
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                You're successfully signed in. Explore your dashboard or continue building amazing things.
              </p>
              <div className="flex gap-4 items-center flex-col sm:flex-row">
                <Button
                  onClick={() => window.location.href = "/dashboard"}
                  size="lg"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = "https://nextjs.org/docs"}
                >
                  View Documentation
                </Button>
              </div>
            </div>
          ) : (
            // Non-authenticated user content
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Your Next.js App
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Get started by signing up for an account or sign in if you already have one. 
                Experience secure authentication with email/password or Google OAuth.
              </p>
              
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Features</h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email & Password Authentication
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Google OAuth Integration
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Protected Routes
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Secure Session Management
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 items-center flex-col sm:flex-row">
                <Button
                  onClick={() => window.location.href = "/auth"}
                  size="lg"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = "https://nextjs.org/docs"}
                >
                  Read Documentation
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

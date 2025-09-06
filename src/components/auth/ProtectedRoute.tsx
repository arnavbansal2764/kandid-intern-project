"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only redirect if we're not pending and there's no session
    if (isClient && !isPending && !session) {
      console.log("ProtectedRoute: No session found, redirecting to auth");
      router.push("/auth");
    }
  }, [session, isPending, router, isClient]);

  // Show loading spinner while checking session or on server
  if (!isClient || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied if no session after loading
  if (!session) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be signed in to view this page.</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}

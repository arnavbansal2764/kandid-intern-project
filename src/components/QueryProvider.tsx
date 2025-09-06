"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep unused data for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests twice
            retry: 2,
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Background refetch on window focus
            refetchOnWindowFocus: true,
            // Background refetch when reconnecting
            refetchOnReconnect: true,
            // Don't refetch on mount if data is fresh
            refetchOnMount: "always",
            // Enable background refetching
            refetchInterval: 5 * 60 * 1000, // 5 minutes
            // Only refetch in background if page is visible
            refetchIntervalInBackground: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Network error retry delay
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

import { QueryClient } from "@tanstack/react-query";

/**
 * creates and configures the queryClient for the application
 */

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime vs gcTime explained:
        // staletime = how long to consider data fresh (won't refetch while fresh)
        // gcTime = how long to keep data in cache before garbage collecting it
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
          // don't retry 4xx errors (client errors like 401 or 404)
          // retry 5xx errors (server errors like 500 or 503)
          if (error && typeof error === "object" && "status" in error) {
            const { status } = error as { status: number };
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        // Don't auto fetch on internet re-connection
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

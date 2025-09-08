import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: true, // Refresh auth on window focus
    staleTime: 5 * 60 * 1000, // Consider auth data stale after 5 minutes
  });

  // If we get a 401 error, clear the auth cache
  if (error && (error as any)?.response?.status === 401) {
    queryClient.setQueryData(["/api/auth/user"], null);
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

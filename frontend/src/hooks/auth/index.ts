import { useAppQuery } from "../../lib/reactQuery.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { apiService } from "../../services/api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiService.login(email, password),
    onSuccess: () => {
      // Token is now in HTTP-only cookie, just invalidate the query
      // to refetch the current user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => apiService.register(email, password, name),
    onSuccess: () => {
      // Token is now in HTTP-only cookie, just invalidate the query
      // to refetch the current user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useCurrentUser() {
  // With HTTP-only cookies, we always check for the user
  // The cookie will be automatically sent with requests
  // Enable the query on mount to check if user is logged in
  return useAppQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiService.getCurrentUser(),
    retry: false,
    staleTime: 60_000,
    select: (response) => response.data,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

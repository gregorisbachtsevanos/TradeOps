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
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useCurrentUser() {
  const hasToken = Boolean(localStorage.getItem("auth_token"));
  return useAppQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiService.getCurrentUser(),
    enabled: hasToken,
    retry: false,
    staleTime: 60_000,
    select: (response) => response.data,
  });
}

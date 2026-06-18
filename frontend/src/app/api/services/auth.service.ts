import { IApiResponse } from "@/app/types";
import { apiClient } from "../api.client";

export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiClient
      .post<IApiResponse<any>>("/auth/register", {
        email,
        password,
        name,
      })
      .then((res) => res.data),

  login: (email: string, password: string) =>
    apiClient
      .post<IApiResponse<any>>("/auth/login", {
        email,
        password,
      })
      .then((res) => res.data),

  logout: () =>
    apiClient.post<IApiResponse>("/auth/logout").then((res) => res.data),

  me: () =>
    apiClient.get<IApiResponse<any>>("/auth/me").then((res) => res.data),
};

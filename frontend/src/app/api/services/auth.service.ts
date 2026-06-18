import { IApiResponse } from "@/app/types";
import { apiService } from "../api";

export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiService
      .post<IApiResponse<any>>("/auth/register", {
        email,
        password,
        name,
      })
      .then((res) => res.data),

  login: (email: string, password: string) =>
    apiService
      .post<IApiResponse<any>>("/auth/login", {
        email,
        password,
      })
      .then((res) => res.data),

  logout: () =>
    apiService.post<IApiResponse>("/auth/logout").then((res) => res.data),

  me: () =>
    apiService.get<IApiResponse<any>>("/auth/me").then((res) => res.data),
};

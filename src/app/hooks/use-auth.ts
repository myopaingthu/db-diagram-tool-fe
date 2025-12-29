import { useState } from "react";
import { useAuthStore } from "@/app/store";
import { useApi } from "@/app/services/api";
import type { RegisterDto, LoginDto, ApiResponse, AuthResponse } from "@/app/types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const api = useApi();

  const register = async (dto: RegisterDto): Promise<ApiResponse<AuthResponse>> => {
    setLoading(true);
    try {
        const response = await api.auth.register(dto);
      console.log(response);
      if (response.status && response.data) {
        login(response.data.user, response.data.token);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (dto: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    setLoading(true);
    try {
      const response = await api.auth.login(dto);
      if (response.status && response.data) {
        login(response.data.user, response.data.token);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    logout();
  };

  return {
    register,
    login: handleLogin,
    logout: handleLogout,
    loading,
    user,
    isAuthenticated,
  };
};


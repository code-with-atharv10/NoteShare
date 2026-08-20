import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("noteshare_token"));

  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  // If the query fails, it usually means the token is invalid or expired
  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const setToken = (newToken: string) => {
    localStorage.setItem("noteshare_token", newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    localStorage.removeItem("noteshare_token");
    setTokenState(null);
    queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
    setLocation("/login");
  };

  return {
    user: user || null,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user,
    setToken,
    logout
  };
}

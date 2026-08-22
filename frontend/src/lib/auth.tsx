import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";
import { connectChat, disconnectChat } from "./chatSocket";
import type { AuthResponse, UserSummary } from "../types";

interface AuthContextValue {
  user: UserSummary | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestSignup: (name: string, username: string, email: string, password: string) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<UserSummary>) => void;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<UserSummary>("/auth/me")
      .then((res) => {
        setUser(res.data);
        connectChat();
      })
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  function applyAuthResponse(data: AuthResponse) {
    tokenStore.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    connectChat();
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    applyAuthResponse(data);
  }

  async function requestSignup(name: string, username: string, email: string, password: string) {
    await api.post("/auth/signup-request", { name, username, email, password });
  }

  async function confirmSignup(email: string, code: string) {
    const { data } = await api.post<AuthResponse>("/auth/signup-confirm", { email, code });
    applyAuthResponse(data);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
    disconnectChat();
  }

  function updateUser(partial: Partial<UserSummary>) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  async function resendVerification() {
    await api.post("/auth/resend-verification");
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, requestSignup, confirmSignup, logout, updateUser, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

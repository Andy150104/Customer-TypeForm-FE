// src/stores/useSessionStore.ts
import { TokenVerifyResponse } from "EduSmart/api/api-auth-service";
import apiClient from "EduSmart/hooks/apiClient";
import { create } from "zustand";
interface SessionState {
  session: TokenVerifyResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchSession: () => Promise<void>;
}

export const useSessionAuthStore = create<SessionState>((set) => ({
  session: null,
  isLoading: false,
  error: null,
  fetchSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.authEduService.verifyToken.verifyTokenCreate();
      set({ session: res.data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      set({ error: message, isLoading: false });
    }
  },
}));

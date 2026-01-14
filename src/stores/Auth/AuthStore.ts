// src/stores/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import apiClient from "EduSmart/hooks/apiClient";
import {
  getAuthen,
  insertStudentAction,
  loginAction,
  logoutAction,
  refreshAction,
} from "EduSmart/app/(auth)/action";
import { ForgotPasswordResponse, ResetPasswordResponse, TokenVerifyResponse } from "EduSmart/api/api-auth-service";
import { BasicUser } from "EduSmart/lib/authServer";

export interface AuthState {
  token: string | null;
  user: BasicUser | null;
  isAuthen: boolean;
  refreshTokenValue: string | null;
  isOtherSystem: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (key: string, newPassword: string) => Promise<ResetPasswordResponse>;
  refreshToken: () => Promise<void>;
  logout: () => void;
  getAuthen: () => Promise<boolean>;
  insertStudent: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<TokenVerifyResponse>;
  verifyyEmail?: (key: string) => Promise<boolean>;
}

type PersistedAuth = {
  token: string | null;
};

const cookieRawStorage = {
  getItem: (name: string) => Cookies.get(name) ?? null,
  setItem: (name: string, value: string) =>
    Cookies.set(name, value, { expires: 7, sameSite: "lax", path: "/" }),
  removeItem: (name: string) => Cookies.remove(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthen: false,
      refreshTokenValue: null,
      isOtherSystem: false,

      reset: () => {
        set({ token: null, refreshTokenValue: null, isOtherSystem: false, });
        Cookies.remove("auth-storage");
      },

      getAuthen: async () => {
        const ok = await getAuthen(); // Server Action
        set({ isAuthen: ok }); // ← cập nhật store để UI theo dõi
        return ok;
      },

      insertStudent: async (email, password, firstName, lastName) => {
        const res = await insertStudentAction({
          email,
          password,
          firstName,
          lastName,
        });
        sessionStorage.setItem("justRegisteredEmail", email);
        if (!res.ok) throw new Error(res.error || "InsertStudent failed");
        return res.data;
      },

      login: async (email, password) => {
        try {
          const resp = await loginAction({ email, password });
          if (resp.redirectUrl) {
            if (typeof window !== "undefined") {
              window.location.href = resp.redirectUrl;
            }
            set({ isOtherSystem: true });
            return false;
          }
          if (resp.ok) {
            await getAuthen();
            const token = resp.accessToken;
            const user: BasicUser = resp.user ?? {
              name: "",
              email: "",
              role: "",
            };
            set({ token, user });
            apiClient.authEduService.setSecurityData({ token });
            return true;
          }
          console.log("resp", resp.error);
          return false;
        } catch {
          return false;
        }
      },

      forgotPassword: async (email) => {
        const resp =
          await apiClient.authEduService.api.v1AccountForgotPasswordCreate({
            email,
          });
        return resp.data;
      },
      resetPassword: async (key, newPassword) => {
        const resp =
          await apiClient.authEduService.api.v1AccountResetPasswordCreate({
            key: key,
            newPassword: newPassword,
          });
        return resp.data;
      },

      // 2) Refresh token và revoke khi cần
      refreshToken: async () => {
        console.log("[AuthStore] refreshToken called");
        const res = await refreshAction();
        if (!res.ok || !res.accessToken) {
          console.error("[AuthStore] refreshToken failed:", res.error);
          // Chỉ clear token nếu thực sự fail, không phải do "No session" với token còn valid
          set({ token: null });
          apiClient.authEduService.setSecurityData({ token: undefined });
          throw new Error(res.error || "Refresh failed");
        }
        
        // Đảm bảo token được set đúng cách
        const newToken = res.accessToken;
        if (!newToken || typeof newToken !== "string" || newToken.trim() === "") {
          console.error("[AuthStore] Invalid token received:", newToken);
          set({ token: null });
          apiClient.authEduService.setSecurityData({ token: undefined });
          throw new Error("Invalid token received");
        }
        
        console.log("[AuthStore] refreshToken success, updating token (length:", newToken.length, ")");
        set({ token: newToken });
        apiClient.authEduService.setSecurityData({ token: newToken });
      },

      logout: async () => {
        await logoutAction();
        set({ token: null, refreshTokenValue: null });
        apiClient.authEduService.setSecurityData({
          token: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage<PersistedAuth>(() => cookieRawStorage),
      partialize: (s) => ({
        token: s.token,
        refreshTokenValue: s.refreshTokenValue,
        user: s.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          apiClient.authEduService.setSecurityData({
            token: (state as PersistedAuth).token,
          });
        }
      },
    },
  ),
);

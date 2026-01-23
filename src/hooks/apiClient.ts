// src/apiClient.ts
import axios, {
  AxiosInstance,
  Method,
  AxiosRequestConfig,
  AxiosError,
} from "axios";
import { Api as AuthEduClientApi } from "EduSmart/api/api-auth-service";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";

// 1) Tạo axios instance chung
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ví dụ: "https://api.emoease.vn"
});

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Lock mechanism để tránh race condition khi refresh token
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const onRefreshed = (token: string | null) => {
  // Notify tất cả subscribers trước khi reset
  refreshSubscribers.forEach((cb) => {
    try {
      cb(token);
    } catch (err) {
      console.error("Error in refresh subscriber:", err);
    }
  });
  refreshSubscribers = [];
  isRefreshing = false;
};

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

axiosInstance.interceptors.request.use((cfg) => {
  const h = axios.AxiosHeaders.from(cfg.headers);
  const base = cfg.baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = cfg.url ?? "";
  if (base.includes("ngrok") || url.includes("ngrok")) {
    h.set("ngrok-skip-browser-warning", "true");
  }
  const { token } = useAuthStore.getState();
  if (token) {
    h.set("Authorization", `Bearer ${token}`);
  }
  cfg.headers = h;
  return cfg;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: RetryConfig }) => {
    const status = error.response?.status;
    const originalRequest = error.config!;
    
    // Kiểm tra xem có đang ở payment page không
    // Nếu có, KHÔNG logout để tránh gián đoạn flow thanh toán khi redirect về từ PayOS
    // Check cả pathname, URL và query params để đảm bảo chính xác
    const isPaymentPage = (() => {
      if (typeof window === "undefined") return false;
      const pathname = window.location.pathname;
      const href = window.location.href;
      const search = window.location.search;
      // Check pathname, href, hoặc query params có chứa payment/callback từ PayOS
      return (
        pathname.startsWith("/payment") ||
        href.includes("/payment") ||
        search.includes("orderId") ||
        search.includes("code") ||
        search.includes("status") ||
        search.includes("orderCode")
      );
    })();
    
    // Debug log để kiểm tra
    if (isPaymentPage && (status === 401 || status === 403 || status === 418)) {
      console.log("🚫 [Payment Page] Skipping logout for status", status, "at", window.location.pathname, window.location.href);
    }
    
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đang refresh, subscribe vào refresh promise
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers = axios.AxiosHeaders.from(
                originalRequest.headers,
              );
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
              originalRequest.headers.set("ngrok-skip-browser-warning", "true");
              resolve(axiosInstance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      // Bắt đầu refresh token
      isRefreshing = true;
      
      // Lưu token hiện tại trước khi refresh (để có thể retry nếu refresh fail do "No session")
      const tokenBeforeRefresh = useAuthStore.getState().token;
      
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().token;
        
        if (newToken) {
          originalRequest.headers = axios.AxiosHeaders.from(
            originalRequest.headers,
          );
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
          originalRequest.headers.set("ngrok-skip-browser-warning", "true");
          
          // Notify subscribers và reset flag (trong onRefreshed)
          onRefreshed(newToken);
          
          return axiosInstance(originalRequest);
        } else {
          // Nếu không có token sau khi refresh, chỉ logout nếu KHÔNG ở payment page
          onRefreshed(null);
          
          if (!isPaymentPage) {
            useAuthStore.getState().logout();
            useValidateStore.getState().setInValid(true);
          }
          return Promise.reject(error);
        }
      } catch (refreshError: unknown) {
        console.error("Refresh token failed:", refreshError);
        
        // Kiểm tra xem error có phải là "No session" không
        const errorMessage = refreshError instanceof Error ? refreshError.message : String(refreshError);
        const isNoSessionError = errorMessage.includes("No session") || errorMessage.includes("Session not found");
        
        // Nếu là "No session" error nhưng vẫn có token trước đó
        // (có thể cookie chỉ tạm thời không có do race condition), 
        // không logout ngay mà retry với token cũ một lần
        if (isNoSessionError && tokenBeforeRefresh) {
          console.warn("Refresh failed with 'No session' but had token before, retrying request with previous token");
          
          // Restore token trong store bằng cách set lại
          useAuthStore.setState({ token: tokenBeforeRefresh });
          apiClient.authEduService.setSecurityData({ token: tokenBeforeRefresh });
          
          onRefreshed(tokenBeforeRefresh);
          
          // Retry với token trước đó (có thể vẫn còn valid)
          originalRequest.headers = axios.AxiosHeaders.from(
            originalRequest.headers,
          );
          originalRequest.headers.set("Authorization", `Bearer ${tokenBeforeRefresh}`);
          originalRequest.headers.set("ngrok-skip-browser-warning", "true");
          return axiosInstance(originalRequest);
        }
        
        onRefreshed(null);
        
        // Logout chỉ khi không phải payment page
        if (!isPaymentPage) {
          useAuthStore.getState().logout();
          useValidateStore.getState().setInValid(true);
        }
        return Promise.reject(error);
      }
    }
    
    // Với 403 và 418, thử refresh token trước khi logout (có thể là token expired)
    // Chỉ logout nếu KHÔNG ở payment page và chưa retry
    if ((status === 403 || status === 418) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Thử refresh token trước (403 có thể là token expired)
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await useAuthStore.getState().refreshToken();
          const newToken = useAuthStore.getState().token;
          if (newToken) {
            // Retry request với token mới
            originalRequest.headers = axios.AxiosHeaders.from(
              originalRequest.headers,
            );
            originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            originalRequest.headers.set("ngrok-skip-browser-warning", "true");
            isRefreshing = false;
            onRefreshed(newToken);
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed for 403/418:", refreshError);
          isRefreshing = false;
          onRefreshed(null);
          // Chỉ logout nếu không phải payment page
      if (!isPaymentPage) {
        useAuthStore.getState().logout();
        useValidateStore.getState().setInValid(true);
          }
        }
      } else {
        // Đang refresh, đợi token mới
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers = axios.AxiosHeaders.from(
                originalRequest.headers,
              );
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
              originalRequest.headers.set("ngrok-skip-browser-warning", "true");
              resolve(axiosInstance(originalRequest));
            } else {
              if (!isPaymentPage) {
                useAuthStore.getState().logout();
                useValidateStore.getState().setInValid(true);
              }
              reject(error);
            }
          });
        });
      }
    }
    return Promise.reject(error);
  },
);
// 2) Adapter để Swagger-client gọi qua axios
const axiosFetch: typeof fetch = async (input, init = {}) => {
  const url = input.toString();

  // Chuẩn hóa headers từ HeadersInit → Record<string,string>
  let headers: Record<string, string> = {};
  if (init.headers instanceof Headers) {
    headers = Object.fromEntries(init.headers.entries());
  } else if (Array.isArray(init.headers)) {
    headers = Object.fromEntries(init.headers);
  } else if (init.headers && typeof init.headers === "object") {
    headers = init.headers as Record<string, string>;
  }

  const params = (init as unknown as { params?: Record<string, unknown> })
    .params;

  const config: AxiosRequestConfig = {
    url,
    method: (init.method as Method) ?? "GET",
    headers,
    data: init.body,
    params,
  };

  const res = await axiosInstance.request(config);

  // Chuyển axios headers thành HeadersInit (Headers)
  const responseHeaders = new Headers();
  Object.entries(res.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => responseHeaders.append(key, String(v)));
    } else if (value != null) {
      responseHeaders.set(key, String(value));
    }
  });

  // Trả về Response giống Fetch API
  return new Response(JSON.stringify(res.data), {
    status: res.status,
    headers: responseHeaders,
  });
};

export const AuthEduClient = new AuthEduClientApi({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  customFetch: axiosFetch,
});

const apiClient = {
  authEduService: AuthEduClient,
};

export default apiClient;

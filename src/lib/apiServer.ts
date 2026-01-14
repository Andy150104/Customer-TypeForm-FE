// src/lib/apiServer.ts
// Wrapper cho client swagger-typescript-api (fetch-based)

import { Agent, setGlobalDispatcher } from "undici";
import { Api as AuthApi } from "EduSmart/api/api-auth-service"; // <-- đường dẫn tới file đã gen
import {
    getAuthHeaderFromCookie,
    getSidFromCookie,
    refreshTokens,
} from "./authServer";
import { loadTokens } from "./sessionStore";

const BACKEND = process.env.API_URL!;

// Dev: tạm bỏ verify TLS self-signed
if (process.env.NODE_ENV !== "production") {
    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    setGlobalDispatcher(agent);
}

// Lock mechanism để tránh race condition khi refresh token (server-side)
let isRefreshingServer = false;
let refreshServerPromise: Promise<boolean> | null = null;

// customFetch: nếu 401 hoặc 403 -> refresh -> retry 1 lần
// (403 có thể là token expired hoặc không hợp lệ)
const with401Retry: typeof fetch = async (input, init) => {
    const resp = await fetch(input, { cache: "no-store", ...init });
    
    // Xử lý cả 401 và 403 (403 có thể là token expired)
    if (resp.status !== 401 && resp.status !== 403) return resp;

    // Thử lấy sid từ cookie
    let sid = await getSidFromCookie();
    
    // Fallback: nếu sid null, thử đọc trực tiếp từ cookie payload
    // với cả hai cookie names (sid và __Host-sid)
    if (!sid) {
        const { readSidCookiePayload } = await import("./authServer");
        const payload = await readSidCookiePayload();
        
        if (payload?.sid) {
            sid = payload.sid;
            console.log("[with401Retry] Recovered sid from cookie payload:", sid);
        } else {
            // Fallback: thử đọc trực tiếp từ cookie với cả hai names
            const { cookies } = await import("next/headers");
            const jar = await cookies();
            const cookieNames = ["sid", "__Host-sid"];
            
            for (const cookieName of cookieNames) {
                const cookie = jar.get(cookieName);
                if (cookie?.value) {
                    console.log(`[with401Retry] Found cookie '${cookieName}', trying to parse...`);
                    
                    // Thử decode base64url và parse JSON
                    try {
                        const decoded = Buffer.from(cookie.value, "base64url").toString("utf8");
                        const parsed = JSON.parse(decoded);
                        
                        if (parsed?.sid && typeof parsed.sid === "string") {
                            sid = parsed.sid;
                            console.log("[with401Retry] Successfully parsed sid from cookie:", sid);
                            break;
                        }
                    } catch (err) {
                        console.error(`[with401Retry] Error parsing cookie '${cookieName}':`, err);
                    }
                }
            }
        }
    }
    
    if (!sid) {
        console.warn("[with401Retry] No sid found, cannot refresh token for", resp.status, input);
        return resp;
    }

    // Nếu đang refresh, đợi promise hiện tại
    if (isRefreshingServer && refreshServerPromise) {
        try {
            await refreshServerPromise;
            // Lấy token mới từ in-memory store (đã được update)
            const bundle = await loadTokens(sid);
            if (bundle?.access) {
                const authHeader = `Bearer ${bundle.access}`;
        return fetch(input, {
            ...init,
                    headers: { ...(init?.headers || {}), Authorization: authHeader },
            cache: "no-store",
        });
            }
    } catch {
            // Ignore, sẽ return resp gốc
        }
        return resp;
    }

    // Bắt đầu refresh token
    // Skip cookie update vì đang ở trong customFetch context (không phải Server Action)
    isRefreshingServer = true;
    refreshServerPromise = (async () => {
        try {
            // Skip cookie update - chỉ update in-memory
            // Cookie sẽ được set từ Server Action khi client-side refresh
            await refreshTokens(sid, true);
            return true;
        } catch (err) {
            console.error("[with401Retry] Refresh token failed:", err);
            return false;
        } finally {
            isRefreshingServer = false;
            refreshServerPromise = null;
        }
    })();

    try {
        const success = await refreshServerPromise;
        if (success) {
            // Lấy token mới từ in-memory store (đã được update)
            // Không cần đọc từ cookie vì cookie không được update ở đây (skipCookieUpdate=true)
            const bundle = await loadTokens(sid);
            if (bundle?.access) {
                const authHeader = `Bearer ${bundle.access}`;
                return fetch(input, {
                    ...init,
                    headers: { ...(init?.headers || {}), Authorization: authHeader },
                    cache: "no-store",
                });
            }
        }
    } catch {
        // Ignore, sẽ return resp gốc
    }
    
    return resp;
};

// Tạo 2 instance:
//  - authService: baseUrl = `${BACKEND}/auth` (token, session, logout)
//  - rootService: baseUrl = `${BACKEND}` (các route /api/..., ví dụ InsertStudent)

export const authService = new AuthApi({
    baseUrl: `${BACKEND}/auth`,
    customFetch: with401Retry,
    baseApiParams: { credentials: "include" },
    securityWorker: async () => {
        const auth = await getAuthHeaderFromCookie();
        return { headers: auth ?? {} };
    },
});

export const rootService = new AuthApi({
    baseUrl: `${BACKEND}/auth`,
    customFetch: with401Retry,
    baseApiParams: { credentials: "include" },
    securityWorker: async () => {
        const auth = await getAuthHeaderFromCookie();
        return { headers: auth ?? {} };
    },
});

// const createBaseConfig = (baseUrl: string) => ({
//   baseUrl,
//   customFetch: with401Retry,
//   baseApiParams: { credentials: "include" as RequestCredentials },
//   securityWorker: async () => {
//     const auth = await getAuthHeaderFromCookie();
//     return { headers: auth ?? {} };
//   },
// });

// // Tạo các service instances riêng biệt
// export const authService = new AuthApi(createBaseConfig(`${BACKEND}/auth`));

// export const courseService = new CourseApi(createBaseConfig(`${BACKEND}`));

// export const quizService = new QuizApi(createBaseConfig(`${BACKEND}`));

export const apiServer = {
    auth: authService,
};

// Export default để có thể import { apiServer} hoặc import apiServer
export default apiServer;

// Type definitions cho dễ sử dụng
export type ApiServer = typeof apiServer;
export type AuthService = typeof authService;

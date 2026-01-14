// (auth)/action.ts
"use server";

import { destroySession, exchangePassword, exchangeGoogle, getAccessTokenFromCookie, getSidFromCookie, hasRefreshToken, readSidCookiePayload, refreshTokens, revokeRefreshLocal } from "EduSmart/lib/authServer";

const OTHERSYSTEM_URL = process.env.OTHER_SYSTEM_URL;

export async function loginAction({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  if (!email || !password) return { ok: false, error: "Thiếu email/password" };
  try {
    console.log("start")
    await exchangePassword(email, password);
    console.log("end")
    const accessToken = await getAccessTokenFromCookie();
    const payload = await readSidCookiePayload();
    const user = payload?.user ?? null;
    console.log("User info", user)
    if (user?.role !== "Student") {
      await revokeRefreshLocal();
      await logoutAction();
      if (accessToken) {
        return {
          ok: false,
          redirectUrl: `${OTHERSYSTEM_URL}/verifyOther?token=${payload?.refresh}`,
        };
      }

    }
    if(accessToken) return { ok: true, accessToken: accessToken, user: user };
    return { ok: false, accessToken: null, user: null,};
  } catch (e: unknown) {
    console.error("lỗi")
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Đăng nhập thất bại" };
  }
}

export async function loginGoogleAction({
  googleId,
  email,
  name,
  avatar,
}: {
  googleId: string;
  email: string;
  name: string;
  avatar: string;
}) {
  if (!googleId || !email) return { ok: false, error: "Thiếu thông tin Google" };
  try {
    console.log("[loginGoogleAction] start");
    await exchangeGoogle(googleId, email, name, avatar);
    console.log("[loginGoogleAction] end");
    const accessToken = await getAccessTokenFromCookie();
    const payload = await readSidCookiePayload();
    const user = payload?.user ?? null;
    console.log("User info", user);
    if (user?.role !== "user") {
      await revokeRefreshLocal();
      await logoutAction();
      if (accessToken) {
        return {
          ok: false,
          redirectUrl: `${OTHERSYSTEM_URL}/verifyOther?token=${payload?.refresh}`,
        };
      }
    }
    if (accessToken) return { ok: true, accessToken: accessToken, user: user };
    return { ok: false, accessToken: null, user: null };
  } catch (e: unknown) {
    console.error("lỗi");
    const errorMessage =
      typeof e === "object" && e !== null && "message" in e
        ? (e as { message?: string }).message
        : undefined;
    return { ok: false, error: errorMessage ?? "Đăng nhập thất bại" };
  }
}

export async function refreshAction() {
  try {
    // Thử đọc sid từ cookie, nếu không có thì thử từ cookie payload
    let sid = await getSidFromCookie();
    
    // Fallback: nếu sid null, thử đọc trực tiếp từ cookie payload
    if (!sid) {
      const payload = await readSidCookiePayload();
      if (payload?.sid) {
        sid = payload.sid;
      }
    }
    
    if (!sid) {
      console.warn("[refreshAction] No sid found in cookie");
      return { ok: false, error: "No session" };
    }
    
    // Check xem token có sắp hết hạn không trước khi refresh
    // Nếu token vẫn còn valid (còn hơn 5 giây), không cần refresh
    const payload = await readSidCookiePayload();
    if (payload && payload.expAt && Date.now() < payload.expAt - 5000) {
      // Token vẫn còn valid, trả về token hiện tại
      console.log("[refreshAction] Token still valid, returning current token");
      return { ok: true, accessToken: payload.access };
    }
    
    // Refresh tokens - sẽ cập nhật cookie
    await refreshTokens(sid);
    
    // Đảm bảo lấy access token mới từ cookie sau khi refresh
    const accessToken = await getAccessTokenFromCookie();
    
    if (!accessToken) {
      console.error("[refreshAction] Failed to get access token after refresh");
      return { ok: false, error: "Failed to get access token" };
    }
    
    return { ok: true, accessToken };
  } catch (e: unknown) {
    console.error("[refreshAction] Error:", e);
    const msg =
      typeof e === "object" && e && "message" in e
        ? (e as { message?: string }).message
        : undefined;
    return { ok: false, error: msg ?? "Đăng nhập thất bại" };
  }
}

export async function logoutAction() {
  const sid = await getSidFromCookie();
  console.log("logout action sid", sid)
  if (sid) {
    await destroySession(sid);  // xóa session + cookie sid
  }
  return { ok: true };
}

export async function getAuthen(): Promise<boolean> {
  return hasRefreshToken();
}

export async function logout() {
  return await revokeRefreshLocal();
}

export async function cleanupAction() {
  const payload = await readSidCookiePayload();
  if (!payload) return { ok: true, reason: "no-cookie" };

  const sid = payload.sid;
  
  // QUAN TRỌNG: Check expAt từ in-memory store (đã được update khi refresh),
  // KHÔNG chỉ check từ cookie vì cookie có thể chưa được update khi skip cookie update
  const { loadTokens } = await import("EduSmart/lib/sessionStore");
  const bundle = await loadTokens(sid);
  
  // Nếu có bundle trong memory, dùng expAt từ đó (chính xác hơn)
  // Nếu không có, dùng expAt từ cookie
  const expAt = bundle?.expAt ?? payload.expAt;
  const now = Date.now();
  const isExpired = now > expAt;
  
  if (isExpired) {
    // Token đã hết hạn (theo in-memory store hoặc cookie), thử refresh trước khi destroy
    try {
      await refreshTokens(sid); // Server Action nên set cookie
      console.log("[cleanupAction] Refreshed expired token, expAt was:", expAt, "now:", now);
      return { ok: true, refreshed: true };
    } catch (err) {
      // Chỉ destroy nếu refresh thật sự fail
      console.error("[cleanupAction] Failed to refresh expired token, destroying session. expAt:", expAt, "now:", now, "error:", err);
      await destroySession(sid);
      return { ok: true, cleared: "refresh-failed" };
    }
  }

  // Token chưa hết hạn, nhưng sắp hết hạn thì refresh proactively
  // KHÔNG destroy session nếu chỉ sắp hết hạn
  if (now > expAt - 5_000) {
    try {
      await refreshTokens(sid); // Server Action nên set cookie
      console.log("[cleanupAction] Proactively refreshed token, expAt:", expAt, "now:", now);
      return { ok: true, refreshed: true };
    } catch (err) {
      // Nếu refresh fail nhưng token chưa hết hạn, KHÔNG destroy session
      // Chỉ log để debug
      console.warn("[cleanupAction] Failed to proactively refresh token, but token still valid. expAt:", expAt, "now:", now, "error:", err);
      return { ok: true, refreshFailed: true };
    }
  }

  return { ok: true, noAction: true };
}
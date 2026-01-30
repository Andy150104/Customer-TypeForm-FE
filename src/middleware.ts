// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/", // landing
  "/Login",
  "/register",
  "/forgot-password",
  "/_error", // phòng khi lỗi
  "/api/public", // ví dụ
];

const PROTECTED_PREFIXES = [
  "/User",
  "/dashboard",
  "/form",
  "/notification",
];

/** Kiểm tra xem pathname có nằm trong PUBLIC_PATHS không */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

/** Kiểm tra xem pathname có cần login không */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function getSidFromReq(req: NextRequest): string | null {
  return (
    req.cookies.get("__Host-sid")?.value ??
    req.cookies.get("sid")?.value ??
    null
  );
}

export async function middleware(req: NextRequest) {
  // Redirect www to non-www in production only
  if (process.env.NODE_ENV === "production") {
    const host = req.headers.get("host");
    if (host === "www.edusmart.pro.vn") {
      const url = req.nextUrl.clone();
      url.hostname = "edusmart.pro.vn";
      const response = NextResponse.redirect(url, 308);
      
      // Copy cookies từ request sang response để preserve auth state khi redirect
      const sidCookie = req.cookies.get("__Host-sid") || req.cookies.get("sid");
      if (sidCookie) {
        // Copy cookie sang response để preserve khi redirect
        response.cookies.set({
          name: "sid", // Dùng "sid" (không có __Host- prefix) để hoạt động trên cả www và non-www
          value: sidCookie.value,
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 ngày
        });
      }
      
      return response;
    }
  }

  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // Allow well-known link preview bots to bypass auth redirects
  // so they can fetch Open Graph/Twitter metadata to render rich previews
  const isCrawler =
    /(facebookexternalhit|Facebot|Twitterbot|Slackbot|TelegramBot|LinkedInBot|Pinterest|Discordbot|WhatsApp|zalo|ZaloOA)/i.test(
      userAgent,
    );

  // Lấy cookie
  const sid = getSidFromReq(req);
  console.log("sid" , sid)

  // Normalize common casing issues and make "/" always resolve
  if (pathname !== "/Login" && pathname.toLowerCase() === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = sid ? "/form" : "/Login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = sid ? "/form" : "/Login";
    return NextResponse.redirect(url);
  }

  // Nếu đã login rồi mà truy cập /login → redirect về /Admin
  if (isPublicPath(pathname)) {
    if (sid && (pathname.toLowerCase() === "/login" || pathname === "/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/form";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 1) Bots/crawlers → cho qua to read metadata for link previews
  if (isCrawler) {
    return NextResponse.next();
  }

  // 2) Public paths → cho qua
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 3) Nếu không phải protected → cho qua
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // 4) Protected path mà chưa login → redirect về /login
  if (!sid) {
    const url = req.nextUrl.clone();
    url.pathname = "/Login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 5) Đã login, path được phép → cho qua
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

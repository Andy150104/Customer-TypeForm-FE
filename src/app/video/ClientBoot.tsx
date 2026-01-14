// ví dụ: src/app/ClientBoot.tsx
"use client";
import { useEffect } from "react";
import { cleanupAction } from "../(auth)/action";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

export default function ClientBoot() {
  const getAuthen = useAuthStore((s) => s.getAuthen);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Redirect www to non-www in production only (client-side fallback)
    if (process.env.NODE_ENV === "production") {
      const host = window.location.host;
      if (host === "www.edusmart.pro.vn") {
        // Dùng window.location.replace để tránh thêm vào history và force reload
        const newUrl = `https://edusmart.pro.vn${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(newUrl);
        return;
      }

      // Nếu đã redirect từ www sang non-www (check referrer), refresh auth state
      const referrer = document.referrer;
      if (referrer.includes("www.edusmart.pro.vn") && host === "edusmart.pro.vn") {
        // Refresh auth state để navbar hiển thị đúng
        getAuthen().catch(() => {});
      }
    }

    // Cleanup action (existing logic)
    cleanupAction().catch(() => {});
  }, [getAuthen]);
  return null;
}

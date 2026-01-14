"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type GoogleIdTokenPayload = {
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  sub?: string;
};

function decodeJwtPayload(token: string): GoogleIdTokenPayload {
  const parts = token.split(".");
  if (parts.length < 2) return {};

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  try {
    const json = atob(padded);
    return JSON.parse(json) as GoogleIdTokenPayload;
  } catch {
    return {};
  }
}

export default function LoginPage() {
  const onGoogleSuccess = async (resp: CredentialResponse) => {
    const idToken = resp.credential ?? "";
    if (!idToken) return;

    // ✅ LƯU LẠI (tạm)
    localStorage.setItem("google_id_token", idToken);

    const payload = decodeJwtPayload(idToken);
    console.log("Email:", payload.email);
    console.log("Name:", payload.name);
    console.log("Avatar:", payload.picture);
    console.log("GoogleId:", payload.sub);
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>

        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => alert("Google login lỗi")}
          useOneTap
        />
      </div>
    </main>
  );
}

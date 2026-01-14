"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ThemeSwitch } from "EduSmart/components/Themes/Theme";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";

const ACCENT = "#ccff00"; // neon

export default function NotFound() {
  useEffect(() => {
    return () => {
      useValidateStore.getState().setInValid(false);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <main
        className="
          relative flex min-h-screen w-full flex-col items-center justify-center
          text-center select-none
          bg-gradient-to-b from-sky-200 via-emerald-200 to-lime-200
          text-slate-900
          dark:bg-[#020712] dark:text-white dark:from-[#020712] dark:via-[#020712] dark:to-[#020712]
        "
      >
        {/* Toggle theme */}
        <nav className="pointer-events-none absolute right-4 top-4 text-xs leading-tight tracking-wider text-slate-500 dark:text-white/70 sm:right-8 sm:top-8">
          <div className="pointer-events-auto flex items-center gap-4">
            <ThemeSwitch />
          </div>
        </nav>

        {/* 404 Graphic */}
        <div className="mb-4 relative flex items-center justify-center gap-3 text-[7rem] font-extrabold leading-none sm:text-[10rem] md:text-[12rem] lg:text-[14rem]">
          {/* Light mode glow behind 404 */}
          <div className="pointer-events-none absolute -z-10 h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(204,255,0,0.18),_transparent_65%)] blur-sm sm:h-[22rem] sm:w-[22rem] dark:hidden" />

          <span className="text-slate-800 drop-shadow-sm dark:text-white">
            4
          </span>

          <span className="relative inline-flex h-[0.7em] w-[0.7em] items-center justify-center">
            {/* neon ring */}
            <span
              className="absolute inset-0 rounded-full border-[0.08em] shadow-[0_0_30px_rgba(204,255,0,0.55)]"
              style={{ borderColor: ACCENT }}
            />
            {/* eye */}
            <svg
              viewBox="0 0 64 64"
              className="relative h-[60%] w-[60%]"
              aria-hidden
            >
              <ellipse cx="32" cy="32" rx="28" ry="18" fill={ACCENT} />
              <circle cx="32" cy="32" r="6" fill="#020712" />
            </svg>
          </span>

          <span className="text-slate-800 drop-shadow-sm dark:text-white">
            4
          </span>
        </div>

        {/* Message */}
        <h1 className="text-xl font-medium tracking-wide text-slate-700 dark:text-white sm:text-2xl md:text-3xl">
          XIN LỖI,{" "}
          <span className="block sm:inline text-slate-500 dark:text-slate-300">
            TRANG NÀY KHÔNG TỒN TẠI
          </span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Có thể liên kết đã sai hoặc nội dung đã được thay đổi.
        </p>

        {/* Go Home Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="
              inline-block rounded-full px-10 py-3 text-xs sm:text-sm font-semibold
              uppercase tracking-[0.2em]
              text-black
              shadow-[0_12px_30px_rgba(15,23,42,0.22)]
              transition-transform duration-150 hover:scale-105 active:scale-95
              focus:outline-none
            "
            style={{ backgroundColor: ACCENT }}
          >
            Về trang chủ
          </Link>
        </div>

        {/* Footer */}
        <footer className="pointer-events-none absolute bottom-4 flex w-full items-end justify-between px-4 text-[10px] leading-tight tracking-widest text-slate-500 dark:text-white/50 sm:bottom-6 sm:px-8">
          <span>09/2025</span>
          <span>Edusmart © {new Date().getFullYear()}</span>
          <span>PHÁT TRIỂN BỞI Edusmart</span>
        </footer>
      </main>
    </div>
  );
}

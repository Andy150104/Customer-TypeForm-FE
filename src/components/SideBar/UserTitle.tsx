"use client";

import React from "react";
import { Tooltip, Avatar, theme } from "antd";
import { useRouter } from "next/navigation";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

type UserTitleProps = {
  collapsed: boolean;
};

const initialsFrom = (name: string) =>
  (name || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const hasBrokenChars = (value: string) =>
  /�|\?/.test(value) || /[ÃÂÄÆÐØÞ]/.test(value);

const normalizeDisplayName = (name?: string, email?: string) => {
  if (!name && !email) return "Người dùng";
  let next = (name ?? "").trim();

  // Try to fix common mojibake (latin1 -> utf8) cases.
  if (/[ÃÂÄÆÐØÞ]/.test(next)) {
    try {
      next = decodeURIComponent(escape(next));
    } catch {
      // ignore decode errors, fallback below
    }
  }

  const cleaned = next.replace(/\?/g, "").replace(/\s+/g, " ").trim();
  if (cleaned && cleaned !== next) {
    next = cleaned;
  }

  // If still contains replacement chars, fallback to email local-part.
  if (!next || hasBrokenChars(next)) {
    const local = (email ?? "").split("@")[0] ?? "";
    if (local) {
      next = local
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return next || "Người dùng";
};

export const UserTitle: React.FC<UserTitleProps> = ({ collapsed }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  const user = useAuthStore((state) => state.user);

  const displayName = normalizeDisplayName(user?.name, user?.email);
  const email = user?.email?.trim() || "user@example.com";
  const avatarUrl =
    user?.avatarUrl?.trim() ||
    (user as { avatar?: string })?.avatar?.trim() ||
    (user as { picture?: string })?.picture?.trim() ||
    (user as { photoURL?: string })?.photoURL?.trim() ||
    (user as { photoUrl?: string })?.photoUrl?.trim() ||
    undefined;

  return (
    <Tooltip
      title={
        collapsed ? (
          <div>
            <div className="font-semibold">{displayName}</div>
            <div className="opacity-80">{email}</div>
          </div>
        ) : null
      }
      placement="right"
    >
      <div
        onClick={() => router.push("/Admin/profile")}
        role="button"
        className={`
          m-0 cursor-pointer select-none
          rounded-2xl
          flex items-center gap-3
          ${collapsed ? "p-2.5" : "px-3 py-2.5"}
          ${isDarkMode ? "bg-white/5 border-white/10" : "bg-[#f6f8fb]"}
          border
        `}
        style={{
          borderColor: isDarkMode ? "" : colorBorderSecondary,
        }}
      >
        <Avatar size={44} src={avatarUrl} className="shrink-0">
          {initialsFrom(displayName)}
        </Avatar>

        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold leading-tight truncate">
              {displayName}
            </div>
            <div className="text-[13px] opacity-75 truncate">{email}</div>
          </div>
        )}
      </div>
    </Tooltip>
  );
};


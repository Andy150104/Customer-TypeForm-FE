"use client";

import React from "react";
import { Tooltip, Avatar, theme } from "antd";
import { useRouter } from "next/navigation";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { normalizeDisplayName } from "EduSmart/utils/normalizeDisplayName";

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


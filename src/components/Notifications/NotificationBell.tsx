"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Empty, Popover, Spin } from "antd";
import { BellOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotificationsStore } from "EduSmart/stores/Notifications/NotificationsStore";
import type { NotificationResponseEntity } from "EduSmart/api/api-auth-service";

const getNotificationTime = (item: NotificationResponseEntity) =>
  item.lastSubmissionAt ??
  item.updatedAt ??
  item.createdAt ??
  item.firstSubmissionAt ??
  null;

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const NotificationBell: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { notifications, loading, fetchNotifications, startStream, stopStream } =
    useNotificationsStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    startStream();
    return () => stopStream();
  }, [startStream, stopStream]);

  useEffect(() => {
    if (open) {
      void fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const sortedNotifications = useMemo(() => {
    const items = [...notifications];
    items.sort((a, b) => {
      const timeA = new Date(getNotificationTime(a) ?? 0).getTime();
      const timeB = new Date(getNotificationTime(b) ?? 0).getTime();
      return timeB - timeA;
    });
    return items;
  }, [notifications]);

  const unreadCount = useMemo(
    () => sortedNotifications.filter((item) => !item.isRead).length,
    [sortedNotifications],
  );

  const panelStyles = isDarkMode
    ? "bg-slate-950 text-slate-100 border border-slate-800"
    : "bg-white text-slate-900 border border-slate-200";

  const itemHover = isDarkMode ? "hover:bg-slate-900" : "hover:bg-slate-50";
  const mutedText = isDarkMode ? "text-slate-400" : "text-slate-500";
  const titleText = isDarkMode ? "text-slate-100" : "text-slate-900";

  return (
    <Popover
      placement="bottomRight"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      overlayInnerStyle={{ padding: 0 }}
      getPopupContainer={() => document.documentElement}
      content={
        <div className={`w-[360px] ${panelStyles} rounded-xl shadow-xl`}>
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isDarkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <span className={`font-semibold ${titleText}`}>Notifications</span>
            <Button
              type="text"
              size="small"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void fetchNotifications();
              }}
              className={isDarkMode ? "text-slate-300" : "text-slate-600"}
              icon={<ReloadOutlined />}
            />
          </div>
          <div className="max-h-[360px] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Spin size="small" />
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="py-6">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className={mutedText}>No notifications yet</span>
                  }
                />
              </div>
            ) : (
              sortedNotifications.map((item, index) => {
                const timeLabel = formatDateTime(getNotificationTime(item));
                const message =
                  item.message ??
                  (typeof item.count === "number"
                    ? `${item.count} new submission${
                        item.count === 1 ? "" : "s"
                      }`
                    : "New activity");
                const showCount = typeof item.count === "number" && item.count > 1;
                return (
                  <button
                    key={item.id ?? `${item.formId ?? "item"}-${index}`}
                    type="button"
                    onClick={() => setOpen(false)}
                    className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${itemHover}`}
                  >
                    <span
                      className={`mt-1 h-2 w-2 rounded-full ${
                        item.isRead ? "bg-transparent" : "bg-emerald-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-medium ${titleText}`}>
                          {message}
                        </span>
                        {showCount ? (
                          <span
                            className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isDarkMode
                                ? "bg-slate-800 text-slate-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            +{item.count}
                          </span>
                        ) : null}
                      </div>
                      {timeLabel ? (
                        <div className={`text-xs mt-1 ${mutedText}`}>
                          {timeLabel}
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      }
    >
      <button
        type="button"
        aria-label="Open notifications"
        className={`relative flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
          isDarkMode
            ? "border-white/50 bg-transparent text-white hover:bg-white/10"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Badge size="small" count={unreadCount} overflowCount={99}>
          <BellOutlined className="text-lg" />
        </Badge>
      </button>
    </Popover>
  );
};

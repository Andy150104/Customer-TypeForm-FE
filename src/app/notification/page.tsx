"use client";

import React, { useEffect, useMemo } from "react";
import { Button, Empty, List, Tag, Typography } from "antd";
import { ReloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { useNotificationsStore } from "EduSmart/stores/Notifications/NotificationsStore";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import type { NotificationResponseEntity } from "EduSmart/api/api-auth-service";

const { Title, Text } = Typography;

const getNotificationTime = (item: NotificationResponseEntity) =>
  item.lastSubmissionAt ??
  item.updatedAt ??
  item.createdAt ??
  item.firstSubmissionAt ??
  null;

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildDescription = (item: NotificationResponseEntity) => {
  if (item.message) return item.message;
  if (typeof item.count === "number") {
    return `Bạn có ${item.count} phản hồi mới`;
  }
  return "Bạn có một thông báo mới";
};

export default function NotificationPage() {
  const { notifications, loading, fetchNotifications } =
    useNotificationsStore();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const sortedNotifications = useMemo(() => {
    const items = [...notifications];
    items.sort((a, b) => {
      const timeA = new Date(getNotificationTime(a) ?? 0).getTime();
      const timeB = new Date(getNotificationTime(b) ?? 0).getTime();
      return timeB - timeA;
    });
    return items;
  }, [notifications]);

  const unreadCount = sortedNotifications.filter((item) => !item.isRead).length;
  const latestTime = sortedNotifications.length
    ? formatDateTime(getNotificationTime(sortedNotifications[0]))
    : "-";

  return (
    <BaseScreenAdmin>
      <div className="w-full">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div
            className={`relative overflow-hidden rounded-[28px] border p-6 shadow-sm sm:p-8 ${
              isDarkMode
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white border-amber-100/80"
            }`}
          >
            <div
              className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl ${
                isDarkMode ? "bg-blue-500/15" : "bg-blue-200/70"
              }`}
            />
            <div
              className={`pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full blur-3xl ${
                isDarkMode ? "bg-cyan-500/10" : "bg-cyan-200/70"
              }`}
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isDarkMode
                      ? "bg-blue-500/10 text-blue-200"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <InfoCircleOutlined />
                  Trung tâm thông báo
                </div>
                <Title
                  level={2}
                  className={`m-0 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Notifications
                </Title>
                <Text
                  className={`block text-sm leading-snug ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Tổng hợp các thông báo mới nhất cho workspace của bạn.
                </Text>
                <div className="flex items-center gap-2 text-xs">
                  <Tag color={unreadCount ? "blue" : "default"}>
                    {unreadCount} chưa đọc
                  </Tag>
                  <span
                    className={isDarkMode ? "text-slate-500" : "text-gray-400"}
                  >
                    {sortedNotifications.length} thông báo
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => void fetchNotifications()}
                  loading={loading}
                  className={
                    isDarkMode
                      ? "text-slate-100 border-slate-700 hover:border-slate-500"
                      : "text-gray-700 border-gray-300 hover:border-gray-400"
                  }
                >
                  Làm mới
                </Button>
              </div>
            </div>
            <div className="relative mt-5 grid gap-4 sm:grid-cols-3">
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/70 text-slate-100"
                    : "border-amber-100 bg-amber-50/60 text-gray-900"
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Chưa đọc
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {unreadCount}
                </div>
              </div>
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/70 text-slate-100"
                    : "border-amber-100 bg-amber-50/60 text-gray-900"
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Tổng thông báo
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {sortedNotifications.length}
                </div>
              </div>
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/70 text-slate-100"
                    : "border-amber-100 bg-amber-50/60 text-gray-900"
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Cập nhật gần nhất
                </div>
                <div className="mt-1 text-sm font-semibold">{latestTime}</div>
              </div>
            </div>
          </div>

          <div
            className={`relative overflow-hidden rounded-[28px] border p-6 shadow-sm ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-amber-100/80"
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 ${
                isDarkMode
                  ? "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%)]"
                  : "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]"
              }`}
            />
            {sortedNotifications.length === 0 ? (
              <div className="py-10">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Chưa có thông báo nào.
                    </span>
                  }
                />
              </div>
            ) : (
              <List
                loading={loading}
                split={false}
                dataSource={sortedNotifications}
                className="relative space-y-6 pb-2"
                renderItem={(item) => {
                  const itemTime = formatDateTime(getNotificationTime(item));
                  const unread = !item.isRead;
                  return (
                    <List.Item className="!px-0 !py-0 mb-2">
                      <div
                        className={`group w-full rounded-2xl p-[1px] transition-all duration-200 hover:-translate-y-0.5 ${
                          unread
                            ? isDarkMode
                              ? "bg-gradient-to-r from-blue-500/60 via-cyan-400/40 to-blue-500/20"
                              : "bg-gradient-to-r from-blue-400/60 via-cyan-300/40 to-blue-400/30"
                            : isDarkMode
                              ? "bg-slate-800/70"
                              : "bg-gray-200/80"
                        }`}
                      >
                        <div
                          className={`relative w-full rounded-2xl border p-6 shadow-sm transition-all duration-200 group-hover:shadow-xl ${
                            unread
                              ? isDarkMode
                                ? "border-blue-500/40 bg-gradient-to-r from-blue-500/15 via-slate-900/70 to-slate-900/30"
                                : "border-blue-200 bg-gradient-to-r from-blue-50 via-white to-white"
                              : isDarkMode
                                ? "border-slate-800 bg-slate-900/40"
                                : "border-gray-100 bg-white"
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                              unread
                                ? isDarkMode
                                  ? "bg-gradient-to-b from-blue-400 to-cyan-400"
                                  : "bg-gradient-to-b from-blue-500 to-cyan-400"
                                : isDarkMode
                                  ? "bg-slate-700"
                                  : "bg-gray-200"
                            }`}
                          />
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-blue-400/30" />
                          <List.Item.Meta
                            avatar={
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition group-hover:scale-105 ${
                                  isDarkMode
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                <InfoCircleOutlined />
                              </div>
                            }
                            title={
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <Text
                                    className={`font-semibold ${
                                      isDarkMode
                                        ? "text-slate-100"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    Thông báo mới
                                  </Text>
                                  {unread ? (
                                    <Tag color="blue">Chưa đọc</Tag>
                                  ) : (
                                    <Tag color="default">Đã đọc</Tag>
                                  )}
                                </div>
                                <span
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-slate-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {itemTime}
                                </span>
                              </div>
                            }
                            description={
                              <Text
                                className={
                                  isDarkMode ? "text-slate-300" : "text-gray-600"
                                }
                              >
                                {buildDescription(item)}
                              </Text>
                            }
                          />
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </BaseScreenAdmin>
  );
}

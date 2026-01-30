"use client";

import React, { useEffect, useRef } from "react";
import { notification } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotificationsStore } from "EduSmart/stores/Notifications/NotificationsStore";
import type { NotificationResponseEntity } from "EduSmart/api/api-auth-service";
import "./notification-toast.css";

const getNotificationTime = (item?: NotificationResponseEntity | null) =>
  item?.lastSubmissionAt ??
  item?.updatedAt ??
  item?.createdAt ??
  item?.firstSubmissionAt ??
  null;

const buildToastKey = (item: NotificationResponseEntity) =>
  [
    item.id ?? item.formId ?? "item",
    item.count ?? "",
    getNotificationTime(item) ?? "",
  ].join(":");

const buildDescription = (item: NotificationResponseEntity) => {
  if (item.message) return item.message;
  if (typeof item.count === "number") {
    return `Bạn có ${item.count} phản hồi mới`;
  }
  return "Bạn có một thông báo mới";
};

const LAST_SEEN_KEY = "notifications-last-seen";

const parseTimeMs = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getLatestTimeMs = (items: NotificationResponseEntity[]) => {
  let latest: number | null = null;
  items.forEach((item) => {
    const time = parseTimeMs(getNotificationTime(item));
    if (time != null && (latest == null || time > latest)) {
      latest = time;
    }
  });
  return latest;
};

export const NotificationToast: React.FC = () => {
  const { notifications } = useNotificationsStore();
  const { isDarkMode } = useTheme();
  const [api, contextHolder] = notification.useNotification();
  const prevRef = useRef<NotificationResponseEntity[] | null>(null);
  const mountedRef = useRef(false);
  const shownRef = useRef<Set<string>>(new Set());
  const lastSeenAtRef = useRef<number | null>(null);
  const hasBaselineRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = notifications;
      if (typeof window !== "undefined") {
        const stored = Number(localStorage.getItem(LAST_SEEN_KEY));
        lastSeenAtRef.current = Number.isFinite(stored)
          ? stored
          : Date.now();
      } else {
        lastSeenAtRef.current = Date.now();
      }
      return;
    }

    if (lastSeenAtRef.current == null) {
      lastSeenAtRef.current = Date.now();
    }

    if (!hasBaselineRef.current) {
      hasBaselineRef.current = true;
      prevRef.current = notifications;
      const latestTime = getLatestTimeMs(notifications);
      if (latestTime != null) {
        lastSeenAtRef.current = latestTime;
        if (typeof window !== "undefined") {
          localStorage.setItem(LAST_SEEN_KEY, String(latestTime));
        }
      }
      return;
    }

    const previous = prevRef.current ?? [];
    const previousMap = new Map<string, NotificationResponseEntity>();
    previous.forEach((item) => {
      const key = item.id ?? item.formId ?? "";
      if (key) previousMap.set(key, item);
    });

    const incoming = notifications.filter((item) => {
      const key = item.id ?? item.formId ?? "";
      if (!key) return false;
      const prevItem = previousMap.get(key);
      const lastSeen = lastSeenAtRef.current ?? 0;
      const currTime = parseTimeMs(getNotificationTime(item));
      if (!prevItem) {
        return currTime != null && currTime > lastSeen;
      }
      const prevCount = prevItem.count ?? 0;
      const currCount = item.count ?? 0;
      const prevTime = parseTimeMs(getNotificationTime(prevItem));
      const isNewByTime = currTime != null && currTime > lastSeen;
      return (
        currCount > prevCount ||
        (currTime != null && currTime !== prevTime) ||
        isNewByTime
      );
    });

    prevRef.current = notifications;

    incoming.slice(0, 3).forEach((item) => {
      const toastKey = buildToastKey(item);
      if (shownRef.current.has(toastKey)) return;
      shownRef.current.add(toastKey);
      if (shownRef.current.size > 120) {
        const first = shownRef.current.values().next().value;
        if (first !== undefined) {
          shownRef.current.delete(first);
        }
      }

      api.open({
        message: "Thông báo mới",
        description: buildDescription(item),
        placement: "topRight",
        duration: 4,
        pauseOnHover: true,
        showProgress: true,
        className: `es-stream-noti${isDarkMode ? " es-stream-noti-dark" : ""}`,
        icon: (
          <InfoCircleFilled
            style={{ color: isDarkMode ? "#60a5fa" : "#2563eb" }}
          />
        ),
      });
    });

    const latestSeen = getLatestTimeMs(notifications);
    if (latestSeen != null) {
      if (lastSeenAtRef.current == null || latestSeen > lastSeenAtRef.current) {
        lastSeenAtRef.current = latestSeen;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_SEEN_KEY, String(lastSeenAtRef.current));
      }
    }
  }, [notifications, api, isDarkMode]);

  return <div className="es-stream-noti-root">{contextHolder}</div>;
};

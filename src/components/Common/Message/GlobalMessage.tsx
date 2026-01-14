"use client";

import React, { useEffect } from "react";
import { notification } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { useMessageStore } from "EduSmart/stores/message/MessageStore";
import "./message.css";

type ESNoticeType = "success" | "error" | "warning" | "info";

const configByType: Record<
  ESNoticeType,
  {
    title: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    title: "Thành công",
    className: "es-noti-toast es-noti-success",
    icon: <CheckCircleFilled style={{ fontSize: 16, color: "#16a34a" }} />,
  },
  error: {
    title: "Có lỗi xảy ra",
    className: "es-noti-toast es-noti-error",
    icon: <CloseCircleFilled style={{ fontSize: 16, color: "#dc2626" }} />,
  },
  warning: {
    title: "Cảnh báo",
    className: "es-noti-toast es-noti-warning",
    icon: (
      <ExclamationCircleFilled style={{ fontSize: 16, color: "#d97706" }} />
    ),
  },
  info: {
    title: "Thông báo",
    className: "es-noti-toast es-noti-info",
    icon: <InfoCircleFilled style={{ fontSize: 16, color: "#2563eb" }} />,
  },
};

export function GlobalMessage() {
  const { message, type, duration, clearMessage } = useMessageStore();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!message) return;

    const rawType = type ?? "info";
    const notiType: ESNoticeType =
      rawType === "loading" ? "info" : (rawType as ESNoticeType);

    const cfg = configByType[notiType];

    api.open({
      message: cfg.title,
      description: message,
      duration: duration ?? 3,
      placement: "topRight",
      pauseOnHover: true,
      // bỏ progress cho gọn, nhìn “pro” hơn
      showProgress: false,
      icon: cfg.icon,
      className: cfg.className,
    });

    clearMessage();
  }, [message, type, duration, clearMessage, api]);

  return <div className="es-noti-root">{contextHolder}</div>;
}

"use client";

import React, { useMemo, useState } from "react";
import { Button, Input, QRCode, Tooltip } from "antd";
import {
  CopyOutlined,
  EditOutlined,
  MailOutlined,
  ShareAltOutlined,
  QrcodeOutlined,
  GlobalOutlined,
  FacebookFilled,
  LinkedinFilled,
  TwitterOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { FieldWithLogicResponseEntity } from "EduSmart/api/api-auth-service";
import { FormPreviewCard } from "EduSmart/components/FormPreview/FormPreviewCard";

type ShareKey = "facebook" | "linkedin" | "twitter" | "link" | "qr";

type ShareOption = {
  key: ShareKey;
  label: string;
  icon: React.ComponentType;
  description: string;
  url: string;
};

type SharePanelProps = {
  shareUrl: string;
  isDarkMode: boolean;
  formFields: FieldWithLogicResponseEntity[];
  isFormLoading: boolean;
  activeFieldId: string | null;
  onActiveFieldChange: (fieldId: string | null) => void;
};

export const SharePanel: React.FC<SharePanelProps> = ({
  shareUrl,
  isDarkMode,
  formFields,
  isFormLoading,
  activeFieldId,
  onActiveFieldChange,
}) => {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [activeShare, setActiveShare] = useState<ShareKey>("link");

  const shareOptions = useMemo<ShareOption[]>(
    () => [
      {
        key: "facebook",
        label: "Facebook",
        icon: FacebookFilled,
        description: "Share this form on Facebook.",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        icon: LinkedinFilled,
        description: "Share this form on LinkedIn.",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      },
      {
        key: "twitter",
        label: "X",
        icon: TwitterOutlined,
        description: "Post this form to X.",
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
      },
      {
        key: "link",
        label: "Copy link",
        icon: LinkOutlined,
        description: "Share the link directly with anyone.",
        url: shareUrl,
      },
      {
        key: "qr",
        label: "QR code",
        icon: QrcodeOutlined,
        description: "Show a QR code for quick access.",
        url: shareUrl,
      },
    ],
    [shareUrl],
  );

  const selectedShare =
    shareOptions.find((option) => option.key === activeShare) ??
    shareOptions.find((option) => option.key === "link") ??
    shareOptions[0];
  const SelectedShareIcon = selectedShare.icon;

  const handleCopyLink = async () => {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1500);
    } catch (error) {
      console.error("Copy link failed:", error);
    }
  };

  const handleShareOpen = () => {
    if (typeof window === "undefined") return;
    if (!selectedShare.url) return;
    window.open(selectedShare.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div
          className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
            isDarkMode
              ? "border-slate-800 bg-slate-900/60"
              : "border-slate-200 bg-white/90"
          }`}
        >
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopyLink}
            className="rounded-full !bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none px-4 hover:!from-amber-600 hover:!to-orange-600"
          >
            {copyStatus === "copied" ? "Copied" : "Copy link"}
          </Button>
          <span
            className={`hidden h-6 w-px sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
          />
          <Input
            value={shareUrl}
            readOnly
            className={`min-w-[240px] flex-1 rounded-full border ${
              isDarkMode
                ? "border-slate-700 bg-slate-950 text-slate-200"
                : "border-slate-200 bg-white"
            }`}
          />
          <span
            className={`hidden h-6 w-px sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
          />
          <Button
            type="default"
            icon={<EditOutlined />}
            className={`rounded-full ${
              isDarkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700"
            }`}
          >
            Customize
          </Button>
          <span
            className={`hidden h-6 w-px sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
          />
          <div
            className={`flex items-center gap-1 rounded-full border px-1.5 py-1 ${
              isDarkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <Tooltip title="Email">
              <Button type="text" icon={<MailOutlined />} />
            </Tooltip>
            <Tooltip title="Share">
              <Button type="text" icon={<ShareAltOutlined />} />
            </Tooltip>
            <Tooltip title="QR code">
              <Button type="text" icon={<QrcodeOutlined />} />
            </Tooltip>
            <Tooltip title="Open link">
              <Button type="text" icon={<GlobalOutlined />} />
            </Tooltip>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
          <FormPreviewCard
            isView={false}
            frameClassName="h-[560px] w-full border-slate-200 bg-white"
            contentClassName="max-w-[560px]"
            fields={formFields}
            isLoading={isFormLoading}
            currentFieldId={activeFieldId}
            onCurrentFieldChange={onActiveFieldChange}
          />
        </div>
      </div>

      <div
        className={`flex flex-col gap-4 rounded-2xl border p-4 shadow-sm ${
          isDarkMode
            ? "border-slate-800 bg-slate-900/60"
            : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Share in
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                const isActive = option.key === activeShare;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setActiveShare(option.key)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-slate-600 transition-colors ${
                      isActive
                        ? isDarkMode
                          ? "border-amber-400 bg-amber-500/20 text-amber-100"
                          : "border-amber-300 bg-amber-50 text-amber-700"
                        : isDarkMode
                          ? "border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:text-slate-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <Icon />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {selectedShare.label}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedShare.description}
                </p>
              </div>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                  isDarkMode
                    ? "border-slate-700 text-slate-200"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <SelectedShareIcon />
              </span>
            </div>

            {selectedShare.key === "link" && (
              <div className="mt-3 flex flex-col gap-2">
                <Input value={shareUrl} readOnly className="rounded-lg" />
                <Button
                  type="primary"
                  onClick={handleCopyLink}
                  className="rounded-full !bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                >
                  {copyStatus === "copied" ? "Copied" : "Copy link"}
                </Button>
              </div>
            )}

            {selectedShare.key === "qr" && (
              <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6">
                <QRCode value={shareUrl} size={168} />
                <span className="text-xs text-amber-600">
                  Scan to open the form.
                </span>
              </div>
            )}

            {selectedShare.key !== "link" && selectedShare.key !== "qr" && (
              <Button
                type="primary"
                className="mt-3 rounded-full !bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                onClick={handleShareOpen}
              >
                Share now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

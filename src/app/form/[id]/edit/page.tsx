"use client";

import React, { useEffect, useState } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { Button, Tooltip } from "antd";
import {
  PlusOutlined,
  BgColorsOutlined,
  LaptopOutlined,
  MobileOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined,
  UploadOutlined,
  MailOutlined,
  FormOutlined,
  BarsOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  PaperClipOutlined,
  StarOutlined,
  SlidersOutlined,
  NumberOutlined,
  BulbOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { FieldWithLogicResponseEntity } from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { FormPreviewCard } from "EduSmart/components/FormPreview/FormPreviewCard";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";

const tabs = ["Content", "Workflow", "Connect", "Share", "Results"];

const getFieldTone = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email") || normalized.includes("phone")) {
    return "rose";
  }
  return "violet";
};

const getFieldIcon = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email")) return <MailOutlined />;
  if (normalized.includes("phone")) return <PhoneOutlined />;
  if (normalized.includes("date")) return <CalendarOutlined />;
  if (normalized.includes("time")) return <ClockCircleOutlined />;
  if (normalized.includes("number")) return <NumberOutlined />;
  if (normalized.includes("rating")) return <StarOutlined />;
  if (normalized.includes("scale")) return <SlidersOutlined />;
  if (normalized.includes("file")) return <PaperClipOutlined />;
  if (normalized.includes("checkbox")) return <CheckSquareOutlined />;
  if (normalized.includes("radio") || normalized.includes("yesno")) {
    return <CheckCircleOutlined />;
  }
  if (normalized.includes("select")) return <FormOutlined />;
  if (normalized.includes("textarea") || normalized.includes("text")) {
    return <BarsOutlined />;
  }
  return <BarsOutlined />;
};

type EditorPageProps = {
  params: { id: string };
};

export default function FormEditorPage({ params }: EditorPageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const isMobilePreview = previewMode === "mobile";
  const [isPlayOpen, setIsPlayOpen] = useState(false);
  const [isPlayVisible, setIsPlayVisible] = useState(false);
  const [formFields, setFormFields] = useState<FieldWithLogicResponseEntity[]>([]);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const { getFormWithFieldsAndLogic } = useFormsStore();

  const mutedText = isDarkMode ? "text-slate-400" : "text-slate-500";
  const panelSurface = isDarkMode
    ? "bg-slate-900/60 border-slate-800"
    : "bg-white/70 border-slate-200";
  const tabSurface = isDarkMode
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-200 bg-white/90 shadow-sm";
  const tabInactiveClass = isDarkMode
    ? "text-slate-300 hover:bg-slate-800/80"
    : "text-slate-600 hover:bg-slate-100";
  const brandColor = "#6B46C1";
  const previewWidth = isMobilePreview ? "max-w-[420px]" : "max-w-[720px]";
  const previewFramePadding = isMobilePreview ? "px-8" : "px-12";
  const previewContentWidth = isMobilePreview ? "max-w-[360px]" : "max-w-[520px]";
  const previewFrameHeight = isMobilePreview ? "h-[720px]" : "h-[520px]";
  const previewFrameSurface = isDarkMode
    ? "border-slate-800 bg-slate-950/40"
    : "border-slate-200 bg-white";
  const activeTabIndex = Math.max(0, tabs.indexOf(activeTab));
  const previewIndex = previewMode === "desktop" ? 0 : 1;
  const previewFrameClassName = `${previewWidth} ${previewFrameHeight} ${previewFrameSurface} ${previewFramePadding}`;
  const previewContentClassName = `${previewContentWidth}`;
  const handleTabChange = (tab: string) => {
    if (tab === "Share") {
      router.push(`/form/${params.id}/share`);
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    let isActive = true;
    const loadFormFields = async () => {
      setIsFormLoading(true);
      try {
        const result = await getFormWithFieldsAndLogic(params.id);
        if (!isActive) return;
        const orderedFields = result?.fields ?? [];
        setFormFields(orderedFields);
      } catch (error) {
        console.error("Failed to load form logic:", error);
        if (isActive) {
          setFormFields([]);
        }
      } finally {
        if (isActive) {
          setIsFormLoading(false);
        }
      }
    };

    loadFormFields();
    return () => {
      isActive = false;
    };
  }, [getFormWithFieldsAndLogic, params.id]);

  useEffect(() => {
    if (!formFields.length) {
      setActiveFieldId(null);
      return;
    }
    const hasActive = formFields.some((field) => field.id === activeFieldId);
    if (!hasActive) {
      setActiveFieldId(formFields[0]?.id ?? null);
    }
  }, [activeFieldId, formFields]);

  useEffect(() => {
    if (isPlayOpen) {
      const id = requestAnimationFrame(() => setIsPlayVisible(true));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [isPlayOpen]);

  useEffect(() => {
    if (!isPlayVisible && isPlayOpen) {
      const id = window.setTimeout(() => setIsPlayOpen(false), 180);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isPlayVisible, isPlayOpen]);

  const openPlayPreview = () => setIsPlayOpen(true);
  const closePlayPreview = () => setIsPlayVisible(false);

  return (
    <BaseScreenAdmin>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={`relative inline-grid grid-cols-5 items-center rounded-full border p-1 ${
              tabSurface
            }`}
          >
            <span
              className="absolute left-1 top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
              style={{
                width: `calc((100% - 8px) / ${tabs.length})`,
                transform: `translateX(${activeTabIndex * 100}%)`,
                backgroundColor: brandColor,
              }}
            />
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  style={isActive ? { color: "#ffffff" } : undefined}
                  className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : tabInactiveClass
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <Tooltip title="Publish edits">
            <Button
              type="default"
              icon={<UploadOutlined />}
              className={`rounded-full px-4 font-medium ${
                isDarkMode ? "border-slate-700 text-slate-100" : "border-slate-300 text-slate-700"
              }`}
            >
              Publish edits
            </Button>
          </Tooltip>
        </div>

        {activeTab !== "Share" && (
          <div
            className={`flex flex-wrap items-center gap-2 rounded-2xl border p-3 shadow-sm ${
              isDarkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white/80"
            }`}
          >
            <Tooltip title="Add content">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="rounded-full bg-slate-900 px-4 hover:bg-slate-800"
              >
                Add content
              </Button>
            </Tooltip>
            <Tooltip title="Design">
              <Button
                type="default"
                icon={<BgColorsOutlined />}
                className={`rounded-full ${
                  isDarkMode ? "border-slate-700 text-slate-100" : "border-slate-200 text-slate-700"
                }`}
              >
                Design
              </Button>
            </Tooltip>
            <div
              className={`relative inline-grid grid-cols-2 items-center rounded-full border p-1 ${
                isDarkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white"
              }`}
            >
              <span
                className="absolute left-1 top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
                style={{
                  width: "calc((100% - 8px) / 2)",
                  transform: `translateX(${previewIndex * 100}%)`,
                  backgroundColor: brandColor,
                }}
              />
              <Tooltip title="Desktop view">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  aria-pressed={previewMode === "desktop"}
                  aria-label="Desktop preview"
                  style={previewMode === "desktop" ? { color: "#ffffff" } : undefined}
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    previewMode === "desktop" ? "text-white" : tabInactiveClass
                  }`}
                >
                  <LaptopOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Mobile view">
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  aria-pressed={previewMode === "mobile"}
                  aria-label="Mobile preview"
                  style={previewMode === "mobile" ? { color: "#ffffff" } : undefined}
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    previewMode === "mobile" ? "text-white" : tabInactiveClass
                  }`}
                >
                  <MobileOutlined />
                </button>
              </Tooltip>
            </div>
              <div
                className={`flex items-center gap-1 rounded-full border px-2 py-1 ${
                  isDarkMode ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <Tooltip title="Preview">
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    onClick={openPlayPreview}
                  />
                </Tooltip>
                <Tooltip title="Undo">
                  <Button type="text" icon={<UndoOutlined />} />
                </Tooltip>
                <Tooltip title="Redo">
                  <Button type="text" icon={<RedoOutlined />} />
                </Tooltip>
                <Tooltip title="Settings">
                  <Button type="text" icon={<SettingOutlined />} />
                </Tooltip>
              </div>
            <span className={`ml-auto text-xs ${mutedText}`}>Form ID: {params.id}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className={`flex h-full max-h-[720px] flex-col overflow-hidden rounded-2xl border p-4 shadow-sm ${panelSurface}`}>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {isFormLoading && !formFields.length && (
                  <div className={`rounded-2xl border px-3 py-2 text-sm ${panelSurface}`}>
                    Loading questions...
                  </div>
                )}
                {!isFormLoading && !formFields.length && (
                  <div className={`rounded-2xl border px-3 py-2 text-sm ${panelSurface}`}>
                    No questions yet.
                  </div>
                )}
                {formFields.map((field, index) => {
                  const tone = getFieldTone(field.type);
                  const badgeTone =
                    tone === "rose"
                      ? isDarkMode
                        ? "bg-rose-500/20 text-rose-200"
                        : "bg-rose-100 text-rose-700"
                      : isDarkMode
                      ? "bg-indigo-500/20 text-indigo-200"
                      : "bg-indigo-100 text-indigo-700";
                  const rowActive = field.id && field.id === activeFieldId;
                  const label = field.title?.trim() || `Question ${index + 1}`;
                  const order = field.order ?? index + 1;
                  return (
                    <button
                      key={field.id ?? `field-${index}`}
                      type="button"
                      onClick={() => field.id && setActiveFieldId(field.id)}
                      disabled={!field.id}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors ${
                        rowActive
                          ? isDarkMode
                            ? "bg-slate-800/70"
                            : "bg-slate-100"
                          : "bg-transparent"
                      }`}
                    >
                      <div className={`flex h-10 w-16 items-center justify-center gap-1 rounded-xl ${badgeTone}`}>
                        {getFieldIcon(field.type)}
                        <span className="text-sm font-semibold">{order}</span>
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                        {label}
                        {field.isRequired && <span className="text-rose-500"> *</span>}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl border border-dashed px-4 py-4 text-left ${
                    isDarkMode ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isDarkMode ? "bg-slate-800 text-amber-200" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <BulbOutlined />
                    </div>
                    <span className="text-sm font-semibold">Add a Welcome Screen</span>
                  </div>
                  <DownOutlined className={mutedText} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <FormPreviewCard
                isView
                frameClassName={previewFrameClassName}
                contentClassName={previewContentClassName}
                fields={formFields}
                isLoading={isFormLoading}
                currentFieldId={activeFieldId}
                onCurrentFieldChange={setActiveFieldId}
              />
            </div>
          </div>

        {isPlayOpen && (
          <div
            className={`fixed inset-0 z-50 flex items-start justify-center overflow-auto transition-opacity duration-200 ${
              isDarkMode ? "bg-slate-950/70" : "bg-slate-50/80"
            } ${isPlayVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={closePlayPreview}
          >
            <div
              className={`relative flex min-h-full w-full flex-col items-center justify-start px-6 pb-12 pt-10 transition-transform duration-200 ${
                isPlayVisible ? "scale-100" : "scale-95"
              }`}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div
                className={`sticky top-6 z-10 flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-900/90 text-slate-100"
                    : "border-slate-200 bg-white/90 text-slate-700"
                }`}
              >
                <Tooltip title="Close preview">
                  <button
                    type="button"
                    onClick={closePlayPreview}
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
                    }`}
                    aria-label="Close preview"
                  >
                    <CloseOutlined />
                  </button>
                </Tooltip>
                <span className={`h-6 w-px ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />
                <div
                  className={`relative inline-grid grid-cols-2 items-center rounded-full border p-1 ${
                    isDarkMode ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className="absolute left-1 top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
                    style={{
                      width: "calc((100% - 8px) / 2)",
                      transform: `translateX(${previewIndex * 100}%)`,
                      backgroundColor: brandColor,
                    }}
                  />
                  <Tooltip title="Desktop view">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("desktop")}
                      aria-pressed={previewMode === "desktop"}
                      aria-label="Desktop preview"
                      style={previewMode === "desktop" ? { color: "#ffffff" } : undefined}
                      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        previewMode === "desktop" ? "text-white" : tabInactiveClass
                      }`}
                    >
                      <LaptopOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="Mobile view">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("mobile")}
                      aria-pressed={previewMode === "mobile"}
                      aria-label="Mobile preview"
                      style={previewMode === "mobile" ? { color: "#ffffff" } : undefined}
                      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        previewMode === "mobile" ? "text-white" : tabInactiveClass
                      }`}
                    >
                      <MobileOutlined />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <FormPreviewCard
                isView={false}
                frameClassName={`${previewFrameClassName} shadow-xl mt-6`}
                contentClassName={previewContentClassName}
                fields={formFields}
                isLoading={isFormLoading}
                currentFieldId={activeFieldId}
                onCurrentFieldChange={setActiveFieldId}
              />
            </div>
          </div>
        )}
      </div>
    </BaseScreenAdmin>
  );
}

"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { Button, Card, Empty, Statistic, Tag, Tooltip } from "antd";
import {
  BarChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";

type ResultsPageProps = {
  params: Promise<{ id: string }>;
};

const tabs = ["Content", "Workflow", "Share", "Results"];

export default function FormResultsPage({ params }: ResultsPageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { getFormWithFieldsAndLogic } = useFormsStore();
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [, setIsLoading] = useState(false);

  const activeTabIndex = Math.max(0, tabs.indexOf("Results"));
  const tabSurface = isDarkMode
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-200 bg-white/90 shadow-sm";
  const tabInactiveClass = isDarkMode
    ? "text-slate-300 hover:bg-slate-800/80"
    : "text-slate-600 hover:bg-slate-100";
  const brandColor = "#6B46C1";
  const tabGridTemplate: CSSProperties = {
    gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
  };

  const handleTabChange = (tab: string) => {
    if (!formId || tab === "Results") return;

    const tabRoutes: Record<string, string> = {
      Content: `/form/${formId}/edit`,
      Workflow: `/form/${formId}/workflow`,
      Share: `/form/${formId}/share`,
      Results: `/form/${formId}/results`,
    };

    const target = tabRoutes[tab];
    if (target) {
      router.push(target);
    }
  };

  useEffect(() => {
    let isActive = true;
    Promise.resolve(params)
      .then((resolved) => {
        if (isActive) {
          setFormId(resolved.id);
        }
      })
      .catch((error) => {
        console.error("Failed to resolve route params:", error);
      });
    return () => {
      isActive = false;
    };
  }, [params]);

  useEffect(() => {
    let isActive = true;
    const loadForm = async () => {
      if (!formId) return;
      setIsLoading(true);
      try {
        const result = await getFormWithFieldsAndLogic(formId);
        if (!isActive) return;
        setFormTitle(result?.title ?? "Untitled Form");
      } catch (error) {
        console.error("Failed to load form:", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadForm();
    return () => {
      isActive = false;
    };
  }, [formId, getFormWithFieldsAndLogic]);

  return (
    <BaseScreenAdmin>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
        {/* Tab Navigation */}
        <div
          className={`relative inline-grid items-center rounded-full border p-1 ${tabSurface}`}
          style={tabGridTemplate}
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
            const isActive = tab === "Results";
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold m-0 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {formTitle || "Form Results"}
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              View and analyze form responses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                // Refresh results
              }}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              className="bg-[#6B46C1] border-[#6B46C1]"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className={`rounded-2xl ${
              isDarkMode
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <Statistic
              title={
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  Total Responses
                </span>
              }
              value={0}
              prefix={<UserOutlined className="text-[#6B46C1]" />}
              valueStyle={{ color: isDarkMode ? "#fff" : "#1f2937" }}
            />
          </Card>
          <Card
            className={`rounded-2xl ${
              isDarkMode
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <Statistic
              title={
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  Completion Rate
                </span>
              }
              value={0}
              suffix="%"
              prefix={<BarChartOutlined className="text-green-500" />}
              valueStyle={{ color: isDarkMode ? "#fff" : "#1f2937" }}
            />
          </Card>
          <Card
            className={`rounded-2xl ${
              isDarkMode
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <Statistic
              title={
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  Avg. Time to Complete
                </span>
              }
              value="-"
              prefix={<FileTextOutlined className="text-blue-500" />}
              valueStyle={{ color: isDarkMode ? "#fff" : "#1f2937" }}
            />
          </Card>
          <Card
            className={`rounded-2xl ${
              isDarkMode
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <Statistic
              title={
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  Views
                </span>
              }
              value={0}
              prefix={<EyeOutlined className="text-orange-500" />}
              valueStyle={{ color: isDarkMode ? "#fff" : "#1f2937" }}
            />
          </Card>
        </div>

        {/* Responses Table */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FileTextOutlined />
              <span>Responses</span>
              <Tag color="purple">0</Tag>
            </div>
          }
          className={`rounded-2xl ${
            isDarkMode
              ? "bg-slate-900/60 border-slate-800"
              : "bg-white border-slate-200"
          }`}
          extra={
            <Tooltip title="View individual responses">
              <Button type="text" icon={<EyeOutlined />}>
                View All
              </Button>
            </Tooltip>
          }
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span
                className={isDarkMode ? "text-slate-400" : "text-slate-500"}
              >
                No responses yet. Share your form to start collecting data.
              </span>
            }
          >
            <Button
              type="primary"
              className="bg-[#6B46C1] border-[#6B46C1]"
              onClick={() => formId && router.push(`/form/${formId}/share`)}
            >
              Go to Share
            </Button>
          </Empty>
        </Card>
      </div>
    </BaseScreenAdmin>
  );
}

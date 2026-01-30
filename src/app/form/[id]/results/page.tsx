"use client";

import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import {
  Button,
  Card,
  Empty,
  Modal,
  Progress,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  PieChartOutlined,
  ReloadOutlined,
  UserOutlined,
  RiseOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";
import apiClient from "EduSmart/hooks/apiClient";
import {
  AnswerResponseEntity,
  FieldOverviewResponseEntity,
  FormSubmissionsOverviewResponseEntity,
  SubmissionResponseEntity,
} from "EduSmart/api/api-auth-service";
import { Pie } from "@ant-design/charts";

type ResultsPageProps = {
  params: Promise<{ id: string }>;
};

const tabs = ["Content", "Workflow", "Share", "Results"];
const tabLabels: Record<string, string> = {
  Content: "Nội dung",
  Workflow: "Luồng",
  Share: "Chia sẻ",
  Results: "Kết quả",
};

export default function FormResultsPage({ params }: ResultsPageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { getFormWithFieldsAndLogic } = useFormsStore();
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] =
    useState<FormSubmissionsOverviewResponseEntity | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionResponseEntity[]>(
    [],
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResponseEntity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const activeTabIndex = Math.max(0, tabs.indexOf("Results"));
  const tabSurface = isDarkMode
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-200 bg-white/90 shadow-sm";
  const tabInactiveClass = isDarkMode
    ? "text-slate-300 hover:bg-slate-800/80"
    : "text-slate-600 hover:bg-slate-100";
  const brandColor = "#f59e0b";
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

  const fetchOverview = useCallback(async (fId: string) => {
    try {
      const response =
        await apiClient.authEduService.api.v1FormsGetSubmissionsList({
          formId: fId,
        });
      if (response.data?.success && response.data?.response) {
        setOverview(response.data.response);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    }
  }, []);

  const fetchDetailSubmissions = useCallback(async (fId: string) => {
    try {
      const response =
        await apiClient.authEduService.api.v1FormsGetDetailSubmissionsList({
          formId: fId,
        });
      if (response.data?.success && response.data?.response) {
        setSubmissions(response.data.response);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!formId) return;
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOverview(formId),
        fetchDetailSubmissions(formId),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [formId, fetchOverview, fetchDetailSubmissions]);

  const handleViewSubmission = useCallback(
    (submission: SubmissionResponseEntity) => {
      setSelectedSubmission(submission);
      setIsDetailModalOpen(true);
    },
    [],
  );

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSubmission(null);
  }, []);

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
        const [result] = await Promise.all([
          getFormWithFieldsAndLogic(formId),
          fetchOverview(formId),
          fetchDetailSubmissions(formId),
        ]);
        if (!isActive) return;
        setFormTitle(result?.title ?? "Biểu mẫu chưa đặt tên");
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
  }, [
    formId,
    getFormWithFieldsAndLogic,
    fetchOverview,
    fetchDetailSubmissions,
  ]);

  // Table columns for submissions
  const submissionColumns: ColumnsType<SubmissionResponseEntity> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => (
        <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
          {index + 1}
        </span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => (
        <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
          {new Date(date).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Số câu trả lời",
      key: "answerCount",
      width: 130,
      render: (_, record) => (
        <Tag className="!bg-amber-500/20 !text-amber-600 !border-amber-500/30">
          {record.answers?.length ?? 0} câu
        </Tag>
      ),
    },
    {
      title: "Tóm tắt",
      key: "preview",
      ellipsis: true,
      render: (_, record) => {
        const firstAnswer = record.answers?.[0];
        if (!firstAnswer) return <span className="text-slate-400">-</span>;
        const displayValue =
          firstAnswer.optionLabel ||
          (typeof firstAnswer.value === "string"
            ? firstAnswer.value
            : JSON.stringify(firstAnswer.value));
        return (
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
            {firstAnswer.fieldTitle}: {displayValue}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewSubmission(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Render field overview card
  const renderFieldOverview = (field: FieldOverviewResponseEntity) => {
    const hasOptions = field.optionTrends && field.optionTrends.length > 0;

    // Prepare pie chart data for options
    const pieChartData =
      field.optionTrends?.map((option, idx) => ({
        type: option.label || option.value || `Lựa chọn ${idx + 1}`,
        value: option.count ?? 0,
      })) ?? [];

    const pieConfig = {
      data: pieChartData,
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      innerRadius: 0.6,
      label: {
        text: "value",
        style: {
          fontWeight: "bold",
          fontSize: 10,
        },
      },
      legend: {
        color: {
          position: "bottom" as const,
          layout: {
            justifyContent: "center",
            alignItems: "center",
          },
        },
      },
      theme: isDarkMode ? "classicDark" : "classic",
      height: 200,
    };

    const completionPercent = 100 - (field.emptyRate ?? 0);

    return (
      <div
        key={field.fieldId}
        className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-slate-700/50"
            : "bg-white border border-slate-200 shadow-md"
        }`}
      >
        {/* Decorative gradient */}
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 ${
            hasOptions ? "bg-amber-500" : "bg-blue-500"
          }`}
          style={{ transform: "translate(30%, -30%)" }}
        />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-base mb-2 line-clamp-2 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {field.title || "Câu hỏi chưa đặt tên"}
              </h4>
              <div className="flex items-center gap-2">
                <Tag
                  color={hasOptions ? "orange" : "blue"}
                  className="!rounded-full !px-2.5 !py-0.5 !text-xs"
                >
                  {field.type || "văn bản"}
                </Tag>
                {field.isRequired && (
                  <Tag
                    color="red"
                    className="!rounded-full !px-2.5 !py-0.5 !text-xs"
                  >
                    Bắt buộc
                  </Tag>
                )}
              </div>
            </div>
            <div
              className={`text-center p-3 rounded-xl ${
                isDarkMode ? "bg-amber-500/20" : "bg-amber-100"
              }`}
            >
              <span
                className={`text-2xl font-bold block ${
                  isDarkMode ? "text-amber-300" : "text-amber-600"
                }`}
              >
                {field.answeredCount ?? 0}
              </span>
              <span
                className={`text-xs ${
                  isDarkMode ? "text-amber-400" : "text-amber-500"
                }`}
              >
                trả lời
              </span>
            </div>
          </div>

          {/* Completion rate */}
          <div
            className={`p-3 rounded-xl ${
              isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Tỷ lệ hoàn thành
              </span>
              <span
                className={`text-sm font-semibold ${
                  completionPercent >= 70
                    ? "text-emerald-500"
                    : completionPercent >= 40
                      ? "text-amber-500"
                      : "text-red-500"
                }`}
              >
                {completionPercent.toFixed(0)}%
              </span>
            </div>
            <Progress
              percent={completionPercent}
              showInfo={false}
              strokeColor={{
                "0%":
                  completionPercent >= 70
                    ? "#10b981"
                    : completionPercent >= 40
                      ? "#f59e0b"
                      : "#ef4444",
                "100%":
                  completionPercent >= 70
                    ? "#059669"
                    : completionPercent >= 40
                      ? "#d97706"
                      : "#dc2626",
              }}
              trailColor={isDarkMode ? "#334155" : "#e2e8f0"}
              strokeWidth={8}
              className="!mb-0"
            />
          </div>

          {/* Pie chart for options */}
          {hasOptions && pieChartData.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-3">
                <PieChartOutlined
                  className={isDarkMode ? "text-amber-400" : "text-amber-500"}
                />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Phân bố câu trả lời
                </span>
              </div>
              <Pie {...pieConfig} />
            </div>
          )}

          {/* Top values for text fields */}
          {!hasOptions && field.topValues && field.topValues.length > 0 && (
            <div className="space-y-2">
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                📝 Câu trả lời phổ biến:
              </span>
              {field.topValues.slice(0, 3).map((val, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                    isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                  }`}
                >
                  <span
                    className={`text-sm truncate flex-1 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {val.value || "-"}
                  </span>
                  <Tag color="blue" className="!rounded-full !ml-2">
                    {val.count ?? 0}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render answer item in detail modal
  const renderAnswerItem = (answer: AnswerResponseEntity, index: number) => {
    const displayValue =
      answer.optionLabel ||
      (typeof answer.value === "string"
        ? answer.value
        : JSON.stringify(answer.value));

    return (
      <div
        key={answer.id || index}
        className={`p-4 rounded-lg ${
          isDarkMode ? "bg-slate-800/60" : "bg-slate-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isDarkMode
                ? "bg-amber-600/30 text-amber-300"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium text-sm mb-1 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {answer.fieldTitle || "Câu hỏi chưa đặt tên"}
            </h4>
            <Tag className="mb-2 !bg-amber-500/20 !text-amber-600 !border-amber-500/30">
              {answer.fieldType || "văn bản"}
            </Tag>
            <div
              className={`text-sm ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {displayValue ? (
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined className="text-green-500" />
                  {displayValue}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <CloseCircleOutlined />
                  Không có câu trả lời
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BaseScreenAdmin>
      <Spin spinning={isLoading} tip="Đang tải dữ liệu...">
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
                  {tabLabels[tab] ?? tab}
                </button>
              );
            })}
          </div>

          {/* Header with gradient */}
          <div
            className={`relative overflow-hidden rounded-3xl p-6 ${
              isDarkMode
                ? "bg-gradient-to-br from-amber-900/80 via-orange-900/60 to-slate-900/80"
                : "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
            }`}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BarChartOutlined className="text-2xl text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white m-0">
                    {formTitle || "Kết quả biểu mẫu"}
                  </h1>
                </div>
                <p className="text-white/80 text-sm md:text-base">
                  📊 Xem và phân tích kết quả biểu mẫu của bạn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={isLoading}
                  className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30 backdrop-blur-sm"
                >
                  Làm mới
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  type="primary"
                  className="!bg-white !text-amber-600 !border-white hover:!bg-white/90 font-semibold"
                  disabled={submissions.length === 0}
                >
                  Xuất Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards with gradients */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Responses */}
            <div
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-br from-amber-900/60 to-orange-900/40 border border-amber-800/50"
                  : "bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isDarkMode ? "bg-amber-500/30" : "bg-amber-500/20"
                    }`}
                  >
                    <UserOutlined className="text-xl text-amber-500" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-amber-300" : "text-amber-600"
                    }`}
                  >
                    Tổng phản hồi
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {overview?.totalSubmissions ?? 0}
                  </span>
                  <span className="text-sm text-amber-500 mb-1">phản hồi</span>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-br from-emerald-900/60 to-green-900/40 border border-emerald-800/50"
                  : "bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isDarkMode ? "bg-emerald-500/30" : "bg-emerald-500/20"
                    }`}
                  >
                    <TrophyOutlined className="text-xl text-emerald-500" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  >
                    Tỷ lệ hoàn thành
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {(overview?.completionRate ?? 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-emerald-500 mb-1">%</span>
                </div>
                <Progress
                  percent={overview?.completionRate ?? 0}
                  showInfo={false}
                  strokeColor="#10b981"
                  trailColor={isDarkMode ? "#064e3b" : "#d1fae5"}
                  size="small"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Total Questions */}
            <div
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-900/60 to-cyan-900/40 border border-blue-800/50"
                  : "bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isDarkMode ? "bg-blue-500/30" : "bg-blue-500/20"
                    }`}
                  >
                    <FileTextOutlined className="text-xl text-blue-500" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Tổng câu hỏi
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {overview?.totalFields ?? 0}
                  </span>
                  <span className="text-sm text-blue-500 mb-1">câu hỏi</span>
                </div>
              </div>
            </div>

            {/* Total Answers */}
            <div
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-br from-orange-900/60 to-amber-900/40 border border-orange-800/50"
                  : "bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isDarkMode ? "bg-orange-500/30" : "bg-orange-500/20"
                    }`}
                  >
                    <ThunderboltOutlined className="text-xl text-orange-500" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-orange-300" : "text-orange-600"
                    }`}
                  >
                    Tổng câu trả lời
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {overview?.answeredCount ?? 0}
                  </span>
                  <span className="text-sm text-orange-500 mb-1">
                    câu trả lời
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Charts */}
          {overview?.fields && overview.fields.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Custom Bar chart - Answer count by field */}
              <div
                className={`lg:col-span-2 relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50"
                    : "bg-gradient-to-br from-white via-amber-50/30 to-white border border-amber-100"
                }`}
              >
                {/* Decorative elements */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                    isDarkMode ? "bg-amber-500/10" : "bg-amber-200/40"
                  }`}
                />
                <div
                  className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl ${
                    isDarkMode ? "bg-blue-500/10" : "bg-blue-200/30"
                  }`}
                />

                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`p-3 rounded-xl ${
                        isDarkMode
                          ? "bg-gradient-to-br from-amber-500/30 to-orange-600/30"
                          : "bg-gradient-to-br from-amber-100 to-orange-100"
                      }`}
                    >
                      <BarChartOutlined className="text-xl text-amber-500" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-bold m-0 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Số câu trả lời theo câu hỏi
                      </h3>
                      <p
                        className={`text-sm m-0 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Thống kê chi tiết theo từng câu hỏi
                      </p>
                    </div>
                  </div>

                  {/* Custom horizontal bars */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {(() => {
                      const maxCount = Math.max(
                        ...overview.fields.map((f) => f.answeredCount ?? 0),
                        1,
                      );
                      const colors = [
                        "from-violet-500 to-purple-500",
                        "from-indigo-500 to-blue-500",
                        "from-blue-500 to-cyan-500",
                        "from-cyan-500 to-teal-500",
                        "from-teal-500 to-emerald-500",
                        "from-emerald-500 to-green-500",
                        "from-amber-500 to-orange-500",
                        "from-orange-500 to-red-500",
                        "from-pink-500 to-rose-500",
                        "from-rose-500 to-fuchsia-500",
                      ];

                      return overview.fields.map((field, index) => {
                        const percentage =
                          ((field.answeredCount ?? 0) / maxCount) * 100;
                        const colorClass = colors[index % colors.length];

                        return (
                          <div key={field.fieldId} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <Tooltip title={field.title}>
                                <span
                                  className={`text-sm font-medium truncate max-w-[70%] ${
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {index + 1}. {field.title || "Chưa đặt tên"}
                                </span>
                              </Tooltip>
                              <span
                                className={`text-sm font-bold ${
                                  isDarkMode
                                    ? "text-amber-400"
                                    : "text-amber-600"
                                }`}
                              >
                                {field.answeredCount ?? 0}
                              </span>
                            </div>
                            <div
                              className={`h-3 rounded-full overflow-hidden ${
                                isDarkMode ? "bg-slate-700/50" : "bg-slate-200"
                              }`}
                            >
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out group-hover:shadow-lg`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Pie chart - Completion overview */}
              <div
                className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50"
                    : "bg-gradient-to-br from-white via-emerald-50/30 to-white border border-emerald-100"
                }`}
              >
                {/* Decorative elements */}
                <div
                  className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl ${
                    isDarkMode ? "bg-emerald-500/10" : "bg-emerald-200/40"
                  }`}
                />
                <div
                  className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-2xl ${
                    isDarkMode ? "bg-teal-500/10" : "bg-teal-200/30"
                  }`}
                />

                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isDarkMode
                          ? "bg-gradient-to-br from-emerald-500/30 to-teal-600/30"
                          : "bg-gradient-to-br from-emerald-100 to-teal-100"
                      }`}
                    >
                      <PieChartOutlined className="text-xl text-emerald-500" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-bold m-0 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Tỷ lệ hoàn thành
                      </h3>
                      <p
                        className={`text-sm m-0 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Tổng quan
                      </p>
                    </div>
                  </div>

                  <Pie
                    data={[
                      {
                        type: "Đã trả lời",
                        value: overview.answeredCount ?? 0,
                      },
                      {
                        type: "Bỏ trống",
                        value:
                          (overview.totalSubmissions ?? 0) *
                            (overview.totalFields ?? 0) -
                          (overview.answeredCount ?? 0),
                      },
                    ]}
                    angleField="value"
                    colorField="type"
                    color={["#10B981", "#E5E7EB"]}
                    radius={0.9}
                    innerRadius={0.65}
                    label={{
                      text: "value",
                      style: {
                        fontWeight: "bold",
                        fill: isDarkMode ? "#fff" : "#374151",
                      },
                    }}
                    legend={{
                      color: {
                        position: "bottom" as const,
                        itemMarker: "circle",
                      },
                    }}
                    statistic={{
                      title: {
                        content: "Hoàn thành",
                        style: {
                          fontSize: "14px",
                          color: isDarkMode ? "#94A3B8" : "#64748B",
                        },
                      },
                      content: {
                        content: `${Math.round(
                          ((overview.answeredCount ?? 0) /
                            ((overview.totalSubmissions ?? 1) *
                              (overview.totalFields ?? 1))) *
                            100,
                        )}%`,
                        style: {
                          fontSize: "28px",
                          fontWeight: "bold",
                          color: isDarkMode ? "#10B981" : "#059669",
                        },
                      },
                    }}
                    theme={isDarkMode ? "classicDark" : "classic"}
                    height={280}
                  />

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div
                      className={`p-3 rounded-xl text-center ${
                        isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50"
                      }`}
                    >
                      <div className="text-lg font-bold text-emerald-500">
                        {overview.answeredCount ?? 0}
                      </div>
                      <div
                        className={`text-xs ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Đã trả lời
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-xl text-center ${
                        isDarkMode ? "bg-slate-500/10" : "bg-slate-100"
                      }`}
                    >
                      <div
                        className={`text-lg font-bold ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {(overview.totalSubmissions ?? 0) *
                          (overview.totalFields ?? 0) -
                          (overview.answeredCount ?? 0)}
                      </div>
                      <div
                        className={`text-xs ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Bỏ trống
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Field Overview */}
          {overview?.fields && overview.fields.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2.5 rounded-xl ${
                    isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <RiseOutlined className="text-xl text-blue-500" />
                </div>
                <div>
                  <h2
                    className={`text-xl font-bold m-0 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Phân tích theo câu hỏi
                  </h2>
                  <p
                    className={`text-sm m-0 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Chi tiết phản hồi cho từng câu hỏi trong biểu mẫu
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.fields.map(renderFieldOverview)}
              </div>
            </div>
          )}

          {/* Responses Table */}
          <Card
            title={
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-amber-500/20" : "bg-amber-100"
                  }`}
                >
                  <FileTextOutlined className="text-lg text-amber-500" />
                </div>
                <span className="font-semibold">Danh sách phản hồi</span>
                <Tag className="!rounded-full !px-3 !py-0.5 !text-sm font-medium !bg-amber-500/20 !text-amber-600 !border-amber-500/30">
                  {submissions.length} phản hồi
                </Tag>
              </div>
            }
            className={`rounded-2xl shadow-lg ${
              isDarkMode
                ? "bg-slate-900/80 border-slate-700/50"
                : "bg-white border-slate-200"
            }`}
          >
            {submissions.length > 0 ? (
              <Table
                dataSource={submissions}
                columns={submissionColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} phản hồi`,
                }}
                className={isDarkMode ? "ant-table-dark" : ""}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span
                    className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                  >
                    Chưa có phản hồi nào. Chia sẻ biểu mẫu để bắt đầu thu thập
                    dữ liệu.
                  </span>
                }
              >
                <Button
                  type="primary"
                  className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                  onClick={() => formId && router.push(`/form/${formId}/share`)}
                >
                  Đi đến Chia sẻ
                </Button>
              </Empty>
            )}
          </Card>
        </div>
      </Spin>

      {/* Submission Detail Modal */}
      <Modal
        open={isDetailModalOpen}
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-amber-500" />
            <span>Chi tiết phản hồi</span>
          </div>
        }
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>,
        ]}
        width={600}
        centered
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div
              className={`p-3 rounded-lg ${
                isDarkMode ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  Thời gian gửi:
                </span>
                <span className={isDarkMode ? "text-white" : "text-slate-900"}>
                  {new Date(selectedSubmission.createdAt!).toLocaleString(
                    "vi-VN",
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedSubmission.answers?.map((answer, index) =>
                renderAnswerItem(answer, index),
              )}
              {(!selectedSubmission.answers ||
                selectedSubmission.answers.length === 0) && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có câu trả lời"
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </BaseScreenAdmin>
  );
}

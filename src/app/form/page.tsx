"use client";

import React, { useEffect, useState, useMemo } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { Typography, Card, Row, Col, Button, Popconfirm, Dropdown } from "antd";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import {
  FileTextOutlined,
  PlusOutlined,
  UserAddOutlined,
  CloseOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";
import { EditFormModal } from "EduSmart/components/Modal/EditFormModal";
import { FormResponseEntity } from "EduSmart/api/api-auth-service";

const { Title, Text } = Typography;

type ViewMode = "list" | "grid";
type SortOption = "dateCreated" | null;

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const { forms, fetchForms, deleteForm } = useFormsStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("dateCreated");
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [isEditFormModalOpen, setIsEditFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormResponseEntity | null>(
    null,
  );
  const router = useRouter();
  const messageApi = useNotification();

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Sort và filter forms
  const sortedForms = useMemo(() => {
    const sorted = [...forms];
    if (sortBy === "dateCreated") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Mới nhất trước
      });
    }
    return sorted;
  }, [forms, sortBy]);

  const handleOpenForm = (id?: string | number | null) => {
    if (!id) return;
    router.push(`/form/${id}/edit`);
  };

  const handleDeleteForm = async (formId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingFormId(formId);
    try {
      const success = await deleteForm(formId);
      if (success) {
        messageApi.success("Form đã được xóa thành công");
      } else {
        messageApi.error("Xóa form thất bại");
      }
    } catch (error) {
      console.error("Delete form error:", error);
      messageApi.error("Có lỗi xảy ra khi xóa form");
    } finally {
      setDeletingFormId(null);
    }
  };

  const handleEditForm = (form: FormResponseEntity, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingForm(form);
    setIsEditFormModalOpen(true);
  };

  return (
    <BaseScreenAdmin>
      <div className="w-full space-y-6">
        {/* Header section */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="space-y-1">
            <Title
              level={2}
              className={`m-0 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              My workspace
            </Title>
            <Text
              className={`block text-sm leading-snug ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Track forms, responses, and team activity in one place.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            className="bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white"
          >
            Invite
          </Button>
        </div>

        {/* View options */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Text
              className={`text-sm font-semibold ${
                isDarkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Templates
            </Text>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
              •
            </span>
            <Text
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Start faster with curated templates.
            </Text>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Text
              className={
                isDarkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"
              }
            >
              View
            </Text>
            <Button.Group>
              <Button
                type={sortBy === "dateCreated" ? "primary" : "default"}
                className={
                  sortBy === "dateCreated"
                    ? "bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white"
                    : isDarkMode
                      ? "text-gray-300 border-gray-600 hover:border-gray-500"
                      : "text-gray-700 border-gray-300 hover:border-gray-400"
                }
                onClick={() =>
                  setSortBy(sortBy === "dateCreated" ? null : "dateCreated")
                }
              >
                Date created
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                className={
                  viewMode === "list"
                    ? "bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white"
                    : isDarkMode
                      ? "text-gray-300 border-gray-600 hover:border-gray-500"
                      : "text-gray-700 border-gray-300 hover:border-gray-400"
                }
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                className={
                  viewMode === "grid"
                    ? "bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white"
                    : isDarkMode
                      ? "text-gray-300 border-gray-600 hover:border-gray-500"
                      : "text-gray-700 border-gray-300 hover:border-gray-400"
                }
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
            </Button.Group>
          </div>
        </div>

        {/* Form templates suggestions */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                  : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
              }`}
              bodyStyle={{ padding: "20px", position: "relative" }}
              actions={[
                <Button
                  key="use"
                  type="default"
                  block
                  className="h-10 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Use this form
                </Button>,
              ]}
            >
              {/* Decorative gradient overlay on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    : "bg-gradient-to-br from-purple-50/80 to-blue-50/80"
                }`}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                      : "bg-gradient-to-br from-purple-100 to-blue-100"
                  }`}
                >
                  <FileTextOutlined
                    className={`text-xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className={`z-20 w-8 h-8 flex items-center justify-center p-0 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close
                  }}
                />
              </div>

              <div className="relative z-10 mt-4">
                <Text
                  strong
                  className={`text-base block mb-2 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Create a Peer review form
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  for group project evaluations.
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                  : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
              }`}
              bodyStyle={{ padding: "20px", position: "relative" }}
              actions={[
                <Button
                  key="use"
                  type="default"
                  block
                  className="h-10 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Use this form
                </Button>,
              ]}
            >
              {/* Decorative gradient overlay on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    : "bg-gradient-to-br from-purple-50/80 to-blue-50/80"
                }`}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                      : "bg-gradient-to-br from-purple-100 to-blue-100"
                  }`}
                >
                  <FileTextOutlined
                    className={`text-xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className={`z-20 w-8 h-8 flex items-center justify-center p-0 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close
                  }}
                />
              </div>

              <div className="relative z-10 mt-4">
                <Text
                  strong
                  className={`text-base block mb-2 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Create an Event feedback form
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  for student-organized activities.
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                  : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
              }`}
              bodyStyle={{ padding: "20px", position: "relative" }}
              actions={[
                <Button
                  key="use"
                  type="default"
                  block
                  className="h-10 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Use this form
                </Button>,
              ]}
            >
              {/* Decorative gradient overlay on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    : "bg-gradient-to-br from-purple-50/80 to-blue-50/80"
                }`}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                      : "bg-gradient-to-br from-purple-100 to-blue-100"
                  }`}
                >
                  <FileTextOutlined
                    className={`text-xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className={`z-20 w-8 h-8 flex items-center justify-center p-0 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close
                  }}
                />
              </div>

              <div className="relative z-10 mt-4">
                <Text
                  strong
                  className={`text-base block mb-2 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Create a Course feedback survey
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  to improve teaching methods and materials.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Forms list */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-slate-100" : "text-slate-800"
                }`}
              >
                Recent forms
              </Text>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                •
              </span>
              <Text
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Latest updates from your workspace.
              </Text>
            </div>
          </div>

          {sortedForms.length === 0 ? (
            <div
              className={`rounded-xl border p-8 text-center ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              }`}
            >
              <Text className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                No forms found. Create your first form to get started.
              </Text>
            </div>
          ) : viewMode === "list" ? (
            <div
              className={`rounded-xl border overflow-hidden shadow-md ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              }`}
            >
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse table-auto">
                  <thead>
                    <tr
                      className={`border-b ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-900"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <th
                        className={`text-left p-3 font-medium min-w-[220px] ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Form Name
                      </th>
                      <th
                        className={`text-left p-3 font-medium min-w-[120px] whitespace-nowrap ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Responses
                      </th>
                      <th
                        className={`text-left p-3 font-medium min-w-[120px] whitespace-nowrap ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Completion
                      </th>
                      <th
                        className={`text-left p-3 font-medium min-w-[120px] whitespace-nowrap ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Updated
                      </th>
                      <th
                        className={`text-left p-3 font-medium min-w-[120px] whitespace-nowrap ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Integrations
                      </th>
                      <th className="text-right p-3 w-[48px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedForms.map((form) => (
                      <tr
                        key={form.id}
                        onClick={() => handleOpenForm(form.id)}
                        className={`border-b cursor-pointer transition-all duration-200 ${
                          isDarkMode
                            ? "border-gray-700 hover:bg-purple-500/10 hover:border-purple-500/30"
                            : "border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                        }`}
                      >
                        <td className="p-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                              <FileTextOutlined className="text-white text-base" />
                            </div>
                            <Text
                              strong
                              className={`break-words ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                            >
                              {form.title || "Untitled Form"}
                            </Text>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <Text
                            className={`font-medium ${
                              isDarkMode ? "text-gray-100" : "text-gray-900"
                            }`}
                          >
                            -
                          </Text>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              form.isPublished
                                ? isDarkMode
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-green-100 text-green-700"
                                : isDarkMode
                                  ? "bg-gray-500/20 text-gray-400"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {form.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <Text
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {formatDate(form.updatedAt || form.createdAt)}
                          </Text>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={(event) => event.stopPropagation()}
                            className={`px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                              isDarkMode
                                ? "text-gray-400 hover:text-purple-400"
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                          />
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "edit",
                                  label: (
                                    <span
                                      className="flex items-center gap-2"
                                      onClick={(e) => handleEditForm(form, e)}
                                    >
                                      <EditOutlined /> Sửa form
                                    </span>
                                  ),
                                },
                                {
                                  key: "delete",
                                  label: (
                                    <Popconfirm
                                      title="Xóa form"
                                      description="Bạn có chắc chắn muốn xóa form này?"
                                      onConfirm={(e) =>
                                        handleDeleteForm(form.id!, e)
                                      }
                                      onCancel={(e) => e?.stopPropagation()}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      okButtonProps={{
                                        danger: true,
                                        loading: deletingFormId === form.id,
                                      }}
                                    >
                                      <span
                                        className="flex items-center gap-2 text-red-500"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <DeleteOutlined /> Xóa form
                                      </span>
                                    </Popconfirm>
                                  ),
                                },
                              ],
                            }}
                            trigger={["click"]}
                          >
                            <Button
                              type="text"
                              onClick={(event) => event.stopPropagation()}
                              className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                                isDarkMode
                                  ? "text-gray-400 hover:text-purple-400"
                                  : "text-gray-600 hover:text-purple-600"
                              }`}
                            >
                              ⋯
                            </Button>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {sortedForms.map((form) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={form.id}>
                  <Card
                    onClick={() => handleOpenForm(form.id)}
                    className={`group rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                      isDarkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20"
                        : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                    }`}
                    bodyStyle={{ padding: "20px" }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileTextOutlined className="text-white text-lg" />
                      </div>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "edit",
                              label: (
                                <span
                                  className="flex items-center gap-2"
                                  onClick={(e) => handleEditForm(form, e)}
                                >
                                  <EditOutlined /> Sửa form
                                </span>
                              ),
                            },
                            {
                              key: "delete",
                              label: (
                                <Popconfirm
                                  title="Xóa form"
                                  description="Bạn có chắc chắn muốn xóa form này?"
                                  onConfirm={(e) =>
                                    handleDeleteForm(form.id!, e)
                                  }
                                  onCancel={(e) => e?.stopPropagation()}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  okButtonProps={{
                                    danger: true,
                                    loading: deletingFormId === form.id,
                                  }}
                                >
                                  <span
                                    className="flex items-center gap-2 text-red-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <DeleteOutlined /> Xóa form
                                  </span>
                                </Popconfirm>
                              ),
                            },
                          ],
                        }}
                        trigger={["click"]}
                      >
                        <Button
                          type="text"
                          onClick={(event) => event.stopPropagation()}
                          className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-purple-400"
                              : "text-gray-600 hover:text-purple-600"
                          }`}
                        >
                          ⋯
                        </Button>
                      </Dropdown>
                    </div>
                    <div className="space-y-2">
                      <Text
                        strong
                        className={`text-base block ${
                          isDarkMode ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {form.title || "Untitled Form"}
                      </Text>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            form.isPublished
                              ? isDarkMode
                                ? "bg-green-500/20 text-green-400"
                                : "bg-green-100 text-green-700"
                              : isDarkMode
                                ? "bg-gray-500/20 text-gray-400"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {form.isPublished ? "Published" : "Draft"}
                        </span>
                        <Text
                          className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {formatDate(form.updatedAt || form.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      <EditFormModal
        open={isEditFormModalOpen}
        form={editingForm}
        onClose={() => {
          setIsEditFormModalOpen(false);
          setEditingForm(null);
        }}
      />
    </BaseScreenAdmin>
  );
}

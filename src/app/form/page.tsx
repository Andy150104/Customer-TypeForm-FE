"use client";

import React, { useEffect, useState, useMemo } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Popconfirm,
  Dropdown,
  Input,
} from "antd";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import {
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useRouter } from "next/navigation";
import { EditFormModal } from "EduSmart/components/Modal/EditFormModal";
import { CreateFormModal } from "EduSmart/components/Modal/CreateFormModal";
import { FormResponseEntity } from "EduSmart/api/api-auth-service";

const { Text } = Typography;

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const { forms, fetchForms, deleteForm } = useFormsStore();
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [authReady, setAuthReady] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [isEditFormModalOpen, setIsEditFormModalOpen] = useState(false);
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormResponseEntity | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const messageApi = useNotification();

  useEffect(() => {
    if (authReady) return;
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true);
    });
    return () => {
      unsubscribe?.();
    };
  }, [authReady]);

  useEffect(() => {
    if (!authReady || hasFetched) return;
    let active = true;

    const run = async () => {
      try {
        if (!token) {
          await refreshToken();
        }
        if (!active) return;
        await fetchForms();
        if (active) setHasFetched(true);
      } catch {
        if (!active) return;
        const nextPath = `${window.location.pathname}${window.location.search}`;
        router.replace(`/Login?next=${encodeURIComponent(nextPath)}`);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [authReady, hasFetched, token, refreshToken, fetchForms, router]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalForms = forms.length;
    const publishedForms = forms.filter((f) => f.isPublished).length;
    const draftForms = forms.filter((f) => !f.isPublished).length;
    const totalResponses = 0; // TODO: implement responses count
    return { totalForms, publishedForms, draftForms, totalResponses };
  }, [forms]);

  // Filter forms by search
  const filteredForms = useMemo(() => {
    if (!searchQuery.trim()) return forms;
    return forms.filter((f) =>
      f.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [forms, searchQuery]);

  // Sort by date
  const sortedForms = useMemo(() => {
    return [...filteredForms].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredForms]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
    });
  };

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

  const handleCreateForm = () => {
    setIsCreateFormModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchForms();
    setIsRefreshing(false);
    messageApi.success("Đã làm mới dữ liệu");
  };

  return (
    <BaseScreenAdmin>
      <div className="w-full space-y-8">
        {/* Hero Section - Glass Card */}
        <div
          className={`relative rounded-3xl p-8 overflow-hidden ${
            isDarkMode
              ? "bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-yellow-950/40"
              : "bg-gradient-to-br from-white/80 via-amber-50/60 to-orange-50/40"
          }`}
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(245, 158, 11, 0.15)"
              : "1px solid rgba(245, 158, 11, 0.2)",
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 8px 32px rgba(245, 158, 11, 0.1)",
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl ${
                isDarkMode ? "bg-amber-500/10" : "bg-amber-200/40"
              }`}
            />
            <div
              className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl ${
                isDarkMode ? "bg-orange-500/10" : "bg-orange-200/30"
              }`}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-8">
            {/* Left content */}
            <div className="flex-1 space-y-6">
              {/* Label */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
                  isDarkMode
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                Uniwrap Studio
              </span>

              {/* Title */}
              <h1
                className={`text-3xl lg:text-4xl font-bold leading-tight ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Không gian biểu mẫu
                <br />
                dịu mắt
              </h1>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed max-w-md ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Theo dõi, chỉnh sửa và chia sẻ biểu mẫu trong môi trường pastel
                nhẹ nhàng. Mọi thứ đồng bộ với brand palette để bạn tập trung
                vào insight.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={handleCreateForm}
                  className={`!h-11 !px-6 !rounded-full !font-medium !transition-all !duration-300 ${
                    isDarkMode
                      ? "!bg-amber-500/20 !border-amber-500/50 !text-amber-300 hover:!bg-amber-500/30 hover:!border-amber-400"
                      : "!bg-amber-50 !border-amber-300 !text-amber-700 hover:!bg-amber-100 hover:!border-amber-400"
                  }`}
                >
                  Tạo form mới
                </Button>
                <Button
                  icon={<ReloadOutlined spin={isRefreshing} />}
                  size="large"
                  onClick={handleRefresh}
                  className={`!h-11 !px-6 !rounded-full !font-medium !transition-all !duration-300 ${
                    isDarkMode
                      ? "!bg-transparent !border-gray-600 !text-gray-300 hover:!border-gray-500"
                      : "!bg-white/60 !border-gray-300 !text-gray-600 hover:!border-gray-400"
                  }`}
                >
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>

            {/* Right - Stats Cards */}
            <div className="lg:w-80 space-y-3">
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`rounded-2xl p-4 text-center ${
                    isDarkMode
                      ? "bg-amber-950/30 border border-amber-800/20"
                      : "bg-white/70 border border-amber-100"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {stats.totalForms}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Tổng form
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-4 text-center ${
                    isDarkMode
                      ? "bg-amber-950/30 border border-amber-800/20"
                      : "bg-white/70 border border-amber-100"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {stats.publishedForms}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Đã xuất bản
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-4 text-center ${
                    isDarkMode
                      ? "bg-amber-950/30 border border-amber-800/20"
                      : "bg-white/70 border border-amber-100"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {stats.draftForms}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Đang nháp
                  </div>
                </div>
              </div>
              {/* Bottom stat */}
              <div
                className={`rounded-2xl p-4 ${
                  isDarkMode
                    ? "bg-amber-950/30 border border-amber-800/20"
                    : "bg-white/70 border border-amber-100"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {stats.totalResponses}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Lượt gửi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Biểu mẫu của bạn
            </h2>
            <Input
              placeholder="Tìm theo tên form"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`!w-full sm:!w-64 !h-10 !rounded-xl ${
                isDarkMode
                  ? "!bg-amber-950/20 !border-amber-800/30 !text-white placeholder:!text-gray-500"
                  : "!bg-white/80 !border-amber-200/60 !text-gray-800 placeholder:!text-gray-400"
              }`}
              allowClear
            />
          </div>

          {/* Forms grid */}
          {sortedForms.length === 0 ? (
            <div
              className={`rounded-2xl p-12 text-center ${
                isDarkMode
                  ? "bg-amber-950/20 border border-amber-800/20"
                  : "bg-white/60 border border-amber-100"
              }`}
            >
              <FileTextOutlined
                className={`text-4xl mb-4 ${
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <Text
                className={`block ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchQuery
                  ? "Không tìm thấy form nào"
                  : "Chưa có form nào. Tạo form đầu tiên của bạn!"}
              </Text>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {sortedForms.map((form) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={form.id}>
                  <Card
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                      isDarkMode
                        ? "!bg-amber-950/20 !border-l-4 !border-l-amber-500 !border-t-0 !border-r-0 !border-b-0 hover:!bg-amber-950/30"
                        : "!bg-white/80 !border-l-4 !border-l-amber-400 !border-t-0 !border-r-0 !border-b-0 hover:!bg-white"
                    }`}
                    style={{
                      borderRadius: "16px",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.2)"
                        : "0 4px 12px rgba(245, 158, 11, 0.08)",
                    }}
                    bodyStyle={{ padding: "20px" }}
                    onClick={() => handleOpenForm(form.id)}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide ${
                          form.isPublished
                            ? isDarkMode
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-green-50 text-green-600 border border-green-200"
                            : isDarkMode
                              ? "bg-gray-500/20 text-gray-400 border border-gray-600"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {form.isPublished ? "Xuất bản" : "Nháp"}
                      </span>
                      <Text
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {formatDate(form.createdAt)}
                      </Text>
                    </div>

                    {/* Form title */}
                    <h3
                      className={`text-base font-semibold mb-3 line-clamp-1 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {form.title || "Biểu mẫu chưa đặt tên"}
                    </h3>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 mb-4">
                      <div>
                        <Text
                          className={`text-xs ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Lượt gửi
                        </Text>
                        <div
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          0
                        </div>
                      </div>
                      <div>
                        <Text
                          className={`text-xs ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Trạng thái
                        </Text>
                        <div
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {form.isPublished ? "Xuất bản" : "Nháp"}
                        </div>
                      </div>
                    </div>

                    {/* Action link */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenForm(form.id);
                        }}
                        className={`text-sm font-medium flex items-center gap-1 transition-all hover:gap-2 ${
                          isDarkMode
                            ? "text-amber-400 hover:text-amber-300"
                            : "text-amber-600 hover:text-amber-700"
                        }`}
                      >
                        Chỉnh sửa ngay
                        <RightOutlined className="text-xs" />
                      </button>

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
                                  <EditOutlined /> Đổi tên
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
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          className={`!w-8 !h-8 !p-0 !rounded-lg opacity-0 group-hover:opacity-100 !transition-all ${
                            isDarkMode
                              ? "!text-gray-400 hover:!text-white hover:!bg-amber-500/20"
                              : "!text-gray-400 hover:!text-gray-600 hover:!bg-amber-50"
                          }`}
                        >
                          ⋯
                        </Button>
                      </Dropdown>
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

      <CreateFormModal
        open={isCreateFormModalOpen}
        onClose={() => setIsCreateFormModalOpen(false)}
      />
    </BaseScreenAdmin>
  );
}

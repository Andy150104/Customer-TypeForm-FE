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
  Modal,
  Form,
  Input,
  Empty,
  Tooltip,
  Tag,
  Divider,
  Select,
  Switch,
} from "antd";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import {
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RocketOutlined,
  BarsOutlined,
  NumberOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  SlidersOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useTemplatesStore } from "EduSmart/stores/Templates/TemplatesStore";
import { useRouter } from "next/navigation";
import {
  FieldType,
  TemplateFieldDataDto,
  TemplateSummaryResponseEntity,
} from "EduSmart/api/api-auth-service";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type ViewMode = "list" | "grid";

// Field type metadata
const FIELD_TYPES = [
  {
    value: FieldType.Value0,
    label: "Văn bản ngắn",
    icon: <BarsOutlined />,
    description: "Nhập một dòng",
  },
  {
    value: FieldType.Value1,
    label: "Văn bản dài",
    icon: <FormOutlined />,
    description: "Nhập nhiều dòng",
  },
  {
    value: FieldType.Value2,
    label: "Số",
    icon: <NumberOutlined />,
    description: "Nhập số",
  },
  {
    value: FieldType.Value3,
    label: "Email",
    icon: <MailOutlined />,
    description: "Địa chỉ email",
  },
  {
    value: FieldType.Value4,
    label: "Điện thoại",
    icon: <PhoneOutlined />,
    description: "Số điện thoại",
  },
  {
    value: FieldType.Value5,
    label: "Ngày",
    icon: <CalendarOutlined />,
    description: "Chọn ngày",
  },
  {
    value: FieldType.Value6,
    label: "Giờ",
    icon: <ClockCircleOutlined />,
    description: "Chọn giờ",
  },
  {
    value: FieldType.Value7,
    label: "Ngày & giờ",
    icon: <CalendarOutlined />,
    description: "Chọn ngày và giờ",
  },
  {
    value: FieldType.Value8,
    label: "Radio",
    icon: <CheckCircleOutlined />,
    description: "Chọn một lựa chọn",
    hasOptions: true,
  },
  {
    value: FieldType.Value10,
    label: "Danh sách thả xuống",
    icon: <FormOutlined />,
    description: "Chọn từ danh sách",
    hasOptions: true,
  },
  {
    value: FieldType.Value11,
    label: "Đánh giá",
    icon: <StarOutlined />,
    description: "Đánh giá sao",
  },
  {
    value: FieldType.Value12,
    label: "Thang điểm",
    icon: <SlidersOutlined />,
    description: "Thang điểm tuyến tính",
  },
  {
    value: FieldType.Value13,
    label: "Có/Không",
    icon: <CheckCircleOutlined />,
    description: "Chọn Có hoặc Không",
  },
];

type TemplateField = TemplateFieldDataDto & {
  tempId: string;
  options?: { label: string; value: string }[];
};

export default function TemplatePage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const messageApi = useNotification();
  const {
    templates,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    createFormFromTemplate,
  } = useTemplatesStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template form state
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);

  // Field form state
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null,
  );
  const [fieldForm] = Form.useForm();

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [templates]);

  const handleOpenCreateModal = () => {
    setTemplateTitle("");
    setTemplateDescription("");
    setTemplateFields([]);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setTemplateTitle("");
    setTemplateDescription("");
    setTemplateFields([]);
  };

  const handleAddField = () => {
    setEditingFieldIndex(null);
    fieldForm.resetFields();
    fieldForm.setFieldsValue({
      type: FieldType.Value0,
      isRequired: false,
      options: [
        { label: "", value: "" },
        { label: "", value: "" },
      ],
    });
    setIsFieldModalOpen(true);
  };

  const handleEditField = (index: number) => {
    const field = templateFields[index];
    setEditingFieldIndex(index);
    fieldForm.setFieldsValue({
      title: field.title,
      description: field.description,
      type: field.type,
      isRequired: field.isRequired,
      options: field.options?.length
        ? field.options
        : [
            { label: "", value: "" },
            { label: "", value: "" },
          ],
    });
    setIsFieldModalOpen(true);
  };

  const handleDeleteField = (index: number) => {
    setTemplateFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldSubmit = async () => {
    try {
      const values = await fieldForm.validateFields();
      const fieldMeta = FIELD_TYPES.find((f) => f.value === values.type);

      const newField: TemplateField = {
        tempId:
          editingFieldIndex !== null
            ? templateFields[editingFieldIndex].tempId
            : `temp-${Date.now()}`,
        title: values.title,
        description: values.description || null,
        type: values.type,
        isRequired: values.isRequired || false,
        options: fieldMeta?.hasOptions
          ? (values.options || [])
              .filter((opt: { label?: string }) => opt?.label?.trim())
              .map((opt: { label: string; value?: string }, idx: number) => ({
                label: opt.label.trim(),
                value: opt.value?.trim() || `option_${idx + 1}`,
              }))
          : undefined,
      };

      if (editingFieldIndex !== null) {
        setTemplateFields((prev) =>
          prev.map((f, i) => (i === editingFieldIndex ? newField : f)),
        );
      } else {
        setTemplateFields((prev) => [...prev, newField]);
      }

      setIsFieldModalOpen(false);
      fieldForm.resetFields();
    } catch (error) {
      console.error("Field validation error:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateTitle.trim()) {
      messageApi.error("Vui lòng nhập tên mẫu");
      return;
    }

    if (templateFields.length === 0) {
      messageApi.error("Vui lòng thêm ít nhất 1 câu hỏi");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTemplate({
        title: templateTitle.trim(),
        description: templateDescription.trim() || null,
        fields: templateFields.map((field) => ({
          title: field.title,
          description: field.description,
          type: field.type,
          isRequired: field.isRequired,
          options: field.options,
        })),
      });

      if (result) {
        messageApi.success("Tạo mẫu thành công!");
        handleCloseCreateModal();
      } else {
        messageApi.error("Tạo mẫu thất bại");
      }
    } catch (error) {
      console.error("Create template error:", error);
      messageApi.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setDeletingTemplateId(templateId);
    try {
      const success = await deleteTemplate(templateId);
      if (success) {
        messageApi.success("Đã xóa mẫu");
      } else {
        messageApi.error("Xóa mẫu thất bại");
      }
    } catch (error) {
      console.error("Delete template error:", error);
      messageApi.error("Có lỗi xảy ra");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handleUseTemplate = async (template: TemplateSummaryResponseEntity) => {
    try {
      const result = await createFormFromTemplate({
        templateId: template.id,
      });

      if (result?.formId) {
        messageApi.success("Đã tạo biểu mẫu từ mẫu!");
        router.push(`/form/${result.formId}/edit`);
      } else {
        messageApi.error("Tạo biểu mẫu thất bại");
      }
    } catch (error) {
      console.error("Use template error:", error);
      messageApi.error("Có lỗi xảy ra");
    }
  };

  const getFieldTypeIcon = (type?: FieldType) => {
    const fieldMeta = FIELD_TYPES.find((f) => f.value === type);
    return fieldMeta?.icon || <BarsOutlined />;
  };

  const getFieldTypeLabel = (type?: FieldType) => {
    const fieldMeta = FIELD_TYPES.find((f) => f.value === type);
    return fieldMeta?.label || "Không xác định";
  };

  const selectedFieldType = Form.useWatch("type", fieldForm);
  const selectedFieldMeta = FIELD_TYPES.find(
    (f) => f.value === selectedFieldType,
  );

  return (
    <BaseScreenAdmin>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="space-y-1">
            <Title
              level={2}
              className={`m-0 ${isDarkMode ? "text-amber-50" : "text-amber-900"}`}
            >
              Mẫu biểu mẫu
            </Title>
            <Text
              className={`block text-sm leading-snug ${
                isDarkMode ? "text-amber-200/60" : "text-amber-700/70"
              }`}
            >
              Tạo và quản lý các mẫu có sẵn để tái sử dụng cho các biểu mẫu
              mới.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleOpenCreateModal}
            className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600 !text-white !font-semibold !shadow-lg !shadow-amber-500/25"
          >
            Tạo mẫu
          </Button>
        </div>

        {/* View options */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Text
              className={`text-sm font-semibold ${
                isDarkMode ? "text-amber-100" : "text-amber-800"
              }`}
            >
              Danh sách mẫu
            </Text>
            <span
              className={isDarkMode ? "text-amber-500/50" : "text-amber-400"}
            >
              •
            </span>
            <Text
              className={`text-xs ${
                isDarkMode ? "text-amber-200/60" : "text-amber-600"
              }`}
            >
              {templates.length} mẫu
            </Text>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button.Group>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                className={
                  viewMode === "list"
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none !text-white"
                    : isDarkMode
                      ? "!text-amber-200 !border-amber-700 hover:!border-amber-500"
                      : "!text-amber-700 !border-amber-300 hover:!border-amber-400"
                }
                onClick={() => setViewMode("list")}
              />
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                className={
                  viewMode === "grid"
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none !text-white"
                    : isDarkMode
                      ? "!text-amber-200 !border-amber-700 hover:!border-amber-500"
                      : "!text-amber-700 !border-amber-300 hover:!border-amber-400"
                }
                onClick={() => setViewMode("grid")}
              />
            </Button.Group>
          </div>
        </div>

        {/* Templates list */}
        {sortedTemplates.length === 0 ? (
          <div
            className={`rounded-xl border p-12 text-center ${
              isDarkMode
                ? "bg-amber-950/20 border-amber-800/30"
                : "bg-amber-50/50 border-amber-200"
            }`}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-2">
                  <Text
                    className={
                      isDarkMode ? "text-amber-200/60" : "text-amber-600"
                    }
                  >
                    Chưa có mẫu nào
                  </Text>
                  <div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleOpenCreateModal}
                      className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    >
                      Tạo mẫu đầu tiên
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        ) : viewMode === "grid" ? (
          <Row gutter={[20, 20]}>
            {sortedTemplates.map((template) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                <Card
                  className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 h-full ${
                    isDarkMode
                      ? "!bg-amber-950/30 !border-amber-800/30 hover:!border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20"
                      : "!bg-white !border-amber-200 hover:!border-amber-400 hover:shadow-xl hover:shadow-amber-200/50"
                  }`}
                  bodyStyle={{ padding: "20px" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isDarkMode
                          ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                          : "bg-gradient-to-br from-amber-100 to-orange-100"
                      }`}
                    >
                      <FileTextOutlined
                        className={`text-xl ${
                          isDarkMode ? "text-amber-400" : "text-amber-600"
                        }`}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Popconfirm
                        title="Xóa mẫu này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeleteTemplate(template.id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                          danger: true,
                          loading: deletingTemplateId === template.id,
                        }}
                      >
                        <Tooltip title="Xóa">
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDarkMode
                                ? "text-amber-400/60 hover:text-red-400 hover:bg-red-500/20"
                                : "text-amber-500 hover:text-red-600 hover:bg-red-50"
                            }`}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Text
                      strong
                      className={`text-base block line-clamp-2 ${
                        isDarkMode ? "text-amber-50" : "text-amber-900"
                      }`}
                    >
                      {template.title || "Mẫu chưa đặt tên"}
                    </Text>
                    {template.description && (
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        className={`text-sm m-0 ${
                          isDarkMode ? "text-amber-200/60" : "text-amber-700/70"
                        }`}
                      >
                        {template.description}
                      </Paragraph>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Tag
                      className={`rounded-full border-0 ${
                        isDarkMode
                          ? "!bg-amber-500/20 !text-amber-300"
                          : "!bg-amber-100 !text-amber-700"
                      }`}
                    >
                      {template.fieldCount || 0} câu hỏi
                    </Tag>
                    <Text
                      className={`text-xs ${
                        isDarkMode ? "text-amber-400/50" : "text-amber-500"
                      }`}
                    >
                      {formatDate(template.createdAt)}
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    icon={<RocketOutlined />}
                    block
                    onClick={() => handleUseTemplate(template)}
                    className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                  >
                    Sử dụng mẫu
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div
            className={`rounded-xl border overflow-hidden shadow-md ${
              isDarkMode
                ? "bg-amber-950/20 border-amber-800/30"
                : "bg-white border-amber-200"
            }`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse table-auto">
                <thead>
                  <tr
                    className={`border-b ${
                      isDarkMode
                        ? "border-amber-800/30 bg-amber-950/40"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <th
                      className={`text-left p-3 font-medium ${isDarkMode ? "text-amber-200" : "text-amber-800"}`}
                    >
                      Mẫu
                    </th>
                    <th
                      className={`text-left p-3 font-medium ${isDarkMode ? "text-amber-200" : "text-amber-800"}`}
                    >
                      Câu hỏi
                    </th>
                    <th
                      className={`text-left p-3 font-medium ${isDarkMode ? "text-amber-200" : "text-amber-800"}`}
                    >
                      Ngày tạo
                    </th>
                    <th
                      className={`text-right p-3 font-medium ${isDarkMode ? "text-amber-200" : "text-amber-800"}`}
                    >
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className={`border-b transition-colors ${
                        isDarkMode
                          ? "border-amber-800/20 hover:bg-amber-950/30"
                          : "border-amber-100 hover:bg-amber-50"
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? "bg-amber-500/20" : "bg-amber-100"
                            }`}
                          >
                            <FileTextOutlined
                              className={
                                isDarkMode ? "text-amber-400" : "text-amber-600"
                              }
                            />
                          </div>
                          <div>
                            <Text
                              strong
                              className={
                                isDarkMode ? "text-amber-50" : "text-amber-900"
                              }
                            >
                              {template.title || "Chưa đặt tên"}
                            </Text>
                            {template.description && (
                              <Text
                                className={`block text-xs truncate max-w-[200px] ${
                                  isDarkMode
                                    ? "text-amber-300/50"
                                    : "text-amber-600/70"
                                }`}
                              >
                                {template.description}
                              </Text>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Tag
                          className={`border-0 ${isDarkMode ? "!bg-amber-500/20 !text-amber-300" : "!bg-amber-100 !text-amber-700"}`}
                        >
                          {template.fieldCount || 0}
                        </Tag>
                      </td>
                      <td className="p-3">
                        <Text
                          className={
                            isDarkMode ? "text-amber-200/60" : "text-amber-700"
                          }
                        >
                          {formatDate(template.createdAt)}
                        </Text>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="primary"
                            size="small"
                            icon={<RocketOutlined />}
                            onClick={() => handleUseTemplate(template)}
                            className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                          >
                            Sử dụng
                          </Button>
                          <Popconfirm
                            title="Xóa mẫu này?"
                            onConfirm={() => handleDeleteTemplate(template.id!)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-amber-500" />
            <span>Tạo mẫu mới</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={handleCloseCreateModal}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCloseCreateModal}>
            Hủy
          </Button>,
          <Button
            key="create"
            type="primary"
            loading={isSubmitting}
            onClick={handleCreateTemplate}
            className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
          >
            Tạo mẫu
          </Button>,
        ]}
      >
        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="space-y-4">
            <div>
              <Text strong className="block mb-2">
                Tên mẫu <span className="text-red-500">*</span>
              </Text>
              <Input
                placeholder="Nhập tên mẫu..."
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <Text strong className="block mb-2">
                Mô tả
              </Text>
              <TextArea
                placeholder="Mô tả về mẫu này..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Divider />

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text strong className="block">
                  Câu hỏi ({templateFields.length})
                </Text>
                <Text type="secondary" className="text-xs">
                  Thêm các câu hỏi cho mẫu
                </Text>
              </div>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddField}
              >
                Thêm câu hỏi
              </Button>
            </div>

            {templateFields.length === 0 ? (
              <div
                className={`border border-dashed rounded-lg p-8 text-center ${
                  isDarkMode ? "border-amber-700/50" : "border-amber-300"
                }`}
              >
                <Text type="secondary">
                  Chưa có câu hỏi nào. Bấm &quot;Thêm câu hỏi&quot; để bắt đầu.
                </Text>
              </div>
            ) : (
              <div className="space-y-2">
                {templateFields.map((field, index) => (
                  <div
                    key={field.tempId}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isDarkMode
                        ? "border-amber-800/30 bg-amber-950/30"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDarkMode
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {getFieldTypeIcon(field.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text strong className="block truncate">
                        {field.title || `Câu hỏi ${index + 1}`}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {getFieldTypeLabel(field.type)}
                        {field.isRequired && (
                          <Tag color="red" className="ml-2 text-xs">
                            Bắt buộc
                          </Tag>
                        )}
                      </Text>
                    </div>
                    <div className="flex gap-1">
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditField(index)}
                        />
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteField(index)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add/Edit Field Modal */}
      <Modal
        title={
          editingFieldIndex !== null ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"
        }
        open={isFieldModalOpen}
        onCancel={() => setIsFieldModalOpen(false)}
        onOk={handleFieldSubmit}
        okText={editingFieldIndex !== null ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        okButtonProps={{
          className:
            "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600",
        }}
      >
        <Form form={fieldForm} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="Câu hỏi"
            rules={[{ required: true, message: "Vui lòng nhập câu hỏi" }]}
          >
            <Input placeholder="Nhập câu hỏi..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả (tùy chọn)">
            <TextArea placeholder="Mô tả thêm cho câu hỏi..." rows={2} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select
              placeholder="Chọn loại câu hỏi"
              options={FIELD_TYPES.map((f) => ({
                value: f.value,
                label: (
                  <div className="flex items-center gap-2">
                    {f.icon}
                    <span>{f.label}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item name="isRequired" valuePropName="checked" label="Bắt buộc">
            <Switch />
          </Form.Item>

          {selectedFieldMeta?.hasOptions && (
            <Form.Item label="Các lựa chọn">
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <div className="space-y-2">
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-2">
                        <Form.Item
                          {...restField}
                          name={[name, "label"]}
                          className="flex-1 mb-0"
                          rules={[{ required: true, message: "Nhập lựa chọn" }]}
                        >
                          <Input placeholder={`Lựa chọn ${name + 1}`} />
                        </Form.Item>
                        {fields.length > 2 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ label: "", value: "" })}
                      icon={<PlusOutlined />}
                      block
                    >
                      Thêm lựa chọn
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </BaseScreenAdmin>
  );
}

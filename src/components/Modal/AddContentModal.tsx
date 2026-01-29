"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Divider,
  Space,
  Button,
  Typography,
  Tag,
  Upload,
  Image as AntdImage,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  BarsOutlined,
  NumberOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FormOutlined,
  AppstoreOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  PaperClipOutlined,
  StarOutlined,
  SlidersOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import {
  CreateFieldCommand,
  CreateFieldResponseEntity,
  FieldType,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { getBase64 } from "EduSmart/utils/commonFunction";

type OptionFormValue = {
  label?: string;
  value?: string;
};

type AddQuestionFormValues = {
  title?: string;
  description?: string;
  isRequired?: boolean;
  options?: OptionFormValue[];
};

type AddContentModalProps = {
  open: boolean;
  formId: string | null;
  onClose: () => void;
  onCreated?: (field: CreateFieldResponseEntity) => void | Promise<void>;
};

type FieldTypeMeta = {
  key: string;
  value: FieldType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "basic" | "choice" | "advanced";
  requiresOptions?: boolean;
  lockedOptions?: OptionFormValue[];
};

const YES_NO_OPTIONS: OptionFormValue[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const createOptionPlaceholders = (count = 2): OptionFormValue[] =>
  Array.from({ length: count }, (_, idx) => ({
    label: `Option ${idx + 1}`,
    value: `option_${idx + 1}`,
  }));

const FIELD_TYPES: FieldTypeMeta[] = [
  {
    key: "Text",
    value: FieldType.Value0,
    label: "Short text",
    description: "Single line response",
    icon: <BarsOutlined />,
    category: "basic",
  },
  {
    key: "Number",
    value: FieldType.Value1,
    label: "Number",
    description: "Collect numeric values",
    icon: <NumberOutlined />,
    category: "basic",
  },
  {
    key: "Email",
    value: FieldType.Value2,
    label: "Email",
    description: "Validate email addresses",
    icon: <MailOutlined />,
    category: "basic",
  },
  {
    key: "Phone",
    value: FieldType.Value3,
    label: "Phone",
    description: "Capture phone numbers",
    icon: <PhoneOutlined />,
    category: "basic",
  },
  {
    key: "Date",
    value: FieldType.Value4,
    label: "Date",
    description: "Pick a calendar date",
    icon: <CalendarOutlined />,
    category: "basic",
  },
  {
    key: "Time",
    value: FieldType.Value5,
    label: "Time",
    description: "Select a time of day",
    icon: <ClockCircleOutlined />,
    category: "basic",
  },
  {
    key: "DateTime",
    value: FieldType.Value6,
    label: "Date & Time",
    description: "Combine date and time",
    icon: <CalendarOutlined />,
    category: "basic",
  },
  {
    key: "Textarea",
    value: FieldType.Value7,
    label: "Long text",
    description: "Let people write longer answers",
    icon: <FileTextOutlined />,
    category: "basic",
  },
  {
    key: "Select",
    value: FieldType.Value8,
    label: "Dropdown",
    description: "Single choice dropdown",
    icon: <FormOutlined />,
    category: "choice",
    requiresOptions: true,
  },
  {
    key: "MultiSelect",
    value: FieldType.Value9,
    label: "Multi select",
    description: "Choose multiple items",
    icon: <AppstoreOutlined />,
    category: "choice",
    requiresOptions: true,
  },
  {
    key: "Checkbox",
    value: FieldType.Value10,
    label: "Checkboxes",
    description: "Display as checkbox list",
    icon: <CheckSquareOutlined />,
    category: "choice",
    requiresOptions: true,
  },
  {
    key: "Radio",
    value: FieldType.Value11,
    label: "Multiple choice",
    description: "Show radio-style options",
    icon: <CheckCircleOutlined />,
    category: "choice",
    requiresOptions: true,
  },
  {
    key: "File",
    value: FieldType.Value12,
    label: "File upload",
    description: "Receive attachments",
    icon: <PaperClipOutlined />,
    category: "advanced",
  },
  {
    key: "Rating",
    value: FieldType.Value13,
    label: "Rating",
    description: "Capture star ratings",
    icon: <StarOutlined />,
    category: "advanced",
  },
  {
    key: "Scale",
    value: FieldType.Value14,
    label: "Opinion scale",
    description: "Rate on a numeric scale",
    icon: <SlidersOutlined />,
    category: "advanced",
  },
  {
    key: "YesNo",
    value: FieldType.Value15,
    label: "Yes / No",
    description: "Binary choice",
    icon: <QuestionCircleOutlined />,
    category: "choice",
    requiresOptions: true,
    lockedOptions: YES_NO_OPTIONS,
  },
];

const FIELD_TYPE_SECTIONS = [
  { key: "basic" as const, title: "Basics" },
  { key: "choice" as const, title: "Choices" },
  { key: "advanced" as const, title: "Advanced" },
];

const MIN_OPTION_COUNT = 2;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldPropertyBag = Record<string, any>;

const DEFAULT_PLACEHOLDER = "Type your answer";

const FIELD_PROPERTY_PRESETS: Partial<Record<FieldType, FieldPropertyBag>> = {
  [FieldType.Value0]: { placeholder: "Ví dụ: Nguyễn Văn A", maxLength: 100 },
  [FieldType.Value1]: { placeholder: "Ví dụ: 10", min: 0, max: 1000000 },
  [FieldType.Value2]: { placeholder: "email@company.com" },
  [FieldType.Value3]: { placeholder: "+84 912 345 678" },
  [FieldType.Value4]: { placeholder: "Chọn ngày" },
  [FieldType.Value5]: { placeholder: "Chọn giờ" },
  [FieldType.Value6]: { placeholder: "Chọn ngày & giờ" },
  [FieldType.Value7]: { placeholder: "Nhập câu trả lời dài", maxLength: 500 },
  [FieldType.Value8]: { placeholder: "Chọn 1 đáp án" },
  [FieldType.Value9]: { placeholder: "Chọn nhiều đáp án" },
  [FieldType.Value10]: { placeholder: "Đánh dấu các lựa chọn phù hợp" },
  [FieldType.Value11]: { placeholder: "Chọn một" },
  [FieldType.Value12]: { placeholder: "Tải tệp lên" },
  [FieldType.Value13]: { placeholder: "1 = tệ, 5 = tuyệt vời", max: 5, min: 1 },
  [FieldType.Value14]: {
    placeholder: "Kéo để đánh giá",
    min: 0,
    max: 10,
    step: 1,
  },
  [FieldType.Value15]: { placeholder: "Có hoặc Không" },
};

const getPropertiesForType = (type: FieldType): FieldPropertyBag | null => {
  const preset = FIELD_PROPERTY_PRESETS[type];
  return preset ? { ...preset } : null;
};

const getPlaceholderForType = (type: FieldType) =>
  FIELD_PROPERTY_PRESETS[type]?.placeholder ?? DEFAULT_PLACEHOLDER;

const normalizeOptionValue = (
  label: string | undefined,
  value: string | undefined,
  index: number,
) => {
  const fallback = label?.trim() || value?.trim() || `option_${index + 1}`;
  return (
    fallback
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_{2,}/g, "_")
      .slice(0, 64) || `option_${index + 1}`
  );
};

export const AddContentModal: React.FC<AddContentModalProps> = ({
  open,
  formId,
  onClose,
  onCreated,
}) => {
  const [form] = Form.useForm<AddQuestionFormValues>();
  const { isDarkMode } = useTheme();
  const [selectedType, setSelectedType] = useState<FieldType>(FieldType.Value0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyPreview, setPropertyPreview] =
    useState<FieldPropertyBag | null>(getPropertiesForType(FieldType.Value0));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const messageApi = useNotification();
  const createField = useFormsStore((state) => state.createField);
  const autoPlaceholder =
    propertyPreview?.placeholder ?? getPlaceholderForType(selectedType);

  const fieldMetaMap = useMemo(() => {
    const map = new Map<FieldType, FieldTypeMeta>();
    FIELD_TYPES.forEach((meta) => map.set(meta.value, meta));
    return map;
  }, []);

  const selectedMeta = fieldMetaMap.get(selectedType);
  const needsOptions = Boolean(selectedMeta?.requiresOptions);
  const lockedOptions = selectedMeta?.lockedOptions ?? null;

  const resetFormValues = useCallback(() => {
    form.setFieldsValue({
      title: "",
      description: "",
      isRequired: true,
      options: createOptionPlaceholders(),
    });
    setSelectedType(FieldType.Value0);
    setPropertyPreview(getPropertiesForType(FieldType.Value0));
    setImageUrl(null);
    setImageFileList([]);
  }, [form]);

  useEffect(() => {
    if (open) {
      resetFormValues();
    }
  }, [open, resetFormValues]);

  useEffect(() => {
    if (!open) return;
    if (needsOptions) {
      if (lockedOptions) {
        form.setFieldsValue({ options: lockedOptions });
        return;
      }
      const currentOptions = form.getFieldValue("options");
      if (!currentOptions || !currentOptions.length) {
        form.setFieldsValue({ options: createOptionPlaceholders() });
      }
    } else {
      form.setFieldsValue({ options: undefined });
    }
  }, [form, needsOptions, lockedOptions, open, selectedType]);

  const handleCancel = () => {
    onClose();
    resetFormValues();
  };

  const handleTypeSelect = (type: FieldType) => {
    setSelectedType(type);
    setPropertyPreview(getPropertiesForType(type));
  };

  const handleImageChange: UploadProps["onChange"] = async ({
    fileList: newFileList,
  }) => {
    setImageFileList(newFileList);
    if (newFileList.length === 0) {
      setImageUrl(null);
      return;
    }
    const file = newFileList[0];
    if (file.originFileObj) {
      const base64 = await getBase64(file.originFileObj);
      setImageUrl(base64);
    } else if (file.url) {
      setImageUrl(file.url);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImageFileList([]);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4">
      <PlusOutlined />
      <div className="mt-2 text-sm">Upload Image</div>
    </div>
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!formId) {
        messageApi.error("Form ID is missing. Please reload the editor.");
        return;
      }
      setIsSubmitting(true);
      const propertiesPayload = propertyPreview
        ? { ...propertyPreview }
        : undefined;
      const optionsPayload = needsOptions
        ? (lockedOptions ?? values.options ?? createOptionPlaceholders()).map(
            (option, index) => ({
              label: option?.label?.trim() || `Option ${index + 1}`,
              value: normalizeOptionValue(option?.label, option?.value, index),
            }),
          )
        : undefined;

      const payload: CreateFieldCommand = {
        formId,
        title: values.title?.trim() ?? "",
        description: values.description?.trim() || null,
        imageUrl: imageUrl,
        type: selectedType,
        isRequired: Boolean(values.isRequired),
        properties: propertiesPayload ?? null,
        options: optionsPayload,
      };

      const response = await createField(payload);
      if (!response) {
        messageApi.error("Failed to add question. Please try again.");
        return;
      }

      messageApi.success("Question added successfully.");
      resetFormValues();
      onClose();
      if (onCreated) {
        await onCreated(response);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error && "errorFields" in error) {
        return;
      }
      console.error("create field error", error);
      messageApi.error("Failed to add question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      centered
      width={960}
      okText="Add question"
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      okButtonProps={{
        disabled: !formId,
        className:
          "bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1]",
      }}
      cancelButtonProps={{ disabled: isSubmitting }}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
      className="add-content-modal"
      destroyOnClose={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isRequired: true }}
        className="space-y-6"
      >
        <div
          className={`rounded-3xl border px-5 py-4 shadow-sm ${
            isDarkMode
              ? "border-slate-800 bg-slate-900/70"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <Typography.Title level={4} className="m-0">
                Add a question
              </Typography.Title>
              <Typography.Text type="secondary">
                Choose a field pattern on the left, then fine-tune the content
                on the right.
              </Typography.Text>
              {!formId && (
                <div className="mt-1 text-amber-500 text-sm">
                  Form identifier is not ready yet. Please wait for the page to
                  finish loading.
                </div>
              )}
            </div>
            <div
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                isDarkMode
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              Current type: {selectedMeta?.label}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className={`rounded-3xl border px-5 py-5 shadow-sm ${
              isDarkMode
                ? "border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-900"
                : "border-slate-200 bg-gradient-to-b from-white to-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="m-0 text-base font-semibold">Field palette</p>
                <p
                  className={`m-0 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Pick a layout that fits the answer style you expect.
                </p>
              </div>
              <Tag color="#6B46C1" className="px-3 py-1 text-xs">
                {selectedMeta?.category === "choice" ? "Choice based" : "Input"}
              </Tag>
            </div>
            <Divider className="my-4" />
            {FIELD_TYPE_SECTIONS.map((section) => {
              const items = FIELD_TYPES.filter(
                (item) => item.category === section.key,
              );
              if (!items.length) return null;
              return (
                <div key={section.key} className="mb-5 last:mb-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {section.title}
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map((item) => {
                      const isActive = selectedType === item.value;
                      return (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => handleTypeSelect(item.value)}
                          className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                            isActive
                              ? "border-indigo-400 bg-indigo-500/10 shadow focus:outline-none"
                              : isDarkMode
                                ? "border-white/5 hover:border-indigo-400/50"
                                : "border-slate-200 hover:border-indigo-200 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`mt-1 text-lg ${
                              isActive
                                ? "text-indigo-400"
                                : isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">
                              {item.label}
                            </span>
                            <span
                              className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                            >
                              {item.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div
              className={`rounded-3xl border px-5 py-5 shadow-sm ${
                isDarkMode
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold m-0">Question copy</p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Keep it short and actionable.
                  </p>
                </div>
                <Tag
                  className="text-xs"
                  color={isDarkMode ? "#94a3b8" : "#cbd5f5"}
                >
                  Visible to respondents
                </Tag>
              </div>
              <Divider className="my-4" />
              <Form.Item
                name="title"
                label="Question"
                rules={[
                  { required: true, message: "Please enter a question" },
                  { max: 200, message: "Question is too long" },
                ]}
              >
                <Input
                  placeholder="Ex: What is your company email?"
                  autoFocus
                  disabled={isSubmitting}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Helper text"
                rules={[{ max: 300, message: "Description is too long" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Optional context, tips, or sample answers"
                  disabled={isSubmitting}
                />
              </Form.Item>

              <Form.Item label="Question Image (optional)">
                <div className="flex flex-col gap-3">
                  {imageUrl ? (
                    <div className="relative inline-block">
                      <AntdImage
                        src={imageUrl}
                        alt="Question image"
                        width={180}
                        height={120}
                        style={{ objectFit: "cover", borderRadius: 12 }}
                        preview={{
                          visible: previewOpen,
                          onVisibleChange: setPreviewOpen,
                        }}
                      />
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                      />
                    </div>
                  ) : (
                    <Upload
                      listType="picture-card"
                      fileList={imageFileList}
                      onChange={handleImageChange}
                      beforeUpload={() => false}
                      accept="image/*"
                      maxCount={1}
                      disabled={isSubmitting}
                    >
                      {imageFileList.length === 0 && uploadButton}
                    </Upload>
                  )}
                  <Typography.Text type="secondary" className="text-xs">
                    <PictureOutlined className="mr-1" />
                    Upload an image to display with your question
                  </Typography.Text>
                </div>
              </Form.Item>

              <Form.Item label="Answer">
                <Input disabled value={autoPlaceholder} readOnly />
              </Form.Item>
            </div>

            <div
              className={`rounded-3xl border px-5 py-5 shadow-sm space-y-4 ${
                isDarkMode
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold m-0">Validation</p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Control whether the answer is mandatory.
                  </p>
                </div>
                <Form.Item name="isRequired" valuePropName="checked" noStyle>
                  <Switch disabled={isSubmitting} />
                </Form.Item>
              </div>
              {needsOptions && (
                <div className="rounded-2xl border border-dashed px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="m-0 text-sm font-semibold">Choices</p>
                      <p
                        className={`m-0 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Add the answers respondents can pick.
                      </p>
                    </div>
                    <Tag>{lockedOptions ? "Preset" : "Custom"}</Tag>
                  </div>
                  {lockedOptions ? (
                    <div
                      className={`mt-3 rounded-xl border px-3 py-3 ${
                        isDarkMode
                          ? "border-slate-700 bg-slate-900/40"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <Typography.Text type="secondary">
                        This field ships with predefined Yes / No answers.
                      </Typography.Text>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {lockedOptions.map((option) => (
                          <Tag key={option.value}>{option.label}</Tag>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Form.List
                      name="options"
                      rules={[
                        {
                          validator: async (
                            _: unknown,
                            options?: OptionFormValue[],
                          ) => {
                            if (!options || options.length < MIN_OPTION_COUNT) {
                              return Promise.reject(
                                new Error("Add at least two options."),
                              );
                            }
                            if (
                              options.some((option) => !option?.label?.trim())
                            ) {
                              return Promise.reject(
                                new Error("Option labels cannot be empty."),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {(fields, { add, remove }) => (
                        <div className="mt-3 space-y-3">
                          {fields.map((field, index) => (
                            <Space
                              key={field.key}
                              className="flex w-full"
                              align="baseline"
                            >
                              <Form.Item
                                {...field}
                                name={[field.name, "label"]}
                                // fieldKey={[field.fieldKey, "label"]}
                                className="flex-1"
                                rules={[
                                  {
                                    required: true,
                                    message: "Label is required",
                                  },
                                ]}
                              >
                                <Input
                                  placeholder={`Option ${index + 1} label`}
                                  disabled={isSubmitting}
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "value"]}
                                // fieldKey={[field.fieldKey, "value"]}
                                className="flex-1"
                              >
                                <Input
                                  placeholder="Value (optional)"
                                  disabled={isSubmitting}
                                />
                              </Form.Item>
                              <Button
                                aria-label="Remove option"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(field.name)}
                                disabled={
                                  isSubmitting ||
                                  fields.length <= MIN_OPTION_COUNT
                                }
                              />
                            </Space>
                          ))}
                          <Button
                            className="w-full"
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() =>
                              add({
                                label: `Option ${fields.length + 1}`,
                                value: `option_${fields.length + 1}`,
                              })
                            }
                            disabled={isSubmitting}
                          >
                            Add option
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddContentModal;

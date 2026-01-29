"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  Typography,
  Tag,
  Upload,
  Image as AntdImage,
  Divider,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
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
} from "@ant-design/icons";
import {
  FieldWithLogicResponseEntity,
  UpdateFieldCommand,
  UpdateFieldResponseEntity,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { getBase64 } from "EduSmart/utils/commonFunction";

type OptionFormValue = {
  id?: string | null;
  label?: string;
  value?: string;
};

type EditFieldFormValues = {
  title?: string;
  description?: string;
  isRequired?: boolean;
  options?: OptionFormValue[];
};

type EditFieldModalProps = {
  open: boolean;
  field: FieldWithLogicResponseEntity | null;
  onClose: () => void;
  onUpdated?: (field: UpdateFieldResponseEntity) => void | Promise<void>;
};

const getFieldIcon = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email")) return <MailOutlined />;
  if (normalized.includes("phone")) return <PhoneOutlined />;
  if (normalized.includes("datetime")) return <CalendarOutlined />;
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
  if (normalized.includes("multiselect")) return <AppstoreOutlined />;
  if (normalized.includes("select")) return <FormOutlined />;
  if (normalized.includes("textarea")) return <FileTextOutlined />;
  return <BarsOutlined />;
};

const getFieldTypeLabel = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email")) return "Email";
  if (normalized.includes("phone")) return "Phone";
  if (normalized.includes("datetime")) return "Date & Time";
  if (normalized.includes("date")) return "Date";
  if (normalized.includes("time")) return "Time";
  if (normalized.includes("number")) return "Number";
  if (normalized.includes("rating")) return "Rating";
  if (normalized.includes("scale")) return "Scale";
  if (normalized.includes("file")) return "File Upload";
  if (normalized.includes("checkbox")) return "Checkbox";
  if (normalized.includes("yesno")) return "Yes/No";
  if (normalized.includes("radio")) return "Multiple Choice";
  if (normalized.includes("multiselect")) return "Multi Select";
  if (normalized.includes("select")) return "Dropdown";
  if (normalized.includes("textarea")) return "Long Text";
  return "Short Text";
};

const needsOptions = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  return (
    normalized.includes("select") ||
    normalized.includes("checkbox") ||
    normalized.includes("radio") ||
    normalized.includes("yesno")
  );
};

const isLockedOptions = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  return normalized.includes("yesno");
};

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

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  open,
  field,
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm<EditFieldFormValues>();
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const messageApi = useNotification();
  const updateField = useFormsStore((state) => state.updateField);

  const hasOptions = useMemo(() => needsOptions(field?.type), [field?.type]);
  const lockedOpts = useMemo(() => isLockedOptions(field?.type), [field?.type]);

  const resetFormValues = useCallback(() => {
    if (!field) return;
    const options =
      field.options?.map((opt) => ({
        id: opt.id,
        label: opt.label ?? "",
        value: opt.value ?? "",
      })) ?? [];
    form.setFieldsValue({
      title: field.title ?? "",
      description: field.description ?? "",
      isRequired: field.isRequired ?? false,
      options: options.length > 0 ? options : [{ label: "", value: "" }],
    });
    setImageUrl(field.imageUrl ?? null);
    if (field.imageUrl) {
      setImageFileList([
        {
          uid: "-1",
          name: "image",
          status: "done",
          url: field.imageUrl,
        },
      ]);
    } else {
      setImageFileList([]);
    }
  }, [field, form]);

  useEffect(() => {
    if (open && field) {
      resetFormValues();
    }
  }, [open, field, resetFormValues]);

  const handleCancel = () => {
    onClose();
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!field?.id) {
        messageApi.error("Field ID is missing.");
        return;
      }
      setIsSubmitting(true);

      const optionsPayload = hasOptions
        ? (values.options ?? []).map((option, index) => ({
            id: option?.id ?? null,
            label: option?.label?.trim() || `Option ${index + 1}`,
            value: normalizeOptionValue(option?.label, option?.value, index),
          }))
        : undefined;

      const payload: UpdateFieldCommand = {
        fieldId: field.id,
        title: values.title?.trim() ?? "",
        description: values.description?.trim() || null,
        imageUrl: imageUrl,
        isRequired: Boolean(values.isRequired),
        options: optionsPayload,
      };

      const response = await updateField(payload);
      if (!response) {
        messageApi.error("Failed to update question. Please try again.");
        return;
      }

      messageApi.success("Question updated successfully.");
      onClose();
      if (onUpdated) {
        await onUpdated(response);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error && "errorFields" in error) {
        return;
      }
      console.error("update field error", error);
      messageApi.error("Failed to update question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4">
      <PlusOutlined />
      <div className="mt-2 text-sm">Upload Image</div>
    </div>
  );

  if (!field) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isDarkMode
                ? "bg-violet-500/20 text-violet-300"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            {getFieldIcon(field.type)}
          </div>
          <div>
            <span className="text-lg font-semibold">Edit Question</span>
            <Tag color="purple" className="ml-2">
              {getFieldTypeLabel(field.type)}
            </Tag>
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={640}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Question Title"
          rules={[{ required: true, message: "Please enter a question title" }]}
        >
          <Input placeholder="Enter your question" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Description (optional)">
          <Input.TextArea
            placeholder="Add a description or helper text"
            rows={2}
          />
        </Form.Item>

        <Form.Item label="Question Image (optional)">
          <div className="flex flex-col gap-3">
            {imageUrl ? (
              <div className="relative inline-block">
                <AntdImage
                  src={imageUrl}
                  alt="Question image"
                  width={200}
                  height={150}
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
              >
                {imageFileList.length === 0 && uploadButton}
              </Upload>
            )}
            <Typography.Text type="secondary" className="text-xs">
              <PictureOutlined className="mr-1" />
              Upload an image to display with your question (optional)
            </Typography.Text>
          </div>
        </Form.Item>

        <Form.Item
          name="isRequired"
          valuePropName="checked"
          label="Required Field"
        >
          <Switch />
        </Form.Item>

        {hasOptions && (
          <>
            <Divider />
            <div className="mb-4">
              <Typography.Text strong>Options</Typography.Text>
              {lockedOpts && (
                <Tag color="orange" className="ml-2">
                  Locked (Yes/No)
                </Tag>
              )}
            </div>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div className="space-y-2">
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} className="flex items-center gap-2">
                      <Form.Item
                        {...restField}
                        name={[name, "label"]}
                        className="mb-0 flex-1"
                        rules={[
                          { required: true, message: "Enter option label" },
                        ]}
                      >
                        <Input
                          placeholder={`Option ${index + 1}`}
                          disabled={lockedOpts}
                        />
                      </Form.Item>
                      {!lockedOpts && fields.length > 2 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )}
                    </div>
                  ))}
                  {!lockedOpts && (
                    <Button
                      type="dashed"
                      onClick={() => add({ label: "", value: "" })}
                      icon={<PlusOutlined />}
                      block
                    >
                      Add Option
                    </Button>
                  )}
                </div>
              )}
            </Form.List>
          </>
        )}

        <Divider />

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            style={{ backgroundColor: "#6B46C1" }}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditFieldModal;

"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Button,
  Typography,
  Tag,
  Divider,
  ColorPicker,
  Select,
  Tooltip,
} from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import {
  FieldWithLogicResponseEntity,
  UpdateFieldCommand,
  UpdateFieldResponseEntity,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";

// Design Properties Types
type FontFamily =
  | "inter"
  | "roboto"
  | "poppins"
  | "open-sans"
  | "montserrat"
  | "lato";
type TextAlign = "left" | "center" | "right";

type DesignProperties = {
  fontFamily: FontFamily;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  textColor: string;
  textAlign: TextAlign;
};

const DEFAULT_DESIGN: DesignProperties = {
  fontFamily: "inter",
  isBold: false,
  isItalic: false,
  isUnderlined: false,
  textColor: "#000000",
  textAlign: "left",
};

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "open-sans", label: "Open Sans" },
  { value: "montserrat", label: "Montserrat" },
  { value: "lato", label: "Lato" },
];

type DesignFieldModalProps = {
  open: boolean;
  field: FieldWithLogicResponseEntity | null;
  onClose: () => void;
  onUpdated?: (field: UpdateFieldResponseEntity) => void | Promise<void>;
};

export const DesignFieldModal: React.FC<DesignFieldModalProps> = ({
  open,
  field,
  onClose,
  onUpdated,
}) => {
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [designProps, setDesignProps] =
    useState<DesignProperties>(DEFAULT_DESIGN);
  const messageApi = useNotification();
  const updateField = useFormsStore((state) => state.updateField);

  const resetDesignValues = useCallback(() => {
    if (!field) return;
    // Load design properties from field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldProps = field.properties as any;
    if (fieldProps?.design) {
      setDesignProps({
        fontFamily: fieldProps.design.fontFamily ?? DEFAULT_DESIGN.fontFamily,
        isBold: fieldProps.design.isBold ?? DEFAULT_DESIGN.isBold,
        isItalic: fieldProps.design.isItalic ?? DEFAULT_DESIGN.isItalic,
        isUnderlined:
          fieldProps.design.isUnderlined ?? DEFAULT_DESIGN.isUnderlined,
        textColor: fieldProps.design.textColor ?? DEFAULT_DESIGN.textColor,
        textAlign: fieldProps.design.textAlign ?? DEFAULT_DESIGN.textAlign,
      });
    } else {
      setDesignProps(DEFAULT_DESIGN);
    }
  }, [field]);

  useEffect(() => {
    if (open && field) {
      resetDesignValues();
    }
  }, [open, field, resetDesignValues]);

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    try {
      if (!field?.id) {
        messageApi.error("Field ID is missing.");
        return;
      }
      setIsSubmitting(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingProps = (field.properties as any) ?? {};
      const propertiesPayload = {
        ...existingProps,
        design: designProps,
      };

      const payload: UpdateFieldCommand = {
        fieldId: field.id,
        title: field.title ?? "",
        description: field.description ?? null,
        imageUrl: field.imageUrl ?? null,
        isRequired: field.isRequired ?? false,
        properties: propertiesPayload,
      };

      const response = await updateField(payload);
      if (!response) {
        messageApi.error("Failed to update design. Please try again.");
        return;
      }

      messageApi.success("Design updated successfully.");
      onClose();
      if (onUpdated) {
        await onUpdated(response);
      }
    } catch (error: unknown) {
      console.error("update design error", error);
      messageApi.error("Failed to update design. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!field) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isDarkMode
                ? "bg-amber-500/20 text-amber-300"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <BgColorsOutlined className="text-lg" />
          </div>
          <div>
            <span className="text-lg font-semibold">Design Question</span>
            <Tag className="ml-2 !bg-amber-500/20 !text-amber-300 !border-amber-500/30">
              Styling
            </Tag>
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
      destroyOnClose
    >
      <div className="mt-4">
        {/* Current Question Preview */}
        <div
          className={`mb-6 p-4 rounded-xl border ${
            isDarkMode
              ? "border-amber-800/30 bg-amber-950/30"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <Typography.Text
            type="secondary"
            className="text-xs uppercase tracking-wide"
          >
            Editing design for:
          </Typography.Text>
          <div
            className={`mt-2 font-medium ${
              isDarkMode ? "text-white" : "text-amber-900"
            }`}
          >
            {field.title || "Untitled Question"}
          </div>
        </div>

        {/* Font Family */}
        <div className="mb-5">
          <label
            className={`flex items-center gap-2 text-sm font-medium mb-2 ${
              isDarkMode ? "text-amber-200" : "text-amber-700"
            }`}
          >
            <FontSizeOutlined className="text-amber-500" />
            Font Family
          </label>
          <Select
            value={designProps.fontFamily}
            onChange={(value) =>
              setDesignProps((prev) => ({ ...prev, fontFamily: value }))
            }
            className="w-full"
            disabled={isSubmitting}
            options={FONT_OPTIONS}
            size="large"
          />
        </div>

        {/* Font Style Toggles */}
        <div className="mb-5">
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-amber-200" : "text-amber-700"
            }`}
          >
            Font Style
          </label>
          <div className="flex gap-2">
            <Tooltip title="Bold">
              <Button
                type={designProps.isBold ? "primary" : "default"}
                icon={<BoldOutlined />}
                size="large"
                onClick={() =>
                  setDesignProps((prev) => ({
                    ...prev,
                    isBold: !prev.isBold,
                  }))
                }
                disabled={isSubmitting}
                className={
                  designProps.isBold
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    : ""
                }
              />
            </Tooltip>
            <Tooltip title="Italic">
              <Button
                type={designProps.isItalic ? "primary" : "default"}
                icon={<ItalicOutlined />}
                size="large"
                onClick={() =>
                  setDesignProps((prev) => ({
                    ...prev,
                    isItalic: !prev.isItalic,
                  }))
                }
                disabled={isSubmitting}
                className={
                  designProps.isItalic
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    : ""
                }
              />
            </Tooltip>
            <Tooltip title="Underline">
              <Button
                type={designProps.isUnderlined ? "primary" : "default"}
                icon={<UnderlineOutlined />}
                size="large"
                onClick={() =>
                  setDesignProps((prev) => ({
                    ...prev,
                    isUnderlined: !prev.isUnderlined,
                  }))
                }
                disabled={isSubmitting}
                className={
                  designProps.isUnderlined
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    : ""
                }
              />
            </Tooltip>
          </div>
        </div>

        {/* Text Color */}
        <div className="mb-5">
          <label
            className={`flex items-center gap-2 text-sm font-medium mb-2 ${
              isDarkMode ? "text-amber-200" : "text-amber-700"
            }`}
          >
            <FontColorsOutlined className="text-amber-500" />
            Text Color
          </label>
          <ColorPicker
            value={designProps.textColor}
            onChange={(color) =>
              setDesignProps((prev) => ({
                ...prev,
                textColor: color.toHexString(),
              }))
            }
            disabled={isSubmitting}
            showText
            size="large"
            presets={[
              {
                label: "Recommended",
                colors: [
                  "#000000",
                  "#1F2937",
                  "#374151",
                  "#6B7280",
                  "#9CA3AF",
                  "#EF4444",
                  "#F97316",
                  "#F59E0B",
                  "#10B981",
                  "#3B82F6",
                  "#6366F1",
                  "#8B5CF6",
                ],
              },
            ]}
          />
        </div>

        {/* Text Alignment */}
        <div className="mb-5">
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-amber-200" : "text-amber-700"
            }`}
          >
            Text Alignment
          </label>
          <div className="flex gap-2">
            <Tooltip title="Align Left">
              <Button
                type={designProps.textAlign === "left" ? "primary" : "default"}
                icon={<AlignLeftOutlined />}
                size="large"
                onClick={() =>
                  setDesignProps((prev) => ({ ...prev, textAlign: "left" }))
                }
                disabled={isSubmitting}
                className={
                  designProps.textAlign === "left"
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    : ""
                }
              />
            </Tooltip>
            <Tooltip title="Align Center">
              <Button
                type={
                  designProps.textAlign === "center" ? "primary" : "default"
                }
                icon={<AlignCenterOutlined />}
                size="large"
                onClick={() =>
                  setDesignProps((prev) => ({ ...prev, textAlign: "center" }))
                }
                disabled={isSubmitting}
                className={
                  designProps.textAlign === "center"
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    : ""
                }
              />
            </Tooltip>
            <Tooltip title="Align Right">
              <Button
                type={designProps.textAlign === "right" ? "primary" : "default"}
                icon={<AlignRightOutlined />}
                size="large"
                onClick={() =>
                  setDesignProps((prev) => ({ ...prev, textAlign: "right" }))
                }
                disabled={isSubmitting}
                className={
                  designProps.textAlign === "right"
                    ? "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                    : ""
                }
              />
            </Tooltip>
          </div>
        </div>

        {/* Preview */}
        <Divider className="my-5" />
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-amber-200" : "text-amber-700"
            }`}
          >
            Preview
          </label>
          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "border-amber-800/30 bg-amber-950/30"
                : "border-amber-200 bg-amber-50"
            }`}
            style={{
              fontFamily: designProps.fontFamily,
              fontWeight: designProps.isBold ? "bold" : "normal",
              fontStyle: designProps.isItalic ? "italic" : "normal",
              textDecoration: designProps.isUnderlined ? "underline" : "none",
              color: designProps.textColor,
              textAlign: designProps.textAlign,
            }}
          >
            <div className="text-lg">
              {field.title || "Your question will appear like this"}
            </div>
            {field.description && (
              <div className="text-sm mt-2 opacity-70">{field.description}</div>
            )}
          </div>
        </div>

        <Divider className="my-5" />

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            size="large"
            className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
          >
            Save Design
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DesignFieldModal;

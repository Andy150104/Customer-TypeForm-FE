"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Typography } from "antd";
import { FormOutlined } from "@ant-design/icons";
import {
  FormResponseEntity,
  UpdateFormCommand,
  UpdateFormResponseEntity,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";

type EditFormFormValues = {
  title?: string;
};

type EditFormModalProps = {
  open: boolean;
  form: FormResponseEntity | null;
  onClose: () => void;
  onUpdated?: (form: UpdateFormResponseEntity) => void | Promise<void>;
};

export const EditFormModal: React.FC<EditFormModalProps> = ({
  open,
  form: formData,
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm<EditFormFormValues>();
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageApi = useNotification();
  const updateForm = useFormsStore((state) => state.updateForm);

  useEffect(() => {
    if (open && formData) {
      form.setFieldsValue({
        title: formData.title ?? "",
      });
    }
  }, [open, formData, form]);

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!formData?.id) {
        messageApi.error("Form ID is missing.");
        return;
      }
      setIsSubmitting(true);

      const payload: UpdateFormCommand = {
        formId: formData.id,
        title: values.title?.trim() ?? "",
      };

      const response = await updateForm(payload);
      if (!response) {
        messageApi.error("Failed to update form. Please try again.");
        return;
      }

      messageApi.success("Form updated successfully.");
      onClose();
      if (onUpdated) {
        await onUpdated(response);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error && "errorFields" in error) {
        return;
      }
      console.error("update form error", error);
      messageApi.error("Failed to update form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return null;

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
            <FormOutlined />
          </div>
          <div>
            <span className="text-lg font-semibold">Edit Form</span>
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Save Changes"
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      okButtonProps={{
        className:
          "bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1]",
      }}
      width={480}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="title"
          label="Form Title"
          rules={[
            { required: true, message: "Please enter a form title" },
            { max: 200, message: "Title is too long" },
          ]}
        >
          <Input placeholder="Enter form title" size="large" />
        </Form.Item>

        <Typography.Text type="secondary" className="text-xs">
          The form title will be displayed at the top of the form and in your
          workspace.
        </Typography.Text>
      </Form>
    </Modal>
  );
};

export default EditFormModal;

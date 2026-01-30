"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";

type CreateFormFormValues = {
  title?: string;
};

type CreateFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateFormModal: React.FC<CreateFormModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm<CreateFormFormValues>();
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageApi = useNotification();
  const createForm = useFormsStore((state) => state.createForm);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        title: "",
      });
    }
  }, [open, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const title = values.title?.trim() || "Form mới";
      const newForm = await createForm({ title });

      if (!newForm) {
        messageApi.error("Tạo form thất bại. Vui lòng thử lại.");
        return;
      }

      messageApi.success("Tạo form thành công!");
      onClose();
      router.push(`/form/${newForm.id}/edit`);
    } catch (error: unknown) {
      if (typeof error === "object" && error && "errorFields" in error) {
        return;
      }
      console.error("create form error", error);
      messageApi.error("Tạo form thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <PlusOutlined />
          </div>
          <div>
            <span
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Tạo form mới
            </span>
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Tạo form"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      okButtonProps={{
        className:
          "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600",
      }}
      cancelButtonProps={{
        className: isDarkMode
          ? "!border-gray-600 !text-gray-300 hover:!border-gray-500"
          : "",
      }}
      width={480}
      destroyOnClose
      className={isDarkMode ? "dark-modal" : ""}
      styles={{
        content: {
          backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
          borderRadius: "16px",
        },
        header: {
          backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
          borderBottom: isDarkMode
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.06)",
        },
        body: {
          backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
        },
        footer: {
          backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
          borderTop: isDarkMode
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.06)",
        },
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="title"
          label={
            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
              Tên form
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng nhập tên form" },
            { max: 200, message: "Tên form quá dài" },
          ]}
        >
          <Input
            placeholder="Nhập tên form của bạn"
            size="large"
            className={
              isDarkMode
                ? "!bg-gray-800 !border-gray-600 !text-white placeholder:!text-gray-500"
                : ""
            }
            autoFocus
          />
        </Form.Item>

        <Typography.Text
          type="secondary"
          className={`text-xs ${isDarkMode ? "!text-gray-400" : ""}`}
        >
          Tên form sẽ hiển thị ở đầu form và trong danh sách biểu mẫu của bạn.
        </Typography.Text>
      </Form>
    </Modal>
  );
};

export default CreateFormModal;

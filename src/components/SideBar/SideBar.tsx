"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";
import {
  FileTextOutlined,
  LogoutOutlined,
  PlusOutlined,
  FolderOutlined,
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  BellOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Layout, theme, Button, Input, Divider, Modal, Form, Grid } from "antd";
import imageEmoLogo from "EduSmart/assets/Logo.png";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { ThemeSwitch } from "../Themes/Theme";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";
import { UserTitle } from "./UserTitle";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";

const { Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

interface CSSVarProperties extends CSSProperties {
  "--ant-primary-color"?: string;
}

type NavMenuItem = {
  label: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  children?: NavMenuItem[];
  path?: string;
};

const getItem = (
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: NavMenuItem[],
  path?: string,
): NavMenuItem => ({ label, key, icon, children, path });

// Menu items cho form management
const navItems: NavMenuItem[] = [
  getItem("My Forms", "forms", <FileTextOutlined />, undefined, "/form"),
  getItem("Templates", "templates", <FolderOutlined />, undefined, "/templates"),
  getItem("Analytics", "analytics", <BarChartOutlined />, undefined, "/analytics"),
  getItem("Contacts", "contacts", <TeamOutlined />, undefined, "/contacts"),
  getItem("Notifications", "notifications", <BellOutlined />, undefined, "/notifications"),
  getItem("Settings", "settings", <SettingOutlined />, undefined, "/settings"),
  getItem("Logout", "logout", <LogoutOutlined />),
];

/* ---------- HELPERS ---------- */
function flatten(items: NavMenuItem[], acc: Record<string, string> = {}) {
  for (const it of items) {
    if (it.path) acc[it.key] = it.path;
    if (it.children) flatten(it.children, acc);
  }
  return acc;
}
const keyPathMap = flatten(navItems);

const pathKeyMap = Object.entries(keyPathMap).reduce<Record<string, string>>(
  (m, [k, p]) => ((m[p] = k), m),
  {},
);

function getSelectedKeys(pathname: string): string[] {
  if (pathKeyMap[pathname]) return [pathKeyMap[pathname]];
  let matchKey = "";
  let matchLen = -1;
  for (const [k, p] of Object.entries(keyPathMap)) {
    if (pathname.startsWith(p) && p.length > matchLen) {
      matchKey = k;
      matchLen = p.length;
    }
  }
  return matchKey ? [matchKey] : [];
}

const toAntdItems = (items: NavMenuItem[]): MenuItem[] =>
  items.map((it) => ({
    key: it.key,
    icon: it.icon,
    label: it.label,
    children: it.children ? toAntdItems(it.children) : undefined,
  })) as MenuItem[];

/* ---------- COMPONENT ---------- */
interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  menuItems?: NavMenuItem[];
  defaultSelectedKeys?: string[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onCollapse,
  menuItems = navItems,
  defaultSelectedKeys,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { isDarkMode } = useTheme();
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const siderWidth = isMobile ? "100%" : 280;
  const messageApi = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { createForm } = useFormsStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: collapsed ? 80 : 280 }} />;

  const siderStyle: CSSVarProperties = {
    backgroundColor: isDarkMode ? "#0b1220" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    "--ant-primary-color": colorPrimary,
    backgroundImage: isDarkMode
      ? "linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 45%), radial-gradient(circle at 20% 8%, rgba(124, 58, 237, 0.18) 0%, transparent 55%)"
      : "linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 45%), radial-gradient(circle at 20% 8%, rgba(168, 85, 247, 0.12) 0%, transparent 55%)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%, 240px 240px",
  };
  const siderClassName = `flex min-h-screen flex-col relative overflow-hidden border-r shadow-sm ${
    isDarkMode ? "border-gray-800" : "border-gray-200"
  }`;

  const antItems = toAntdItems(menuItems);
  const selectedKeys = defaultSelectedKeys ?? getSelectedKeys(pathname);

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      const { showLoading, hideLoading } = useLoadingStore.getState();
      showLoading();
      await logout();
      messageApi.success("Đăng xuất thành công!");
      await hideLoading();
      useAuthStore.persist.clearStorage();
      router.push("/Login");
      return;
    }
    const path = keyPathMap[key];
    if (path) router.push(path);
  };

  const handleCreateForm = async () => {
    try {
      const values = await form.validateFields();
      const newForm = await createForm({ title: values.title });
      if (newForm) {
        messageApi.success("Tạo form thành công!");
        setIsModalOpen(false);
        form.resetFields();
        // Navigate to form editor if needed
        // router.push(`/forms/${newForm.id}`);
      } else {
        messageApi.error("Tạo form thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Create form error:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const createFormModal = (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDarkMode
                ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                : "bg-gradient-to-br from-purple-100 to-blue-100"
            }`}
          >
            <FileTextOutlined
              className={`text-lg ${
                isDarkMode ? "text-purple-400" : "text-purple-600"
              }`}
            />
          </div>
          <div>
            <h3
              className={`m-0 text-lg font-semibold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Create New Form
            </h3>
            <p
              className={`m-0 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Give your form a name to get started
            </p>
          </div>
        </div>
      }
      open={isModalOpen}
      width={isMobile ? "100vw" : undefined}
      style={isMobile ? { top: 0, margin: 0, paddingBottom: 0 } : undefined}
      onOk={handleCreateForm}
      onCancel={handleCancel}
      okText="Create Form"
      cancelText="Cancel"
      okButtonProps={{
        className: "bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1]",
        size: "large",
      }}
      cancelButtonProps={{
        size: "large",
      }}
      className="create-form-modal"
      styles={{
        content: {
          backgroundColor: isDarkMode ? "#0b1220" : "#ffffff",
          ...(isMobile
            ? {
                height: "100vh",
                borderRadius: 0,
                display: "flex",
                flexDirection: "column",
              }
            : {}),
        },
        header: {
          backgroundColor: isDarkMode ? "#0b1220" : "#ffffff",
          borderBottom: isDarkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
          padding: "24px",
        },
        body: {
          backgroundColor: isDarkMode ? "#0b1220" : "#ffffff",
          padding: "24px",
          ...(isMobile ? { flex: "1 1 auto", overflow: "auto" } : {}),
        },
        footer: {
          backgroundColor: isDarkMode ? "#0b1220" : "#ffffff",
          borderTop: isDarkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
          padding: "16px 24px",
        },
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="title"
          label={
            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
              Form Title
            </span>
          }
          rules={[
            { required: true, message: "Please enter a form title" },
            { max: 100, message: "Title must be less than 100 characters" },
          ]}
        >
          <Input
            placeholder="e.g., Course Feedback Survey"
            size="large"
            className={`rounded-lg ${
              isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
            }`}
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  if (collapsed) {
    // Collapsed view - chỉ hiển thị icons
    return (
      <Sider
        style={siderStyle}
        className={siderClassName}
        breakpoint="md"
        collapsedWidth={80}
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        width={siderWidth}
        trigger={null}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center py-4">
            <Image
              src={imageEmoLogo}
              alt="EduSmart Logo"
              width={32}
              height={32}
              priority
              placeholder="empty"
              className="object-cover rounded"
            />
          </div>

          {/* Create button - chỉ icon khi collapsed */}
          <div className="px-2 mb-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              block
              className="h-10 bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1]"
              onClick={() => setIsModalOpen(true)}
            />
          </div>

          {/* Menu - chỉ icons */}
          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            inlineCollapsed={collapsed}
            items={antItems}
            selectedKeys={selectedKeys}
            onClick={handleMenuClick}
            className="admin-sidebar-menu border-none bg-transparent"
            style={{
              flex: 1,
              marginTop: 8,
              background: "transparent",
            }}
          />

          {/* Theme switch */}
          <div className="px-2 pb-2">
            <div className="flex justify-center">
              <ThemeSwitch />
            </div>
          </div>

          {/* User info */}
          <div
            className={`px-2 py-2 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <UserTitle collapsed={collapsed} />
          </div>
        </div>
        {createFormModal}
      </Sider>
    );
  }

  // Expanded view - layout mới theo design
  return (
    <Sider
      style={siderStyle}
      className={siderClassName}
      breakpoint="md"
      collapsedWidth={80}
      collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        width={siderWidth}
        trigger={null}
      >
        <div className="flex h-full min-h-0 flex-col p-4">
          <div className="relative flex w-full items-center gap-3 mb-4 px-1 pr-12">
            <Image
              src={imageEmoLogo}
              alt="Uniwrap Logo"
              width={36}
              height={36}
              priority
              placeholder="empty"
              className="object-cover rounded-md"
            />
            <div className="leading-tight">
              <p
                className={`m-0 text-sm font-semibold tracking-[0.18em] uppercase ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}
              >
                uniwrap
              </p>
              <p
                className={`m-0 text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Workspace
              </p>
            </div>
            {isMobile && (
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => onCollapse(true)}
                style={{ position: "absolute", right: 0, top: 0 }}
                className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                  isDarkMode
                    ? "border-white/20 text-gray-200 hover:bg-white/10"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Close sidebar"
              />
            )}
          </div>
        {/* Create a new form button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size="large"
          className="h-11 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] font-medium mb-4"
          onClick={() => setIsModalOpen(true)}
        >
          Create a new form
        </Button>

        <Divider className="my-4" />

        {/* Navigation Menu */}
        <div className="flex-1 overflow-auto">
          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            inlineCollapsed={collapsed}
            items={antItems}
            selectedKeys={selectedKeys}
            onClick={handleMenuClick}
            className="admin-sidebar-menu border-none bg-transparent"
            style={{
              flex: 1,
              background: "transparent",
            }}
          />
        </div>

        {/* Theme Switch */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700">
          <ThemeSwitch />
        </div>

        {/* User Title */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700">
          <UserTitle collapsed={collapsed} />
        </div>
      </div>

      {createFormModal}
    </Sider>
  );
};

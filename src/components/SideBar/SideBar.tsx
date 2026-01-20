"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";
import {
  FileTextOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  FolderOutlined,
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  BellOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Layout, theme, Button, Input, Divider } from "antd";
import imageEmoLogo from "EduSmart/assets/Logo.png";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { ThemeSwitch } from "../Themes/Theme";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";
import { UserTitle } from "./UserTitle";

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
  getItem("My Forms", "forms", <FileTextOutlined />, undefined, "/home"),
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
  const { isDarkMode } = useTheme();
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const messageApi = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

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
        width={280}
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
              onClick={() => {
                // Handle create form
              }}
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
      width={280}
      trigger={null}
    >
      <div className="flex h-full min-h-0 flex-col p-4">
        <div className="flex items-center gap-3 mb-4 px-1">
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
        </div>
        {/* Create a new form button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size="large"
          className="h-11 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] font-medium mb-4"
          onClick={() => {
            // Handle create form
          }}
        >
          Create a new form
        </Button>

        <Divider className="my-4" />

        {/* Search bar */}
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className={isDarkMode ? "text-gray-500" : "text-gray-400"} />}
          className={`rounded-lg mb-4 ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}
        />

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
    </Sider>
  );
};

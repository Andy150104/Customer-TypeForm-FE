"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";
import { Lobster } from "next/font/google";
import {
  PieChartOutlined,
  LogoutOutlined,
  UserOutlined,
  RobotOutlined,
  ShoppingOutlined,
  BookOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Layout, theme } from "antd";
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

const lobster = Lobster({ weight: "400", subsets: ["latin"] });

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

const navItems: NavMenuItem[] = [
  getItem(
    "Lộ trình học tập",
    "dashboard",
    <PieChartOutlined />,
    undefined,
    "/dashboard/learning-paths",
  ),
  getItem(
    "Khóa học của tôi",
    "dashboard-my-courses",
    <BookOutlined />,
    undefined,
    "/dashboard/my-courses",
  ),
  getItem(
    "Khóa học yêu thích",
    "dashboard-wishlist",
    <HeartOutlined />,
    undefined,
    "/dashboard/wishlist",
  ),
  getItem(
    "Hồ sơ của tôi",
    "dashboard-my-profile",
    <UserOutlined />,
    undefined,
    "/dashboard/my-profile",
  ),
  getItem(
    "Đơn hàng của tôi",
    "dashboard-orders",
    <ShoppingOutlined />,
    undefined,
    "/dashboard/orders",
  ),
  // getItem(
  //   "Dashboard Người dùng",
  //   "dashboard-user",
  //   <DesktopOutlined />,
  //   undefined,
  //   "/Admin/profiles",
  // ),
  // getItem(
  //   "Subscriptions",
  //   "subscriptions",
  //   <SolutionOutlined />,
  //   undefined,
  //   "/Admin/subscriptions",
  // ),
  getItem("Chat AI", "chat-ai", <RobotOutlined />, undefined, "/chat/ai"),
  getItem("Đăng xuất", "logout", <LogoutOutlined />),
  // ❌ BỎ ThemeSwitch khỏi menu để tránh lệch
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
    token: { colorPrimary, colorBorderSecondary },
  } = theme.useToken();
  const messageApi = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: collapsed ? 80 : 260 }} />;

  const siderStyle: CSSVarProperties = {
    backgroundColor: isDarkMode ? "#021526" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    "--ant-primary-color": colorPrimary,
  };

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

  return (
    <Sider
      style={siderStyle}
      className="flex min-h-screen flex-col"
      breakpoint="md"
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={260}
      trigger={null}
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Logo */}
        <div
          style={{
            height: 48,
            margin: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
          }}
        >
          {collapsed ? (
            <Image
              src={imageEmoLogo}
              alt="EduSmart Logo"
              width={32}
              height={32}
              priority
              placeholder="empty"
              className="object-cover"
            />
          ) : (
            <div
              className={`${lobster.className} text-black dark:text-white text-3xl font-light tracking-widest ml-9 cursor-pointer`}
              onClick={() => router.push("/home")}
            >
              EduSmart
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          items={antItems}
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          style={{
            border: "none",
            background: "transparent",
            marginTop: 16,
            flex: 1,
          }}
        />

        {/* Theme switch: hàng riêng, căn giữa khi collapsed */}
        <div className="px-3 pb-3">
          <div className={`w-full ${collapsed ? "flex justify-center" : ""}`}>
            <ThemeSwitch />
          </div>
        </div>

        {/* Footer info */}
        <div
          className={`px-3 py-3 border-t border-dashed ${
            isDarkMode ? "border-white/10" : ""
          }`}
          style={{ borderColor: isDarkMode ? "" : colorBorderSecondary }}
        >
          <UserTitle collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  );
};

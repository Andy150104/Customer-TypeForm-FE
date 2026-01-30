"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Layout, Breadcrumb, Spin } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AdminSidebar } from "EduSmart/components/SideBar/SideBar";
import Loading from "EduSmart/components/Loading/Loading";
import { FadeInUp } from "EduSmart/components/Animation/FadeInUp";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";
import NotFound from "EduSmart/app/404/page";
import { useSidebarStore } from "EduSmart/stores/SideBar/SideBarStore";
import { GlobalMessage } from "EduSmart/components/Common/Message/GlobalMessage";
import { ThemeSwitch } from "EduSmart/components/Themes/Theme";
import { useTheme } from "EduSmart/Provider/ThemeProvider";

const { Content, Footer } = Layout;

interface BaseScreenAdminProps {
  children: ReactNode;
  menuItems?: React.ComponentProps<typeof AdminSidebar>["menuItems"];
  defaultSelectedKeys?: React.ComponentProps<
    typeof AdminSidebar
  >["defaultSelectedKeys"];
  breadcrumbItems?: { title: string }[];
}

const BaseScreenAdmin: React.FC<BaseScreenAdminProps> = ({
  children,
  menuItems,
  defaultSelectedKeys,
  breadcrumbItems = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const invalid = useValidateStore.getState().inValid;
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const { isDarkMode } = useTheme();
  const toggleIconColor = isDarkMode ? "#ffffff" : "#374151";

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (invalid) return <NotFound />;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-amber-950/80 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    // Body khóa theo viewport, không cho body scroll
    <Layout className="h-screen overflow-hidden">
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        menuItems={menuItems}
        defaultSelectedKeys={defaultSelectedKeys}
      />
      <GlobalMessage />
      {/* Cột phải: flex column */}
      <Layout className="flex flex-col h-screen min-h-0 overflow-hidden">
        <header
          className={`${
            isDarkMode
              ? "bg-amber-950/90"
              : "bg-gradient-to-r from-amber-50 to-orange-50/80"
          } px-6 flex flex-col shadow-sm sticky top-0 z-10 flex-shrink-0 border-b overflow-hidden ${
            isDarkMode ? "border-amber-800/30" : "border-amber-200/60"
          }`}
        >
          {/* Top row: User info and icons */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
                  isDarkMode
                    ? "border-white/50 bg-transparent text-white hover:bg-white/10"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <MenuUnfoldOutlined
                    className="text-lg"
                    style={{ color: toggleIconColor }}
                  />
                ) : (
                  <MenuFoldOutlined
                    className="text-lg"
                    style={{ color: toggleIconColor }}
                  />
                )}
              </button>
              {breadcrumbItems.length === 0 ? (
                <h3
                  className={`m-0 text-lg font-semibold ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  My workspace
                </h3>
              ) : (
                <Breadcrumb
                  items={breadcrumbItems.map((item) => ({ title: item.title }))}
                  className={`text-lg font-bold ${
                    isDarkMode
                      ? "[&_.ant-breadcrumb-link]:text-gray-100"
                      : "[&_.ant-breadcrumb-link]:text-gray-900"
                  }`}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitch />
            </div>
          </div>
        </header>

        <Loading />

        {/* VÙNG CUỘN: wrapper này mới là scroll container */}
        <div
          className={`flex-1 min-h-0 overflow-auto px-6 py-4 relative ${
            isDarkMode ? "bg-amber-950/70" : "bg-amber-50/50"
          }`}
          style={{
            backgroundImage: isDarkMode
              ? "linear-gradient(180deg, #1c1208 0%, #271a0a 45%, #1c1208 100%), radial-gradient(70% 60% at 50% -10%, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(60% 55% at 50% 110%, rgba(251, 146, 60, 0.12) 0%, transparent 65%), linear-gradient(to right, rgba(245, 158, 11, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.05) 1px, transparent 1px)"
              : "linear-gradient(180deg, #fffbeb 0%, #fef3c7 45%, #fffbeb 100%), radial-gradient(70% 60% at 50% -10%, rgba(245, 158, 11, 0.15) 0%, transparent 60%), radial-gradient(60% 55% at 50% 110%, rgba(251, 146, 60, 0.1) 0%, transparent 65%), linear-gradient(to right, rgba(180, 83, 9, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(180, 83, 9, 0.03) 1px, transparent 1px)",
            backgroundSize:
              "100% 100%, 100% 100%, 100% 100%, 56px 56px, 56px 56px",
          }}
        >
          <Content className="p-0">
            <FadeInUp>
              <div className="p-0">{children}</div>
            </FadeInUp>
          </Content>
        </div>

        <Footer
          className={`relative flex items-center justify-center flex-shrink-0 py-4 border-t text-[13px] ${
            isDarkMode
              ? "bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-amber-950/90 border-amber-800/30 text-amber-200/70"
              : "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200/60 text-amber-700/70"
          }`}
        >
          <div
            className={`absolute left-6 right-6 top-0 h-px ${
              isDarkMode
                ? "bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
                : "bg-gradient-to-r from-transparent via-amber-400/25 to-transparent"
            }`}
          />
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                isDarkMode
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-200"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600"
              }`}
            >
              Uniwrap
            </span>
            <span className="opacity-70">©{new Date().getFullYear()}</span>
            <span
              className={`h-1 w-1 rounded-full ${
                isDarkMode ? "bg-amber-300/70" : "bg-amber-500/60"
              }`}
            />
            <span className="opacity-80">
              Được phát triển bởi Nhóm Sinh viên FPT
            </span>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BaseScreenAdmin;

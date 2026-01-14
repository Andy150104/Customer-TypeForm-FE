"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Layout, Breadcrumb, theme, Spin } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AdminSidebar } from "EduSmart/components/SideBar/SideBar";
import Loading from "EduSmart/components/Loading/Loading";
import { FadeInUp } from "EduSmart/components/Animation/FadeInUp";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";
import NotFound from "EduSmart/app/404/page";
import { useSidebarStore } from "EduSmart/stores/SideBar/SideBarStore";
import { GlobalMessage } from "EduSmart/components/Common/Message/GlobalMessage";

const { Header, Content, Footer } = Layout;

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

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (invalid) return <NotFound />;

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colorBgContainer,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    // Body khóa theo viewport, không cho body scroll
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        menuItems={menuItems}
        defaultSelectedKeys={defaultSelectedKeys}
      />
      <GlobalMessage />
      {/* Cột phải: flex column */}
      <Layout
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          minHeight: 0, // cho phép con co lại -> cần để scroll hoạt động
          overflow: "hidden",
        }}
      >
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            flex: "0 0 auto",
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              onClick={() => setCollapsed(false)}
              style={{ fontSize: 20, cursor: "pointer", marginRight: 16 }}
            />
          ) : (
            <MenuFoldOutlined
              onClick={() => setCollapsed(true)}
              style={{ fontSize: 20, cursor: "pointer", marginRight: 16 }}
            />
          )}
          {breadcrumbItems.length === 0 ? (
            <h3 style={{ margin: 0 }}>EduSmart Trang Cho Sinh Viên</h3>
          ) : (
            <Breadcrumb
              items={breadcrumbItems.map((item) => ({ title: item.title }))}
              style={{ margin: 0, fontSize: 18, fontWeight: 700 }}
            />
          )}
        </Header>

        <Loading />

        {/* VÙNG CUỘN: wrapper này mới là scroll container */}
        <div
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            overflow: "auto", // <— đổi từ hidden -> auto
            padding: "16px 24px",
            scrollbarGutter: "stable both-edges",
          }}
        >
          <Content style={{ padding: 0 }}>
            <FadeInUp>
              <div
                className="p-6 rounded-lg"
                style={{
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                {children}
              </div>
            </FadeInUp>
          </Content>
        </div>

        <Footer style={{ textAlign: "center", flex: "0 0 auto" }}>
          Edusmart ©{new Date().getFullYear()} được tạo bởi Nhóm Sinh viên FPT
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BaseScreenAdmin;

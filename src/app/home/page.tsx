"use client";

import React from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { Typography, Card, Row, Col, Button } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  UserAddOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useTheme } from "EduSmart/Provider/ThemeProvider";

const { Title, Text } = Typography;

export default function HomePage() {
  const { isDarkMode } = useTheme();

  return (
    <BaseScreenAdmin>
      <div className="w-full space-y-6">
        {/* Header section */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="space-y-1">
            <Title
              level={2}
              className={`m-0 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              My workspace
            </Title>
            <Text
              className={`block text-sm leading-snug ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Track forms, responses, and team activity in one place.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            className="bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white"
          >
            Invite
          </Button>
        </div>

        {/* View options */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Text
              className={`text-sm font-semibold ${
                isDarkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Templates
            </Text>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
              •
            </span>
            <Text
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Start faster with curated templates.
            </Text>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Text className={isDarkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
              View
            </Text>
            <Button.Group>
            <Button
              className={
                isDarkMode
                  ? "text-gray-300 border-gray-600 hover:border-gray-500"
                  : "text-gray-700 border-gray-300 hover:border-gray-400"
              }
            >
              Date created
            </Button>
            <Button
              type="primary"
              className="bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white"
            >
              List
            </Button>
            <Button
              className={
                isDarkMode
                  ? "text-gray-300 border-gray-600 hover:border-gray-500"
                  : "text-gray-700 border-gray-300 hover:border-gray-400"
              }
            >
              Grid
            </Button>
          </Button.Group>
          </div>
        </div>

        {/* Form templates suggestions */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                  : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
              }`}
              bodyStyle={{ padding: "20px", position: "relative" }}
              actions={[
                <Button
                  key="use"
                  type="default"
                  block
                  className="h-10 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Use this form
                </Button>,
              ]}
            >
              {/* Decorative gradient overlay on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    : "bg-gradient-to-br from-purple-50/80 to-blue-50/80"
                }`}
              />
              
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                      : "bg-gradient-to-br from-purple-100 to-blue-100"
                  }`}
                >
                  <FileTextOutlined
                    className={`text-xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className={`z-20 w-8 h-8 flex items-center justify-center p-0 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close
                  }}
                />
              </div>

              <div className="relative z-10 mt-4">
                <Text
                  strong
                  className={`text-base block mb-2 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Create a Peer review form
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  for group project evaluations.
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                  : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
              }`}
              bodyStyle={{ padding: "20px", position: "relative" }}
              actions={[
                <Button
                  key="use"
                  type="default"
                  block
                  className="h-10 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Use this form
                </Button>,
              ]}
            >
              {/* Decorative gradient overlay on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    : "bg-gradient-to-br from-purple-50/80 to-blue-50/80"
                }`}
              />
              
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                      : "bg-gradient-to-br from-purple-100 to-blue-100"
                  }`}
                >
                  <FileTextOutlined
                    className={`text-xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className={`z-20 w-8 h-8 flex items-center justify-center p-0 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close
                  }}
                />
              </div>

              <div className="relative z-10 mt-4">
                <Text
                  strong
                  className={`text-base block mb-2 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Create an Event feedback form
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  for student-organized activities.
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className={`group rounded-2xl relative overflow-visible cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
                  : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50"
              }`}
              bodyStyle={{ padding: "20px", position: "relative" }}
              actions={[
                <Button
                  key="use"
                  type="default"
                  block
                  className="h-10 rounded-lg bg-[#6B46C1] border-[#6B46C1] hover:bg-[#5B36B1] hover:border-[#5B36B1] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Use this form
                </Button>,
              ]}
            >
              {/* Decorative gradient overlay on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    : "bg-gradient-to-br from-purple-50/80 to-blue-50/80"
                }`}
              />
              
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                      : "bg-gradient-to-br from-purple-100 to-blue-100"
                  }`}
                >
                  <FileTextOutlined
                    className={`text-xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className={`z-20 w-8 h-8 flex items-center justify-center p-0 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close
                  }}
                />
              </div>

              <div className="relative z-10 mt-4">
                <Text
                  strong
                  className={`text-base block mb-2 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Create a Course feedback survey
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  to improve teaching methods and materials.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Forms list */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-slate-100" : "text-slate-800"
                }`}
              >
                Recent forms
              </Text>
              <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
                •
              </span>
              <Text
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Latest updates from your workspace.
              </Text>
            </div>
          </div>
          <div
            className={`rounded-xl border overflow-hidden shadow-md ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            }`}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-900"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <th
                    className={`text-left p-3 font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Form Name
                  </th>
                  <th
                    className={`text-left p-3 font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Responses
                  </th>
                  <th
                    className={`text-left p-3 font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Completion
                  </th>
                  <th
                    className={`text-left p-3 font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Updated
                  </th>
                  <th
                    className={`text-left p-3 font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Integrations
                  </th>
                  <th className="text-right p-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b cursor-pointer transition-all duration-200 ${
                    isDarkMode
                      ? "border-gray-700 hover:bg-purple-500/10 hover:border-purple-500/30"
                      : "border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileTextOutlined className="text-white text-base" />
                      </div>
                      <Text strong className={isDarkMode ? "text-gray-100" : "text-gray-900"}>
                        My new form
                      </Text>
                    </div>
                  </td>
                  <td className="p-4">
                    <Text
                      className={`font-medium ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      1
                    </Text>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode
                          ? "bg-green-500/20 text-green-400"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      20%
                    </span>
                  </td>
                  <td className="p-4">
                    <Text className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                      14 Jan 2026
                    </Text>
                  </td>
                  <td className="p-4">
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      className={`px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                        isDarkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                      }`}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      type="text"
                      className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                        isDarkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                      }`}
                    >
                      ⋯
                    </Button>
                  </td>
                </tr>
                <tr
                  className={`cursor-pointer transition-all duration-200 ${
                    isDarkMode
                      ? "hover:bg-purple-500/10 hover:border-purple-500/30"
                      : "hover:bg-purple-50 hover:border-purple-200"
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileTextOutlined className="text-white text-base" />
                      </div>
                      <Text strong className={isDarkMode ? "text-gray-100" : "text-gray-900"}>
                        My new form
                      </Text>
                    </div>
                  </td>
                  <td className="p-4">
                    <Text className={isDarkMode ? "text-gray-500" : "text-gray-400"}>-</Text>
                  </td>
                  <td className="p-4">
                    <Text className={isDarkMode ? "text-gray-500" : "text-gray-400"}>-</Text>
                  </td>
                  <td className="p-4">
                    <Text className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                      09 Jan 2026
                    </Text>
                  </td>
                  <td className="p-4">
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      className={`px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                        isDarkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                      }`}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      type="text"
                      className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                        isDarkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                      }`}
                    >
                      ⋯
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseScreenAdmin>
  );
}

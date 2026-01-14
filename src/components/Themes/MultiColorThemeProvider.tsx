/**
 * MultiColorThemeProvider - Theme cho Learning Path & các flow liên quan
 *
 * Kế thừa từ AntdThemeProvider và thêm brand colors:
 * - Primary: #49BBBD (Teal) - 75% usage
 * - Accent: Orange-400/500 - 15% usage
 * - Supporting: Purple, Pink, Blue - 10% usage
 *
 * @author [Your Name]
 * @created 2025-01-19
 */

"use client";
import React, { useMemo } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "EduSmart/Provider/ThemeProvider";

interface MultiColorThemeProviderProps {
  children: React.ReactNode;
}

export function MultiColorThemeProvider({
  children,
}: MultiColorThemeProviderProps) {
  const { isDarkMode } = useTheme();

  const theme = useMemo(
    () => ({
      cssVar: true,
      algorithm: isDarkMode
        ? antdTheme.darkAlgorithm
        : antdTheme.defaultAlgorithm,
      token: {
        // === BRAND COLORS (Primary) ===
        colorPrimary: "#49BBBD", // Teal - Main brand color
        colorInfo: "#49BBBD",
        colorLink: "#49BBBD",

        // === ACCENT COLORS ===
        colorSuccess: "#52c41a", // Keep default green for success states
        colorWarning: "#fa8c16", // Orange - Accent color
        colorError: "#ff4d4f", // Keep default red for errors

        // === LAYOUT & SPACING ===
        borderRadius: 8,
        fontSize: 14,

        // === DARK MODE OVERRIDES ===
        ...(isDarkMode
          ? {
              colorBgLayout: "#020712",
              colorBgContainer: "#050D18",
              colorText: "#ffffff",
              colorPrimary: "#5fd4d6", // Lighter teal for dark mode
              colorInfo: "#5fd4d6",
              colorLink: "#5fd4d6",
            }
          : {}),
      },

      components: {
        // Steps component customization
        Steps: {
          colorPrimary: "#49BBBD",
          colorText: isDarkMode ? "#ffffff" : "#1f2937",
        },

        // Radio component customization
        Radio: {
          colorPrimary: "#49BBBD",
        },

        // Checkbox component customization
        Checkbox: {
          colorPrimary: "#49BBBD",
        },

        // Select component customization
        Select: {
          colorPrimary: "#49BBBD",
          colorPrimaryHover: "#3da8aa",
        },

        // Input component customization
        Input: {
          colorPrimary: "#49BBBD",
          activeBorderColor: "#49BBBD",
        },

        // Button component customization
        Button: {
          colorPrimary: "#49BBBD",
          colorPrimaryHover: "#3da8aa",
        },
      },
    }),
    [isDarkMode],
  );

  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}

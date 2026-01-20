import React, { useEffect, useRef, useState } from "react";
import { Button, Tooltip } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../../Provider/ThemeProvider";

// Tùy chỉnh màu nhanh ở đây
const LIGHT_STYLES = [
  "!bg-white",
  "hover:!bg-gray-50",
  "!text-gray-900",
  "!border",
  "!border-gray-300",
  "!shadow-sm",
  "dark:!bg-white",
].join(" ");
const DARK_STYLES = "!bg-[#374151] hover:!bg-[#4B5563] !text-white"; // xám đậm

interface ThemeToggleButtonProps {
  size?: "small" | "middle" | "large";
  showText?: boolean;
  square?: boolean; // nếu true -> bỏ bo tròn luôn
}

export const ThemeSwitch: React.FC<ThemeToggleButtonProps> = ({
  size = "small",
  showText = false,
  square = false,
}) => {
  const { toggleSwitchTheme, isDarkMode, ref } = useTheme();

  const [mounted, setMounted] = useState(false);
  const scrollLockRef = useRef<{
    htmlOverflow: string;
    bodyOverflow: string;
    htmlOverflowX: string;
    htmlOverflowY: string;
    bodyOverflowX: string;
    bodyOverflowY: string;
  } | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);
  if (!mounted) {
    // bạn có thể trả về null, loading spinner, hoặc placeholder ẩn đi
    return null;
  }

  const tooltip = isDarkMode
    ? "Chuyển sang Light mode"
    : "Chuyển sang Dark mode";
  const IconComponent = isDarkMode ? SunOutlined : MoonOutlined;

  const lockScrollbars = () => {
    const html = document.documentElement;
    const body = document.body;
    scrollLockRef.current = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverflowX: html.style.overflowX,
      htmlOverflowY: html.style.overflowY,
      bodyOverflowX: body.style.overflowX,
      bodyOverflowY: body.style.overflowY,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overflowX = "hidden";
    html.style.overflowY = "hidden";
    body.style.overflowX = "hidden";
    body.style.overflowY = "hidden";
  };

  const unlockScrollbars = () => {
    const html = document.documentElement;
    const body = document.body;
    if (!scrollLockRef.current) return;
    html.style.overflow = scrollLockRef.current.htmlOverflow || "";
    body.style.overflow = scrollLockRef.current.bodyOverflow || "";
    html.style.overflowX = scrollLockRef.current.htmlOverflowX || "";
    html.style.overflowY = scrollLockRef.current.htmlOverflowY || "";
    body.style.overflowX = scrollLockRef.current.bodyOverflowX || "";
    body.style.overflowY = scrollLockRef.current.bodyOverflowY || "";
    scrollLockRef.current = null;
  };

  return (
    <Tooltip title={tooltip}>
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        size={size}
        onClick={(e) => {
          e.preventDefault();
          if (scrollTimerRef.current) {
            clearTimeout(scrollTimerRef.current);
          }
          lockScrollbars();
          toggleSwitchTheme();
          scrollTimerRef.current = setTimeout(() => {
            unlockScrollbars();
          }, 700);
        }}
        className={[
          "transition-colors duration-200 !px-4 !py-1",
          square ? "!rounded-none" : "!rounded-md",
          isDarkMode ? DARK_STYLES : LIGHT_STYLES,
        ].join(" ")}
      >
        <IconComponent />
        {showText && (
          <span className="ml-2">{isDarkMode ? "Light" : "Dark"}</span>
        )}
      </Button>
    </Tooltip>
  );
};

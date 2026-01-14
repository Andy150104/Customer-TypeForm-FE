'use client';

import React from "react";
import { Spin } from "antd";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";

const Loading: React.FC = () => {
  const loading = useLoadingStore((state) => state.loading);
  if (!loading) return null;

  return (
    <div
      className="
        fixed inset-0 z-[1000] flex items-center justify-center
        bg-black/20 dark:bg-slate-900/35 backdrop-blur-sm
      "
      role="status"
      aria-live="polite"
    >
      <Spin size="large" />
    </div>
  );
};

export default Loading;

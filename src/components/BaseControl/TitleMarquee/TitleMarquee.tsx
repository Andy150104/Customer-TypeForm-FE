"use client";

import { useEffect } from "react";

const BASE_TITLE = "Uniwrap – Nền tảng tạo form khảo sát chuyên nghiệp";

export default function TitleMarquee() {
  useEffect(() => {
    let i = 0;
    let timer: number;

    const tick = () => {
      document.title = BASE_TITLE.slice(i) + BASE_TITLE.slice(0, i);
      i = (i + 1) % BASE_TITLE.length;
      timer = window.setTimeout(tick, 250); // tốc độ chạy
    };

    tick();

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return null; // không render gì ra UI
}

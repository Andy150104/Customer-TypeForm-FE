"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownMessageProps = {
  text: string;
  /** ms cho mỗi nhịp tăng, <=0 để tắt typing (mặc định 12ms) */
  typingSpeedMs?: number;
  /** số ký tự tăng mỗi nhịp (mặc định 2 để mượt hơn với đoạn dài) */
  step?: number;
  /** click để bỏ qua hiệu ứng và hiện toàn bộ (mặc định true) */
  skipOnClick?: boolean;
};

export default function MarkdownMessage({
  text,
  typingSpeedMs = 12,
  step = 2,
  skipOnClick = true,
}: MarkdownMessageProps) {
  const [shown, setShown] = useState<string>(text);
  const [isTyping, setIsTyping] = useState(false);

  const iRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const endRef = useRef<HTMLSpanElement | null>(null);

  // Khi text đổi → chạy typing
  useEffect(() => {
    // Tắt typing nếu speed <= 0
    if (typingSpeedMs <= 0) {
      setShown(text);
      setIsTyping(false);
      return;
    }

    // Khởi động hiệu ứng
    iRef.current = 0;
    setShown("");
    setIsTyping(true);

    const tick = () => {
      // Tăng theo "step" để ít re-render hơn
      iRef.current += step;
      if (iRef.current >= text.length) {
        setShown(text);
        setIsTyping(false);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      setShown(text.slice(0, iRef.current));
    };

    timerRef.current = window.setInterval(tick, typingSpeedMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, typingSpeedMs, step]);

  // Tự cuộn xuống cuối khi đang gõ
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown]);

  // Bỏ qua hiệu ứng khi click (trừ khi click vào <a>)
  const maybeSkip = (e: React.MouseEvent) => {
    if (!skipOnClick || !isTyping) return;
    const target = e.target as HTMLElement;
    if (target.closest("a")) return; // không skip khi click link
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShown(text);
    setIsTyping(false);
  };

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-li:my-1 prose-pre:rounded-lg"
      onClick={maybeSkip}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" className="underline">
              {children}
            </a>
          ),
        }}
      >
        {shown}
      </ReactMarkdown>

      {/* con trỏ nháy nhỏ để “cảm giác đang gõ” */}
      {isTyping && <span className="inline-block align-text-bottom animate-pulse">▎</span>}

      {/* sentinel để auto-scroll */}
      <span ref={endRef} />
    </div>
  );
}

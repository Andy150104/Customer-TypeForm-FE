import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, Divider } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

type StrongVariant = "highlight" | "underline" | "default";

type MarkdownViewProps = {
  content: string;
  collapsible?: boolean;
  collapsedHeight?: number; // px
  strongVariant?: StrongVariant;
};

// ---- Strong renderer (type-safe)
function RenderStrong({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: StrongVariant;
}) {
  if (variant === "underline") {
    return (
      <strong className="font-semibold underline decoration-2 underline-offset-4 decoration-blue-400/50 dark:decoration-blue-300/40 text-slate-900 dark:text-zinc-50">
        {children}
      </strong>
    );
  }
  if (variant === "highlight") {
    return (
      <strong className="font-semibold text-slate-900 dark:text-zinc-50 bg-amber-50/80 dark:bg-amber-400/10 ring-1 ring-amber-200/60 dark:ring-amber-300/20 px-1 py-0.5 rounded-md">
        {children}
      </strong>
    );
  }
  return <strong className="font-semibold">{children}</strong>;
}

export function MarkdownView({
  content,
  collapsible = false,
  collapsedHeight = 320,
  strongVariant = "highlight",
}: MarkdownViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [needsToggle, setNeedsToggle] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // đo chiều cao sau khi render
  useEffect(() => {
    if (!collapsible) return;
    const el = wrapRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      setNeedsToggle(el.scrollHeight > collapsedHeight + 8);
    }, 0);
    return () => clearTimeout(t);
  }, [content, collapsible, collapsedHeight]);

  // ReactMarkdown components
  const components = useMemo<Components>(
    () => ({
      // Typography polish
      h2: ({ children }) => <h2 className="tracking-tight">{children}</h2>,
      h3: ({ children }) => <h3 className="tracking-tight">{children}</h3>,
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ),
      strong: ({ children }) => (
        <RenderStrong variant={strongVariant}>{children}</RenderStrong>
      ),
      em: ({ children }) => (
        <em className="text-slate-700 dark:text-zinc-200">{children}</em>
      ),
      blockquote: ({ children }) => (
        <blockquote className="bg-neutral-50 dark:bg-white/5 rounded-xl py-2 pr-3 border border-neutral-200/70 dark:border-white/10">
          {children}
        </blockquote>
      ),

      // Tables
      table: ({ children }) => (
        <div className="w-full overflow-x-auto rounded-xl ring-1 ring-neutral-200 dark:ring-white/10">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-neutral-50 dark:bg-white/5">{children}</thead>
      ),
      th: ({ children }) => (
        <th className="text-left font-semibold px-4 py-2 whitespace-nowrap border-b border-neutral-200 dark:border-white/10">
          {children}
        </th>
      ),
      tr: ({ children }) => (
        <tr className="even:bg-neutral-50/70 hover:bg-neutral-100 dark:even:bg-white/5 dark:hover:bg-white/10 transition-colors">
          {children}
        </tr>
      ),
      td: ({ children }) => (
        <td className="align-top px-4 py-2 border-b border-neutral-200 dark:border-white/10 whitespace-pre-wrap break-words">
          {children}
        </td>
      ),

      // Code
      // v9 không còn prop `inline` nữa → dùng `code` cho inline, `pre` cho block
      code: ({ children }) => (
        <code className="px-1 py-0.5 rounded bg-neutral-50 text-pink-600 dark:bg-white/5 dark:text-pink-300">
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className="rounded-xl p-3 overflow-x-auto bg-neutral-900 text-neutral-100 dark:bg-black/60 ring-1 ring-black/10 dark:ring-white/10">
          {children}
        </pre>
      ),

      hr: () => <hr className="border-neutral-200 dark:border-white/10" />,
    }),
    [strongVariant],
  );

  return (
    <div className="w-full rounded-2xl shadow-sm bg-white text-slate-800 border border-neutral-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10">
      <div
        ref={wrapRef}
        className="
          px-5 pt-5 pb-2
          prose max-w-none dark:prose-invert
          prose-headings:font-semibold
          prose-h2:text-[1.15rem] prose-h2:mt-2 prose-h2:mb-2
          prose-h3:text-[1.05rem] prose-h3:mt-2 prose-h3:mb-1.5
          prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
          prose-a:text-blue-600 hover:prose-a:underline
          prose-hr:my-4 prose-table:my-3
        "
        style={
          collapsible && !expanded && needsToggle
            ? {
                maxHeight: collapsedHeight,
                overflow: "hidden",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 80%, rgba(0,0,0,0))",
                maskImage:
                  "linear-gradient(to bottom, black 80%, rgba(0,0,0,0))",
              }
            : undefined
        }
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>

      {collapsible && needsToggle && (
        <>
          <Divider
            style={{ margin: 0 }}
            className="border-neutral-200 dark:border-white/10"
          />
          <div className="px-5 py-3 flex justify-center">
            <Button
              type="link"
              onClick={() => setExpanded((v) => !v)}
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

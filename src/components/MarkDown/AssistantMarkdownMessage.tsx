import type { HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownCodeProps = HTMLAttributes<HTMLElement> & {
  inline?: boolean;
};

const mergeClassName = (base: string, extra?: string) =>
  extra ? `${extra} ${base}` : base;

const markdownComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1
      {...props}
      className={mergeClassName(
        "mt-6 border-b border-slate-200/70 pb-2 text-[20px] font-semibold text-slate-900 first:mt-0 dark:border-slate-800/70 dark:text-slate-50",
        className
      )}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      {...props}
      className={mergeClassName(
        "mt-5 text-[18px] font-semibold text-slate-900 first:mt-0 dark:text-slate-50",
        className
      )}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      {...props}
      className={mergeClassName(
        "mt-4 text-[16px] font-semibold text-slate-900 dark:text-slate-50",
        className
      )}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      {...props}
      className={mergeClassName(
        "my-2 leading-relaxed text-slate-700 dark:text-slate-200",
        className
      )}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      {...props}
      className={mergeClassName(
        "font-medium text-sky-600 underline decoration-sky-300 underline-offset-2 transition-colors hover:text-sky-500 dark:text-sky-400 dark:decoration-sky-600",
        className
      )}
      target="_blank"
      rel="noreferrer"
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      {...props}
      className={mergeClassName(
        "my-2 list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200",
        className
      )}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      {...props}
      className={mergeClassName(
        "my-2 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-200",
        className
      )}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      {...props}
      className={mergeClassName(
        "leading-relaxed marker:text-slate-400 dark:marker:text-slate-500",
        className
      )}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong
      {...props}
      className={mergeClassName("font-semibold text-slate-900 dark:text-slate-50", className)}
    />
  ),
  em: ({ className, ...props }) => (
    <em
      {...props}
      className={mergeClassName("text-slate-700 dark:text-slate-200", className)}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      {...props}
      className={mergeClassName(
        "my-4 border-l-4 border-sky-300/70 bg-sky-50/60 px-4 py-2 text-[13px] italic text-slate-700 dark:border-sky-500/60 dark:bg-slate-800/60 dark:text-slate-200",
        className
      )}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr
      {...props}
      className={mergeClassName("my-6 border-slate-200/70 dark:border-slate-800/70", className)}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      {...props}
      className={mergeClassName(
        "mt-4 overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-950/90 p-4 text-[13px] leading-relaxed text-slate-100 shadow-inner dark:border-slate-800/70",
        className
      )}
    />
  ),
  code: ({ inline, className, children, ...props }: MarkdownCodeProps) =>
    inline ? (
      <code
        {...props}
        className={mergeClassName(
          "rounded-md bg-slate-100 px-1.5 py-0.5 text-[13px] font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100",
          className
        )}
      >
        {children}
      </code>
    ) : (
      <code
        {...props}
        className={mergeClassName("block text-[13px] leading-relaxed", className)}
      >
        {children}
      </code>
    ),
  table: ({ className, children, ...props }) => (
    <div
      className="mt-5 w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200/70 shadow-sm dark:border-slate-800/70"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <table
        {...props}
        className={mergeClassName(
          "w-full table-fixed border-collapse text-[13px]",
          className
        )}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead
      {...props}
      className={mergeClassName("bg-slate-50/90 dark:bg-slate-800/70", className)}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      {...props}
      className={mergeClassName(
        "border-b border-slate-200/80 px-4 py-2 text-left text-[12px] font-semibold uppercase tracking-wide text-slate-500 break-words align-top dark:border-slate-700/70 dark:text-slate-200",
        className
      )}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      {...props}
      className={mergeClassName(
        "border-t border-slate-100/80 px-4 py-2 text-slate-700 break-words align-top dark:border-slate-800/70 dark:text-slate-200",
        className
      )}
    />
  ),
};

export const assistantMessageClasses =
  "w-full max-w-full min-w-0 overflow-hidden mr-auto px-3 sm:px-5 py-4 text-[16px] sm:text-[17px] leading-relaxed text-slate-900 dark:text-slate-100";

type AssistantMarkdownContentProps = {
  content: string;
  className?: string;
};

export function AssistantMarkdownContent({
  content,
  className,
}: AssistantMarkdownContentProps) {
  return (
    <div
      className={mergeClassName(
        "prose prose-slate prose-lg md:prose-xl max-w-none w-full break-words overflow-x-hidden dark:prose-invert",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


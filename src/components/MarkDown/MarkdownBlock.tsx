"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { PluggableList } from "unified";

type MarkdownBlockProps = {
  markdown: string;
  className?: string;
};

const remarkPlugins: PluggableList = [remarkGfm];
const rehypePlugins: PluggableList = [rehypeRaw, rehypeSanitize];

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({
  markdown,
  className,
}) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

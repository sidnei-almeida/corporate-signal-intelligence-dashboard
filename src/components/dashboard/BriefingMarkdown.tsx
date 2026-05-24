"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  table: ({ children }) => (
    <div className="briefing-table-wrap">
      <table>{children}</table>
    </div>
  ),
};

interface BriefingMarkdownProps {
  content: string;
}

export function BriefingMarkdown({ content }: BriefingMarkdownProps) {
  return (
    <div className="briefing-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * 通用代码高亮预览组件：highlight.js。
 * monaco 语言 id 与 hljs 语言 id 大部分同名，个别需要映射；
 * 映射不到时用 highlightAuto 猜测，plaintext 直接纯文本展示。
 */
import { useMemo } from "react";
import hljs from "highlight.js";
import "@/styles/hljs.css";
import type { PreviewProps } from "@/types";
import { resolveParser } from "@/lib/parsers/registry";
import { extOf } from "@/types";

/** monaco id -> hljs id（仅列出不一致的） */
const HLJS_ALIAS: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  csharp: "csharp",
  objectivec: "objectivec",
  fsharp: "fsharp",
  shell: "bash",
  dockerfile: "dockerfile",
  graphql: "graphql",
  restructuredtext: "python-repl",
  vue: "xml",
  plaintext: "",
};

export default function CodePreview({ file }: PreviewProps) {
  const html = useMemo(() => {
    const monacoLang = resolveParser(file.name).monacoLanguage(
      extOf(file.name),
      file.name,
    );
    if (monacoLang === "plaintext") return null;
    const lang = HLJS_ALIAS[monacoLang] ?? monacoLang;
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(file.content, { language: lang, ignoreIllegals: true })
          .value;
      }
      return hljs.highlightAuto(file.content).value;
    } catch {
      return null;
    }
  }, [file.name, file.content]);

  if (html === null) {
    return (
      <pre className="whitespace-pre-wrap px-8 py-6 font-mono text-sm leading-relaxed">
        {file.content}
      </pre>
    );
  }

  return (
    <div className="px-6 py-6">
      <pre className="hljs">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

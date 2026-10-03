import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { useDocTheme } from "@/context/StyleContext";
import { getCurrentMermaidTheme } from "@/lib/theme/themeBridge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import hljs from "highlight.js";
import { Check, Copy, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCodeBlockForCopy, copyToClipboard } from "@/lib/clipboard";
import "katex/dist/katex.min.css";
import "@/styles/hljs.css";
import type { PreviewProps } from "@/types";

let mermaidSeq = 0;

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const { style } = useDocTheme();

  useEffect(() => {
    let cancelled = false;
    const diagId = `my-d${mermaidSeq}`;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const currentTheme = getCurrentMermaidTheme();
        const fontSans =
          getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() ||
          "sans-serif";
        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme,
          fontFamily: fontSans,
        });
        const id = `mermaid-${++mermaidSeq}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      // mermaid 渲染失败时可能残留诊断节点
      document.getElementById(diagId)?.remove();
    };
  }, [code, resolvedTheme, style]);

  if (error) {
    return (
      <pre className="my-4 overflow-x-auto border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        Mermaid 渲染失败：{error}
      </pre>
    );
  }
  return <div ref={ref} className="my-4 flex justify-center overflow-x-auto" />;
}

const HLJS_ALIAS: Record<string, string> = {
  vue: "xml",
  shell: "bash",
  zsh: "bash",
  sh: "bash",
  ts: "typescript",
  js: "javascript",
  py: "python",
  yml: "yaml",
  rb: "ruby",
  cs: "csharp",
  "c++": "cpp",
  "c#": "csharp",
  golang: "go",
  docker: "dockerfile",
};

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const match = /language-([^\s]+)/.exec(className ?? "");
  const rawLang = match?.[1] ?? "";
  const lang = rawLang.toLowerCase();
  const code = String(children ?? "").replace(/\n$/, "");

  if (lang === "mermaid") return <MermaidBlock code={code} />;

  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const textToCopy = formatCodeBlockForCopy(code, rawLang);
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const hljsLang = HLJS_ALIAS[lang] ?? lang;
  let html: string | null = null;
  try {
    if (hljsLang && hljs.getLanguage(hljsLang)) {
      html = hljs.highlight(code, {
        language: hljsLang,
        ignoreIllegals: true,
      }).value;
    } else {
      html = hljs.highlightAuto(code).value;
    }
  } catch {
    html = null;
  }

  const displayLang = rawLang || "text";

  return (
    <div className="group my-4 overflow-hidden rounded-[var(--radius)] border border-border/60 bg-[var(--hljs-bg)] shadow-xs">
      {/* 标题栏：左侧语言标识，右侧复制按钮 */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-1.5 font-mono text-[12px] font-medium text-muted-foreground/85">
          <Code2 className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          <span className="tracking-wide">{displayLang}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer select-none",
            copied
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
          title={copied ? "已复制到剪贴板" : "复制代码块"}
          aria-label={copied ? "已复制" : "复制代码块"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px]">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 opacity-70" />
              <span className="text-[11px]">复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容区 */}
      <pre className="hljs !my-0 !border-0 !bg-transparent p-4 overflow-x-auto font-mono text-[13px] leading-relaxed">
        {html === null ? (
          <code>{code}</code>
        ) : (
          <code dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </pre>
    </div>
  );
}

export default function MarkdownPreview({ file }: PreviewProps) {
  /* 每次渲染重置的标题计数器：渲染顺序即文档顺序，
     与 extractOutline 的条目一一对应（id = oc-0, oc-1...），
     供大纲点击后 scrollIntoView 定位。 */
  const headingSeq = { n: 0 };
  const headingId = () => `oc-${headingSeq.n++}`;

  return (
    <div className="mx-auto space-y-3 px-8 py-6 text-[15px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={{
          h1: ({ children }) => (
            <h1
              id={headingId()}
              className="mt-6 border-b border-border pb-2 font-serif text-3xl font-semibold"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={headingId()}
              className="mt-8 font-serif text-2xl font-semibold"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={headingId()} className="mt-6 text-lg font-semibold">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 id={headingId()} className="mt-4 text-base font-semibold">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 id={headingId()} className="mt-4 text-sm font-semibold">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6
              id={headingId()}
              className="mt-4 text-sm font-semibold text-muted-foreground"
            >
              {children}
            </h6>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-primary/40 bg-accent/40 py-2 pl-4 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          code(props) {
            const { className, children, ...rest } = props as {
              className?: string;
              children?: ReactNode;
            } & Record<string, unknown>;
            const isBlock =
              typeof className === "string" ||
              String(children ?? "").includes("\n");
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                className="  bg-muted px-1.5 py-0.5 font-mono text-[0.9em]"
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-border bg-card px-3 py-2 text-left font-medium">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-3 py-2">{children}</td>
            );
          },
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {file.content}
      </ReactMarkdown>
    </div>
  );
}

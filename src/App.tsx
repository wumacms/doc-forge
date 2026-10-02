import { useCallback, useEffect, useMemo, useState } from "react";
import { PenLine, Columns2, Eye, Hammer, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import FileTree from "@/components/FileTree";
import EditorPane, { disposeModel } from "@/components/editor/EditorPane";
import PreviewPane from "@/components/PreviewPane";
import { type DocFile } from "@/types";
import { resolveParser } from "@/lib/parsers/registry";
import "@/lib/parsers"; // 副作用：注册全部文档解析器
import { loadWorkspace, saveWorkspace, uid } from "@/lib/workspace";
import { setupMonaco } from "@/lib/monacoSetup";
import { cn } from "@/lib/utils";

type ViewMode = "edit" | "split" | "preview";

// 提前注册 MonacoEnvironment，避免首次创建编辑器时才配置的竞态
setupMonaco();

const THEME_ORDER = ["light", "dark"] as const;
const THEME_META: Record<
  (typeof THEME_ORDER)[number],
  { label: string; icon: typeof Sun }
> = {
  light: { label: "浅色主题", icon: Sun },
  dark: { label: "深色主题", icon: Moon },
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current: (typeof THEME_ORDER)[number] =
    theme === "dark" ? "dark" : "light";
  const meta = THEME_META[current];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      title={meta.label}
      aria-label={meta.label}
      onClick={() => {
        const idx = THEME_ORDER.indexOf(current);
        setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
      }}
      className=" border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {/* SSR/水合前固定图标，避免闪烁 */}
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">{mounted ? meta.label : "切换主题"}</span>
    </button>
  );
}

export default function App() {
  const [initial] = useState(loadWorkspace);
  const [files, setFiles] = useState<DocFile[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(
    initial[0]?.id ?? null,
  );
  const [mode, setMode] = useState<ViewMode>("split");

  // 持久化（去抖）
  useEffect(() => {
    const t = setTimeout(() => saveWorkspace(files), 300);
    return () => clearTimeout(t);
  }, [files]);

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeId) ?? null,
    [files, activeId],
  );

  // 按文件类型解析对应解析器：驱动编辑权限、顶栏标签与预览分发
  const parser = useMemo(
    () => (activeFile ? resolveParser(activeFile.name) : null),
    [activeFile],
  );
  const editable = parser?.editable ?? true;
  const isPreviewOnly = !!parser && !parser.editable;

  // 打开不可编辑文件（如 PDF）时强制进入预览视图
  useEffect(() => {
    if (isPreviewOnly) setMode("preview");
  }, [isPreviewOnly]);

  const handleChange = useCallback(
    (content: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeId ? { ...f, content } : f)),
      );
    },
    [activeId],
  );

  const handleCreate = (name: string) => {
    const file: DocFile = { id: uid(), name, content: "" };
    setFiles((prev) => [...prev, file]);
    setActiveId(file.id);
    toast({ title: "已创建", description: name });
  };

  const handleRename = (id: string, name: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleDelete = (id: string) => {
    const target = files.find((f) => f.id === id);
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
    disposeModel(id);
    if (target) toast({ title: "已删除", description: target.name });
  };

  const modes: { key: ViewMode; label: string; icon: typeof PenLine }[] = [
    { key: "edit", label: "编辑", icon: PenLine },
    { key: "split", label: "分屏", icon: Columns2 },
    { key: "preview", label: "预览", icon: Eye },
  ];

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* 顶栏 */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/70 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Hammer className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="font-serif text-lg font-semibold tracking-tight">
            DocForge
          </span>
          {activeFile && (
            <span className="ml-3 hidden truncate text-sm text-muted-foreground sm:inline">
              {activeFile.name}
            </span>
          )}
          {parser && (
            <span className="ml-1 hidden shrink-0  border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground lg:inline">
              {parser.label}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div
            role="tablist"
            aria-label="视图模式"
            className="flex items-center gap-1  border border-border bg-background p-1"
          >
            {modes.map((m) => {
              const disabled = isPreviewOnly && m.key !== "preview";
              return (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.key}
                  disabled={disabled}
                  title={disabled ? "该文件类型只读，仅支持预览" : m.label}
                  onClick={() => setMode(m.key)}
                  className={cn(
                    "flex items-center gap-1.5  px-3 py-1 text-sm transition-colors",
                    mode === m.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    disabled &&
                      "cursor-not-allowed opacity-40 hover:bg-transparent",
                  )}
                >
                  <m.icon className="h-4 w-4" aria-hidden />
                  <span className="hidden md:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 主体 */}
      <div className="flex min-h-0 flex-1">
        <FileTree
          files={files}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />

        <main className="min-w-0 flex-1">
          {!activeFile ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <PenLine className="h-8 w-8" aria-hidden />
              <p>没有打开的文件。在左侧新建一个文件开始写作。</p>
            </div>
          ) : isPreviewOnly ? (
            <PreviewPane file={activeFile} />
          ) : (
            <div className="flex h-full">
              {(mode === "edit" || mode === "split") && editable && (
                <div
                  className={cn(
                    "h-full min-w-0 border-r border-border",
                    mode === "split" ? "w-1/2" : "w-full border-r-0",
                  )}
                >
                  <EditorPane file={activeFile} onChange={handleChange} />
                </div>
              )}
              {(mode === "preview" || mode === "split") && (
                <div
                  className={cn(
                    "h-full min-w-0 overflow-auto",
                    mode === "split" ? "w-1/2" : "w-full",
                  )}
                >
                  <PreviewPane file={activeFile} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Toaster />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { PenLine, Columns2, Eye, Hammer } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import FileTree from "@/components/FileTree";
import EditorPane, { disposeModel } from "@/components/editor/EditorPane";
import MarkdownPreview from "@/components/previews/MarkdownPreview";
import PdfPreview from "@/components/previews/PdfPreview";
import { kindOf, type DocFile } from "@/types";
import { loadWorkspace, saveWorkspace, uid } from "@/lib/workspace";
import { setupMonaco } from "@/lib/monacoSetup";
import { cn } from "@/lib/utils";

type ViewMode = "edit" | "split" | "preview";

// 提前注册 MonacoEnvironment，避免首次创建编辑器时才配置的竞态
setupMonaco();

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

  const kind = activeFile ? kindOf(activeFile.name) : "text";
  const isPreviewOnly = kind === "pdf";

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
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/70 px-4">
        <div className="flex items-center gap-2">
          <Hammer className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-serif text-lg font-semibold tracking-tight">
            DocForge
          </span>
          {activeFile && (
            <span className="ml-3 hidden text-sm text-muted-foreground sm:inline">
              {activeFile.name}
            </span>
          )}
        </div>
        <div
          role="tablist"
          aria-label="视图模式"
          className="flex items-center gap-1 rounded-full border border-border bg-background p-1"
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
                title={m.label}
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
                  mode === m.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
              >
                <m.icon className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">{m.label}</span>
              </button>
            );
          })}
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
            <PdfPreview file={activeFile} />
          ) : (
            <div className="flex h-full">
              {(mode === "edit" || mode === "split") && (
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
                  <MarkdownPreview file={activeFile} />
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

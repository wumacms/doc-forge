import { useEffect, useRef } from "react";
import { monaco } from "@/lib/monacoSetup";
import { monacoLangOf } from "@/types";
import type { DocFile } from "@/types";

interface Props {
  file: DocFile;
  onChange: (content: string) => void;
}

interface ModelEntry {
  model: monaco.editor.ITextModel;
  state: monaco.editor.ICodeEditorViewState | null;
}

/** 每个文件一个 model，切换文件时保留 undo 历史与视图状态 */
const models = new Map<string, ModelEntry>();

export default function EditorPane({ file, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    const editor = monaco.editor.create(containerRef.current, {
      value: "",
      language: "plaintext",
      automaticLayout: true,
      fontSize: 14,
      lineHeight: 1.7,
      wordWrap: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
      renderLineHighlight: "line",
      scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
    });
    editorRef.current = editor;
    return () => {
      editor.dispose();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    let entry = models.get(file.id);
    if (!entry) {
      const model = monaco.editor.createModel(
        file.content,
        monacoLangOf(file.name),
        monaco.Uri.parse(`file:///docforge/${encodeURIComponent(file.id)}`),
      );
      entry = { model, state: null };
      models.set(file.id, entry);
    } else {
      // 文件可能已重命名，同步语言
      monaco.editor.setModelLanguage(entry.model, monacoLangOf(file.name));
    }

    const current = editor.getModel();
    if (current !== entry.model) {
      if (current) {
        for (const e of models.values()) {
          if (e.model === current) e.state = editor.saveViewState();
        }
      }
      editor.setModel(entry.model);
      if (entry.state) editor.restoreViewState(entry.state);
    }

    const sub = editor.onDidChangeModelContent(() => {
      onChangeRef.current(editor.getValue());
    });
    return () => sub.dispose();
  }, [file.id, file.name, file.content]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="textbox"
      aria-label="文档编辑器"
    />
  );
}

/** 删除文件时清理对应 model */
export function disposeModel(id: string): void {
  const entry = models.get(id);
  if (entry) {
    entry.model.dispose();
    models.delete(id);
  }
}

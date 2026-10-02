import { useState } from "react";
import {
  FileText,
  FileCode2,
  FileType2,
  File,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { DocFile } from "@/types";
import { resolveParser } from "@/lib/parsers/registry";
import { cn } from "@/lib/utils";

interface Props {
  files: DocFile[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function KindIcon({ name }: { name: string }) {
  let k = "text";
  try {
    k = resolveParser(name).iconKind;
  } catch {
    k = "text";
  }
  const cls = "h-4 w-4 shrink-0 text-muted-foreground";
  if (k === "markdown") return <FileText className={cls} aria-hidden />;
  if (k === "code") return <FileCode2 className={cls} aria-hidden />;
  if (k === "pdf") return <FileType2 className={cls} aria-hidden />;
  return <File className={cls} aria-hidden />;
}

export default function FileTree({
  files,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const commitCreate = () => {
    const name = draft.trim();
    if (name && !files.some((f) => f.name === name)) onCreate(name);
    setDraft("");
    setCreating(false);
  };

  const commitRename = (id: string) => {
    const name = draft.trim();
    if (
      name &&
      !files.some((f) => f.id !== id && f.name === name)
    ) {
      onRename(id, name);
    }
    setDraft("");
    setEditingId(null);
  };

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          文件
        </h2>
        <button
          type="button"
          aria-label="新建文件"
          title="新建文件"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            setCreating(true);
            setDraft("");
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2" role="listbox" aria-label="文件列表">
        {files.map((f) => {
          const active = f.id === activeId;
          if (editingId === f.id) {
            return (
              <li key={f.id} className="flex items-center gap-1 px-1">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(f.id);
                    if (e.key === "Escape") {
                      setDraft("");
                      setEditingId(null);
                    }
                  }}
                  aria-label="新文件名"
                  className="w-full rounded-sm border border-ring bg-background px-1.5 py-1 text-sm outline-none"
                />
                <button type="button" aria-label="确认重命名" className="p-1 text-chart-2 hover:opacity-80" onClick={() => commitRename(f.id)}>
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button type="button" aria-label="取消" className="p-1 text-muted-foreground hover:opacity-80" onClick={() => setEditingId(null)}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          }
          return (
            <li key={f.id}>
              <div
                role="option"
                aria-selected={active}
                tabIndex={0}
                onClick={() => onSelect(f.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(f.id);
                  }
                }}
                onDoubleClick={() => {
                  setEditingId(f.id);
                  setDraft(f.name);
                }}
                className={cn(
                  "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-accent",
                )}
              >
                <KindIcon name={f.name} />
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                  <button
                    type="button"
                    aria-label={`重命名 ${f.name}`}
                    className={cn(
                      "rounded p-0.5",
                      active ? "hover:bg-primary-foreground/20" : "hover:bg-background",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(f.id);
                      setDraft(f.name);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`删除 ${f.name}`}
                    className={cn(
                      "rounded p-0.5",
                      active
                        ? "hover:bg-primary-foreground/20"
                        : "hover:bg-background hover:text-destructive",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(f.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </li>
          );
        })}

        {creating && (
          <li className="mt-1 flex items-center gap-1 px-1">
            <input
              autoFocus
              value={draft}
              placeholder="文件名，如 todo.md"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCreate();
                if (e.key === "Escape") {
                  setDraft("");
                  setCreating(false);
                }
              }}
              onBlur={commitCreate}
              aria-label="新文件名"
              className="w-full rounded-sm border border-ring bg-background px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </li>
        )}
      </ul>
    </aside>
  );
}

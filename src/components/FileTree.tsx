import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FileCode2,
  FileType2,
  File,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import type { WsFile, WsFolder, WsNode } from "@/types";
import { resolveParser } from "@/lib/parsers/registry";
import { findNode, uniqueName } from "@/lib/workspace";
import { cn } from "@/lib/utils";

interface Props {
  nodes: WsNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  /** parentId 为 null 表示根级 */
  onCreateFile: (parentId: string | null, name: string) => void;
  onCreateFolder: (parentId: string | null, name: string) => void;
  onRename: (id: string, name: string) => void;
  /** 交由上层弹出确认框 */
  onRequestDelete: (node: WsNode) => void;
}

type Creating = { parentId: string | null; kind: "file" | "folder" } | null;

function KindIcon({ name }: { name: string }) {
  let k = "text";
  try {
    k = resolveParser(name).iconKind;
  } catch {
    k = "text";
  }
  const cls = "h-4 w-4 shrink-0 opacity-70";
  if (k === "markdown") return <FileText className={cls} aria-hidden />;
  if (k === "code") return <FileCode2 className={cls} aria-hidden />;
  if (k === "pdf") return <FileType2 className={cls} aria-hidden />;
  return <File className={cls} aria-hidden />;
}

function InlineInput({
  initial,
  placeholder,
  label,
  onCommit,
  onCancel,
}: {
  initial: string;
  placeholder: string;
  label: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const commit = () => {
    const name = draft.trim();
    if (name) onCommit(name);
    else onCancel();
  };
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      <input
        autoFocus
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={commit}
        aria-label={label}
        className="w-full border border-ring bg-background px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground/60"
      />
      <button type="button" aria-label="确认" className="p-1 text-chart-2 hover:opacity-80" onClick={commit}>
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Row({
  node,
  depth,
  parent,
  props,
  expanded,
  toggleExpand,
  creating,
  setCreating,
  editingId,
  setEditingId,
  draft,
  setDraft,
}: {
  node: WsNode;
  depth: number;
  parent: WsFolder | null;
  props: Props;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  creating: Creating;
  setCreating: (c: Creating) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  draft: string;
  setDraft: (s: string) => void;
}) {
  const pad = { paddingLeft: `${8 + depth * 14}px` };
  const isFolder = node.kind === "folder";
  const open = isFolder && expanded.has(node.id);

  if (editingId === node.id) {
    return (
      <li style={pad}>
        <InlineInput
          initial={draft}
          label="重命名"
          placeholder={node.name}
          onCommit={(name) => {
            const siblings = parent ? parent.children : props.nodes;
            props.onRename(node.id, uniqueName(siblings, name, node.id));
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      </li>
    );
  }

  return (
    <li style={pad}>
      <div
        role={isFolder ? "button" : "option"}
        aria-expanded={isFolder ? open : undefined}
        aria-selected={!isFolder && node.id === props.activeId}
        tabIndex={0}
        onClick={() => {
          if (isFolder) toggleExpand(node.id);
          else props.onSelect(node.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isFolder) toggleExpand(node.id);
            else props.onSelect(node.id);
          }
        }}
        onDoubleClick={() => {
          if (!isFolder) return;
          setEditingId(node.id);
          setDraft(node.name);
        }}
        className={cn(
          "group flex cursor-pointer items-center gap-1.5 pr-1 py-1.5 text-sm transition-colors",
          !isFolder && node.id === props.activeId
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-accent",
        )}
      >
        {isFolder ? (
          <>
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            )}
            {open ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" aria-hidden />
            <KindIcon name={node.name} />
          </>
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <span className="hidden shrink-0 items-center group-hover:flex focus-within:flex">
          {isFolder && (
            <>
              <button
                type="button"
                aria-label={`在 ${node.name} 中新建文件`}
                title="新建文件"
                className="p-0.5 hover:bg-background/60"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!expanded.has(node.id)) toggleExpand(node.id);
                  setCreating({ parentId: node.id, kind: "file" });
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`在 ${node.name} 中新建文件夹`}
                title="新建文件夹"
                className="p-0.5 hover:bg-background/60"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!expanded.has(node.id)) toggleExpand(node.id);
                  setCreating({ parentId: node.id, kind: "folder" });
                }}
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            aria-label={`重命名 ${node.name}`}
            title="重命名"
            className="p-0.5 hover:bg-background/60"
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(node.id);
              setDraft(node.name);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`删除 ${node.name}`}
            title="删除"
            className="p-0.5 hover:bg-background/60 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              props.onRequestDelete(node);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      {isFolder && open && (
        <ul role="group" className="space-y-0.5">
          {creating && creating.parentId === node.id && (
            <li style={{ paddingLeft: `${8 + (depth + 1) * 14}px` }}>
              <InlineInput
                initial=""
                label={creating.kind === "file" ? "新文件名" : "新文件夹名"}
                placeholder={creating.kind === "file" ? "如 todo.md" : "文件夹名"}
                onCommit={(name) => {
                  if (creating.kind === "file") props.onCreateFile(node.id, name);
                  else props.onCreateFolder(node.id, name);
                  setCreating(null);
                }}
                onCancel={() => setCreating(null)}
              />
            </li>
          )}
          {node.children.length === 0 && !creating && (
            <li
              style={{ paddingLeft: `${8 + (depth + 1) * 14}px` }}
              className="py-1 text-xs italic text-muted-foreground/70"
            >
              （空文件夹）
            </li>
          )}
          {node.children.map((c) => (
            <Row
              key={c.id}
              node={c}
              depth={depth + 1}
              parent={node}
              props={props}
              expanded={expanded}
              toggleExpand={toggleExpand}
              creating={creating}
              setCreating={setCreating}
              editingId={editingId}
              setEditingId={setEditingId}
              draft={draft}
              setDraft={setDraft}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FileTree(props: Props) {
  const { nodes, onCreateFile, onCreateFolder, onRequestDelete } = props;
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(nodes.filter((n) => n.kind === "folder").map((n) => n.id)),
  );
  const [creating, setCreating] = useState<Creating>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const parentOf = (id: string | null): WsFolder | null =>
    id ? findNode(nodes, id)?.parent ?? null : null;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          工作区
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="在根目录新建文件"
            title="新建文件"
            className="p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setCreating({ parentId: null, kind: "file" });
              setEditingId(null);
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="在根目录新建文件夹"
            title="新建文件夹"
            className="p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setCreating({ parentId: null, kind: "folder" });
              setEditingId(null);
            }}
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul
        ref={listRef}
        className="flex-1 space-y-0.5 overflow-y-auto px-1 pb-2"
        aria-label="文件与文件夹"
      >
        {creating && creating.parentId === null && (
          <li className="px-1">
            <InlineInput
              initial=""
              label={creating.kind === "file" ? "新文件名" : "新文件夹名"}
              placeholder={creating.kind === "file" ? "如 todo.md" : "文件夹名"}
              onCommit={(name) => {
                if (creating.kind === "file") onCreateFile(null, name);
                else onCreateFolder(null, name);
                setCreating(null);
              }}
              onCancel={() => setCreating(null)}
            />
          </li>
        )}
        {nodes.map((n) => (
          <Row
            key={n.id}
            node={n}
            depth={0}
            parent={parentOf(n.id)}
            props={props}
            expanded={expanded}
            toggleExpand={toggleExpand}
            creating={creating}
            setCreating={setCreating}
            editingId={editingId}
            setEditingId={setEditingId}
            draft={draft}
            setDraft={setDraft}
          />
        ))}
        {nodes.length === 0 && !creating && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            工作区为空，点击上方 + 新建
          </li>
        )}
      </ul>
    </aside>
  );
}

/** 供上层在删除文件节点时清理 Monaco model */
export type { WsFile, WsFolder };

export type FileKind = "markdown" | "code" | "pdf" | "text";

export interface DocFile {
  id: string;
  name: string;
  content: string;
}

export interface PreviewProps {
  file: DocFile;
}

const EXT_LANGS: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  css: "css",
  html: "html",
  py: "python",
  sh: "shell",
  yml: "yaml",
  yaml: "yaml",
};

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function kindOf(name: string): FileKind {
  const e = extOf(name);
  if (e === "md" || e === "markdown") return "markdown";
  if (e === "pdf") return "pdf";
  if (e in EXT_LANGS) return "code";
  return "text";
}

export function monacoLangOf(name: string): string {
  const e = extOf(name);
  if (e === "md" || e === "markdown") return "markdown";
  return EXT_LANGS[e] ?? "plaintext";
}

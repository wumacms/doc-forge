/**
 * Monaco 初始化：
 * - 通过 Vite 的 `?worker&url` 拿到自托管 editor worker 的原生模块 URL，
 *   再用 createModuleWorker（干净 realm 构造器）创建，规避扩展对
 *   Worker 构造器的 importScripts 劫持。
 * - 主题色板来自 src/index.css 的 oklch 令牌，经 scripts/oklch2hex.cjs
 *   离线换算为 hex（Monaco 仅接受 hex/rgba，且部分浏览器 canvas 不解析
 *   oklch，运行时换算会得到 #000 导致黑底黑字）。
 */
import * as monaco from "monaco-editor";
import editorWorkerUrl from "@/worker/editor.worker.ts?worker&url";
import { createModuleWorker } from "@/lib/cleanWorker";

// Monaco 0.5x ESM 构建在解析 worker 模块 URL 时调用 FileAccess.toUri()；
// 未设置 _VSCODE_FILE_ROOT 会走 AMD 的 require.toUrl() 分支，抛出
// "Cannot read properties of undefined (reading 'toUrl')"。
// 我们经 MonacoEnvironment.getWorker 自托管 worker，该解析结果不会被
// 实际使用，但必须避免其抛错。
(globalThis as { _VSCODE_FILE_ROOT?: string })._VSCODE_FILE_ROOT =
  typeof self !== "undefined" && self.location
    ? `${self.location.origin}/`
    : "/";

/** 与 index.css 的 .dark / :root 令牌一一对应（oklch → hex） */
const TOKENS = {
  light: {
    background: "#ffffff", // --color-background
    foreground: "#0f1419", // --color-foreground
    card: "#f7f8f8", // --color-card
    muted: "#e5e5e6", // --color-muted
    accent: "#e3ecf6", // --color-accent
    border: "#e1eaef", // --color-border
    lineNumbers: "#8b95a1", // foreground/border 之间的中间灰，保证可读
  },
  dark: {
    background: "#000000", // --color-background
    foreground: "#e7e9ea", // --color-foreground
    card: "#17181c", // --color-card
    muted: "#181818", // --color-muted
    accent: "#061622", // --color-accent
    border: "#242628", // --color-border
    lineNumbers: "#6f7680", // muted-foreground(#72767a) 略调
  },
} as const;

function themeColors(dark: boolean): Record<string, string> {
  const t = dark ? TOKENS.dark : TOKENS.light;
  return {
    "editor.background": t.background,
    "editor.foreground": t.foreground,
    "editorLineNumber.foreground": t.lineNumbers,
    "editorLineNumber.activeForeground": t.foreground,
    "editor.lineHighlightBackground": t.accent,
    "editor.selectionBackground": t.accent,
    "editorWidget.background": t.card,
    "editorWidget.border": t.border,
    "editorGutter.background": t.background,
    "scrollbarSlider.background": t.muted,
    "minimap.background": t.background,
  };
}

function defineThemes(): void {
  try {
    monaco.editor.defineTheme("docforge-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: themeColors(false),
    });
    monaco.editor.defineTheme("docforge-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: themeColors(true),
    });
  } catch (e) {
    // 主题注册异常不应导致编辑器崩溃：退回 Monaco 内置主题
    console.warn("[DocForge] Monaco 主题定义失败，使用内置主题：", e);
  }
}

/**
 * 切换 Monaco 主题。
 * 必须显式传入 dark：next-themes 是在父组件（ThemeProvider）的 effect 里
 * 把 .dark 写进 DOM 的，而子组件 EditorPane 的 effect 先执行——若在此处
 * 读取 class，拿到的永远是上一次的旧主题，导致编辑器与界面颜色相反。
 * 仅在未传参时（如首帧 resolvedTheme 尚未就绪）才回退到读 DOM。
 */
export function syncMonacoTheme(dark?: boolean): void {
  const isDark =
    dark ?? document.documentElement.classList.contains("dark");
  try {
    monaco.editor.setTheme(isDark ? "docforge-dark" : "docforge-light");
  } catch {
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
  }
}

let configured = false;

function configureEnv(): void {
  if (configured) return;
  configured = true;
  (self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
    getWorker(): Worker {
      return createModuleWorker(editorWorkerUrl);
    },
  };
  defineThemes();
}

// 模块加载即配置：Monaco 可能在 setupMonaco() 被显式调用前创建 worker
if (typeof window !== "undefined") {
  configureEnv();
}

export function setupMonaco(): typeof monaco {
  configureEnv();
  return monaco;
}

export { monaco };

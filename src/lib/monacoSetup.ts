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

import { setMonacoInstance, syncMonacoThemeDynamic } from "@/lib/theme/themeBridge";
import { registerCustomLanguages } from "@/lib/languages/registerCustomLanguages";

setMonacoInstance(monaco);
if (typeof window !== "undefined") {
  (window as unknown as { monaco?: typeof monaco }).monaco = monaco;
}

function defineThemes(): void {
  // 初始预热 light 与 dark 两种状态的主题注册
  syncMonacoThemeDynamic(false, monaco);
  syncMonacoThemeDynamic(true, monaco);
}

/**
 * 切换 Monaco 主题。
 * 必须显式传入 dark：next-themes 是在父组件（ThemeProvider）的 effect 里
 * 把 .dark 写进 DOM 的，而子组件 EditorPane 的 effect 先执行——若在此处
 * 读取 class，拿到的可能是旧值。
 * 动态桥接器会结合 DOM 上的 data-style 与传入的 dark 计算出准确的 hex 主题。
 */
export function syncMonacoTheme(dark?: boolean): void {
  syncMonacoThemeDynamic(dark);
}

let configured = false;

function configureEnv(): void {
  if (configured) return;
  configured = true;
  registerCustomLanguages(monaco);
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

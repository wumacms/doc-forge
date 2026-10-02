/**
 * Monaco 初始化：
 * - 通过 Vite 的 `?worker&url` 拿到自托管 editor worker 的原生模块 URL，
 *   再用 createModuleWorker（干净 realm 构造器）创建，规避扩展对
 *   Worker 构造器的 importScripts 劫持。
 * - 仅注册 editor 基础能力，语言按需由 monaco-editor 全量 ESM 提供。
 */
import * as monaco from "monaco-editor";
import editorWorkerUrl from "@/worker/editor.worker.ts?worker&url";
import { createModuleWorker } from "@/lib/cleanWorker";

let configured = false;

function configureEnv(): void {
  if (configured) return;
  configured = true;
  (self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
    getWorker(): Worker {
      return createModuleWorker(editorWorkerUrl);
    },
  };
}

// 模块加载即配置：Monaco 可能在 setupMonaco() 被显式调用前创建 worker
configureEnv();

export function setupMonaco(): typeof monaco {
  configureEnv();
  return monaco;
}

export { monaco };

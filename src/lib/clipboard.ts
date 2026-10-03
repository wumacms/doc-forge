/**
 * 剪贴板与代码块复制格式化工具
 */

/**
 * 格式化代码块为 Markdown 围栏代码块文本
 *
 * @example
 * formatCodeBlockForCopy("const x = 1;", "typescript")
 * // ```typescript
 * // const x = 1;
 * // ```
 */
export function formatCodeBlockForCopy(code: string, lang = ""): string {
  const cleanCode = code.replace(/\r\n/g, "\n").replace(/\n$/, "");
  const trimmedLang = lang.trim().toLowerCase();

  // 如果代码内容中包含 ```，自动递增反引号数量以保证 Markdown 解析合法性
  let fence = "```";
  while (cleanCode.includes(fence)) {
    fence += "`";
  }

  return `${fence}${trimmedLang}\n${cleanCode}\n${fence}`;
}

/**
 * 跨浏览器写入剪贴板（支持现代 API 与 execCommand 兜底）
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. 优先尝试现代异步 Clipboard API
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 权限受限或非安全上下文时降级处理
  }

  // 2. 兜底方案：使用隐藏的 textarea + execCommand
  try {
    if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    }
  } catch {
    return false;
  }

  return false;
}

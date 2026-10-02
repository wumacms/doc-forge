/**
 * HTML 预览：srcdoc iframe，sandbox 不给 same-origin 权限，
 * 脚本在隔离环境运行，无法访问宿主页面数据。
 */
import { useState } from "react";
import { RotateCw, ShieldAlert } from "lucide-react";
import type { PreviewProps } from "@/types";

export default function HtmlPreview({ file }: PreviewProps) {
  const [nonce, setNonce] = useState(0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-1.5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
          沙箱渲染：脚本在隔离 iframe 中执行，不影响本页
        </p>
        <button
          type="button"
          className="flex items-center gap-1  px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => setNonce((n) => n + 1)}
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden />
          重新渲染
        </button>
      </div>
      <iframe
        key={nonce}
        title={`HTML 预览：${file.name}`}
        srcDoc={file.content}
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        className="min-h-0 flex-1 border-0 bg-white"
      />
    </div>
  );
}

import { Toaster } from "@/components/ui/toaster";
import type { CSSProperties } from "react";
import { FileText, Sparkles, Feather } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Markdown 编辑",
    desc: "专注书写的编辑器，语法高亮与实时预览。",
  },
  {
    icon: Sparkles,
    title: "公式与图表",
    desc: "内置 KaTeX 数学公式与 Mermaid 流程图渲染。",
  },
  {
    icon: Feather,
    title: "轻量导出",
    desc: "将文档导出为 PDF，随时分享你的作品。",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* 背景装饰层 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--color-accent) 0%, transparent 70%)",
        }}
      />

      <main className="relative z-10 w-full max-w-3xl text-center">
        <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground animate-[fade-in-up_0.6s_ease-out_both]">
          DocForge
        </p>
        <h1
          className="mt-4 text-5xl sm:text-6xl font-serif leading-tight animate-[fade-in-up_0.6s_0.1s_ease-out_both]"
        >
          让文字，
          <span className="text-primary">自成篇章</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto animate-[fade-in-up_0.6s_0.2s_ease-out_both]">
          一个面向写作者的文档工作台：编辑、预览、导出，一站式完成。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-1 animate-[fade-in-up_0.6s_var(--d)_ease-out_both]"
              style={{ "--d": `${0.3 + i * 0.1}s` } as CSSProperties}
            >
              <f.icon className="h-6 w-6 text-primary" aria-hidden />
              <h2 className="mt-3 font-medium">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 animate-[fade-in-up_0.6s_0.7s_ease-out_both]">
          <button
            type="button"
            className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-base font-medium shadow-[var(--shadow-sm)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            开始使用
          </button>
        </div>

        <section id="features" className="sr-only" aria-label="功能概览">
          编辑器、预览与导出功能入口。
        </section>
      </main>

      <footer className="relative z-10 mt-16 text-sm text-muted-foreground">
        基于 React + Vite 构建 · DocForge
      </footer>

      <Toaster />
    </div>
  );
}

export default App;

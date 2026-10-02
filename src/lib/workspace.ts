import type { DocFile } from "@/types";

const STORAGE_KEY = "docforge.workspace.v1";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const SAMPLE_PDF_B64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgL0YyIDYgMCBSID4+ID4+ID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggMjgyID4+CnN0cmVhbQpCVCAvRjEgMjggVGYgNzIgNzEwIFRkIChEb2NGb3JnZSBTYW1wbGUgUERGKSBUaiBFVApCVCAvRjIgMTQgVGYgNzIgNjgwIFRkIChUaGlzIGRvY3VtZW50IGlzIHJlbmRlcmVkIGVudGlyZWx5IGluIHlvdXIgYnJvd3Nlci4pIFRqIEVUCkJUIC9GMiAxNCBUZiA3MiA2NTUgVGQgKFVzZSB0aGUgdG9vbGJhciB0byBjaGFuZ2UgcGFnZSBhbmQgem9vbSBsZXZlbC4pIFRqIEVUCkJUIC9GMiAxMiBUZiA3MiA2MjAgVGQgKEdlbmVyYXRlZCBsb2NhbGx5IC0gbm8gc2VydmVyIGludm9sdmVkLikgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkID4+CmVuZG9iago2IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjUxIDAwMDAwIG4gCjAwMDAwMDA1ODQgMDAwMDAgbiAKMDAwMDAwMDY1OSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDcgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjcyOQolJUVPRgo=";

function seedFiles(): DocFile[] {
  return [
    {
      id: uid(),
      name: "README.md",
      content: `# DocForge

一个完全在浏览器中运行的文档工作台：**Monaco 编辑器 + Markdown 实时预览**。

## 功能

- 📝 Monaco 代码/Markdown 编辑器，语法高亮
- 👀 Markdown 实时预览，支持 GFM 表格、任务列表
- 🔬 数学公式（KaTeX）：$E = mc^2$，以及行间公式

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

- 📊 Mermaid 流程图（见 \`diagrams.md\`）
- 📄 PDF 预览（见 \`sample.pdf\`）
- 💾 所有文件保存在浏览器 localStorage，刷新不丢失

> 左侧文件树可以新建、重命名和删除文件；顶部切换 编辑 / 分屏 / 预览 三种视图。
`,
    },
    {
      id: uid(),
      name: "notes.md",
      content: `# 学习笔记

## 线性代数

矩阵乘法 $C = AB$ 其中：

$$
A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix},\\quad
B = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}
$$

## 待办

- [x] 配置 Monaco worker
- [x] 接入 KaTeX
- [ ] 导出 PDF
- [ ] 协作编辑

## 代码片段

\`\`\`ts
const fib = (n: number): number =>
  n < 2 ? n : fib(n - 1) + fib(n - 2);
\`\`\`
`,
    },
    {
      id: uid(),
      name: "diagrams.md",
      content: `# 流程图集

## 构建流水线

\`\`\`mermaid
flowchart LR
  A[源码] --> B{Lint}
  B -- 通过 --> C[Vite 构建]
  B -- 失败 --> A
  C --> D[预览部署]
\`\`\`

## 编辑器时序

\`\`\`mermaid
sequenceDiagram
  participant U as 用户
  participant E as Monaco
  participant P as 预览
  U->>E: 键入
  E->>P: onChange(节流)
  P-->>U: 渲染结果
\`\`\`
`,
    },
    {
      id: uid(),
      name: "sample.pdf",
      content: SAMPLE_PDF_B64,
    },
  ];
}

export function loadWorkspace(): DocFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DocFile[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // 数据损坏时回退到种子
  }
  const seeded = seedFiles();
  saveWorkspace(seeded);
  return seeded;
}

export function saveWorkspace(files: DocFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    // 存储满等场景静默失败
  }
}

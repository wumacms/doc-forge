import type { DocFile } from "@/types";

const STORAGE_KEY = "docforge.workspace.v2";

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

一个完全在浏览器中运行的**多格式文档工作台**。

## 功能

- 🌗 右上角一键切换 浅色 / 深色 / 跟随系统（编辑器与预览同步换肤）
- 🎨 Monaco 编辑器语法高亮：TS、Python、Go、Rust、SQL、Shell 等数十种语言
- 📑 按类型分发解析器：
  - \`.md\` → Markdown 渲染（GFM 表格 / 任务列表 / KaTeX / Mermaid）
  - \`.json\` / \`.yaml\` → 结构化数据树（解析失败给出报错 + 原文）
  - \`.html\` → 沙箱 iframe 实时渲染
  - 代码文件 → highlight.js 高亮预览
  - \`.pdf\` → pdf.js 只读预览（翻页 / 缩放）
- 💾 所有文件保存在浏览器 localStorage，刷新不丢失

> 新增文档类型：在 \`src/lib/parsers/index.tsx\` 里 \`registerParser\` 一个解析器即可，无需改动 App 或编辑器。

## 公式示例

$E = mc^2$，以及行间公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

- [x] 深色主题
- [x] 多语言高亮
- [ ] 导出 PDF
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
      name: "config.json",
      content: `{
  "name": "docforge",
  "version": "1.2.0",
  "features": {
    "theme": ["light", "dark", "system"],
    "parsers": ["markdown", "json", "yaml", "html", "code", "pdf"],
    "experimental": false
  },
  "limits": { "maxFileSize": 10485760, "autosaveMs": 300 }
}
`,
    },
    {
      id: uid(),
      name: "docker-compose.yml",
      content: `# 示例配置：预览会解析成数据树
version: "3.9"
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      TZ: Asia/Shanghai
      DEBUG: false
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
`,
    },
    {
      id: uid(),
      name: "demo.html",
      content: `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <title>沙箱渲染演示</title>
    <style>
      body { font-family: sans-serif; display: grid; place-items: center; min-height: 95vh; background: linear-gradient(135deg, #0ea5e9, #64748b); color: #fff; margin: 0; }
      .card { background: #ffffff22; padding: 2rem 3rem; border-radius: 16px; backdrop-filter: blur(6px); text-align: center; }
      button { margin-top: 1rem; padding: .5rem 1.25rem; border: 0; border-radius: 999px; background: #fff; color: #0284c7; font-weight: 700; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Hello DocForge 👋</h1>
      <p>这段 HTML 在隔离沙箱 iframe 中渲染。</p>
      <button onclick="this.textContent='已点击 ' + (++window.__n || 1) + ' 次'">点我</button>
    </div>
  </body>
</html>
`,
    },
    {
      id: uid(),
      name: "game_of_life.py",
      content: `"""康威生命游戏 —— 编辑器与预览均有 Python 高亮"""
from typing import List

Grid = List[List[int]]


def step(grid: Grid) -> Grid:
    rows, cols = len(grid), len(grid[0])
    nxt = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            n = sum(
                grid[(r + dr) % rows][(c + dc) % cols]
                for dr in (-1, 0, 1)
                for dc in (-1, 0, 1)
                if (dr, dc) != (0, 0)
            )
            alive = grid[r][c]
            nxt[r][c] = int(alive and n in (2, 3) or not alive and n == 3)
    return nxt


glider = [[0, 1, 0], [0, 0, 1], [1, 1, 1]]
g = glider
for _ in range(4):
    g = step(g)
print("\\n".join("".join("█" if cell else "·" for cell in row) for row in g))
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

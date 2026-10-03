import { describe, it, expect } from "vitest";
import { extractOutline } from "./outline";

describe("extractOutline", () => {
  it("should extract ATX headings with correct levels and line numbers", () => {
    const md = `# 标题 1
正文内容

## 标题 2
更多内容

### 标题 3`;

    const result = extractOutline(md);
    expect(result).toEqual([
      { level: 1, text: "标题 1", line: 1 },
      { level: 2, text: "标题 2", line: 4 },
      { level: 3, text: "标题 3", line: 7 },
    ]);
  });

  it("should ignore headings and comments inside code blocks", () => {
    const md = `# 真正的大纲标题

\`\`\`python
# 这是 Python 注释，绝不能成为大纲标题
def test():
    pass
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

## 第二个大纲标题`;

    const result = extractOutline(md);
    expect(result).toEqual([
      { level: 1, text: "真正的大纲标题", line: 1 },
      { level: 2, text: "第二个大纲标题", line: 10 },
    ]);
  });

  it("should not treat ```python as closing fence when already inside code block", () => {
    const md = `\`\`\`\`markdown
# 代码块内的 Markdown 标题示例
\`\`\`python
print("hello")
# 注释
\`\`\`
\`\`\`\`

# 外部真正的标题`;

    const result = extractOutline(md);
    // 只有外部真正的标题才能被提取
    expect(result).toEqual([{ level: 1, text: "外部真正的标题", line: 9 }]);
  });

  it("should support nested fences when outer fence has 4 backticks", () => {
    const md = `# 顶部标题

\`\`\`\`markdown
\`\`\`python
# 内层注释不被解析
print("hello")
\`\`\`
\`\`\`\`

# 底部标题`;

    const result = extractOutline(md);
    expect(result).toEqual([
      { level: 1, text: "顶部标题", line: 1 },
      { level: 1, text: "底部标题", line: 10 },
    ]);
  });

  it("should correctly extract outline for 多语言代码示例文档.md without code comments", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../../docs/多语言代码示例文档.md");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const outline = extractOutline(content);

      // 应当提取出真实的大纲标题
      expect(outline[0]).toEqual({
        level: 1,
        text: "多语言代码示例文档",
        line: 3,
      });
      expect(outline[1]).toEqual({
        level: 2,
        text: "目录",
        line: 7,
      });
      expect(outline.some((item) => item.text === "Python")).toBe(true);
      expect(outline.some((item) => item.text === "JavaScript")).toBe(true);
      expect(outline.some((item) => item.text === "总结")).toBe(true);

      // 代码内的注释绝不能作为大纲标题出现
      expect(outline.some((item) => item.text.includes("[0, 1, 1, 2"))).toBe(false);
      expect(outline.some((item) => item.text === "配置文件示例")).toBe(false);
      expect(outline.some((item) => item.text === "检查参数")).toBe(false);
    }
  });
});

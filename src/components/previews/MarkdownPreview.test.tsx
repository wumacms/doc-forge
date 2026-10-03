// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import MarkdownPreview from "./MarkdownPreview";
import type { WsFile } from "@/types";

afterEach(() => {
  cleanup();
});

describe("MarkdownPreview code blocks", () => {
  const sampleMarkdown = `
# 标题测试

下面是一段 Java 代码：

\`\`\`java
public class Box<T> {
    private T value;

    public void set(T value) { this.value = value; }
    public T get() { return value; }

    public static void main(String[] args) {
        Box<String> box = new Box<>();
        box.set("Hello");
        System.out.println(box.get());
    }
}
\`\`\`
`;

  const file: WsFile = {
    id: "f1",
    kind: "file",
    name: "test.md",
    content: sampleMarkdown,
  };

  it("renders the language identifier in the code block title bar", () => {
    render(<MarkdownPreview file={file} />);

    // 验证标题栏左侧正确显示语言标识 "java"
    const langLabel = screen.getByText("java");
    expect(langLabel).toBeDefined();

    // 验证包含复制按钮
    const copyButton = screen.getByRole("button", { name: /复制代码块|已复制/i });
    expect(copyButton).toBeDefined();
    expect(screen.getByText("复制")).toBeDefined();
  });

  it("copies markdown code block with language identifier when copy button clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<MarkdownPreview file={file} />);

    const copyButton = screen.getByRole("button", { name: /复制代码块/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    const copiedText = writeTextMock.mock.calls[0][0];
    // 验证复制的内容包含语言标识及反引号围栏
    expect(copiedText.startsWith("```java\n")).toBe(true);
    expect(copiedText.endsWith("\n```")).toBe(true);
    expect(copiedText).toContain("public class Box<T>");

    // 验证按钮状态变为 "已复制"
    await waitFor(() => {
      expect(screen.getByText("已复制")).toBeDefined();
    });
  });
});

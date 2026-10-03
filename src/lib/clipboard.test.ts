// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { formatCodeBlockForCopy, copyToClipboard } from "./clipboard";

describe("clipboard utils", () => {
  describe("formatCodeBlockForCopy", () => {
    it("should format code block with language identifier", () => {
      const code = `public class Box<T> {
    private T value;

    public void set(T value) { this.value = value; }
    public T get() { return value; }

    public static void main(String[] args) {
        Box<String> box = new Box<>();
        box.set("Hello");
        System.out.println(box.get());
    }
}`;
      const formatted = formatCodeBlockForCopy(code, "java");
      expect(formatted).toBe(`\`\`\`java
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
\`\`\``);
    });

    it("should format code block without language if lang is empty", () => {
      const code = "console.log('test');";
      const formatted = formatCodeBlockForCopy(code, "");
      expect(formatted).toBe("```\nconsole.log('test');\n```");
    });

    it("should trim and lowercase language tag", () => {
      const code = "print('hello')";
      const formatted = formatCodeBlockForCopy(code, "  PYTHON ");
      expect(formatted).toBe("```python\nprint('hello')\n```");
    });

    it("should strip trailing newline from code block to avoid double newline before closing fence", () => {
      const code = "echo 'hi'\n";
      const formatted = formatCodeBlockForCopy(code, "bash");
      expect(formatted).toBe("```bash\necho 'hi'\n```");
    });

    it("should escape code blocks containing triple backticks with four backticks", () => {
      const code = "```javascript\nconst a = 1;\n```";
      const formatted = formatCodeBlockForCopy(code, "markdown");
      expect(formatted).toBe("````markdown\n```javascript\nconst a = 1;\n```\n````");
    });
  });

  describe("copyToClipboard", () => {
    const originalClipboard = navigator.clipboard;

    afterEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        writable: true,
      });
      vi.restoreAllMocks();
    });

    it("should use navigator.clipboard.writeText when available", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const success = await copyToClipboard("test code");
      expect(writeTextMock).toHaveBeenCalledWith("test code");
      expect(success).toBe(true);
    });

    it("should fallback to document.execCommand when clipboard API fails", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const success = await copyToClipboard("fallback text");
      expect(execCommandMock).toHaveBeenCalledWith("copy");
      expect(success).toBe(true);
    });
  });
});

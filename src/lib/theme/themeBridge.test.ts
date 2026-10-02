/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { extractMonacoTokens, getCurrentMermaidTheme } from "./themeBridge";
import { THEME_REGISTRY, DEFAULT_THEME_ID } from "@/styles/themeRegistry";

describe("themeRegistry", () => {
  it("contains default themes with valid metadata", () => {
    expect(THEME_REGISTRY.length).toBeGreaterThanOrEqual(3);
    const defaultTheme = THEME_REGISTRY.find((t) => t.id === DEFAULT_THEME_ID);
    expect(defaultTheme).toBeDefined();
    expect(defaultTheme?.id).toBe("docforge");
  });
});

describe("themeBridge", () => {
  it("extracts monaco tokens in light mode", () => {
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-style");
    const tokens = extractMonacoTokens(false);
    expect(tokens.isDark).toBe(false);
    expect(tokens.styleName).toBe("docforge");
    expect(tokens.bg.startsWith("#")).toBe(true);
    expect(tokens.fg.startsWith("#")).toBe(true);
    expect(tokens.syntax.keyword.startsWith("#")).toBe(true);
    expect(tokens.syntax.comment.startsWith("#")).toBe(true);
  });

  it("extracts monaco tokens in dark mode with custom style", () => {
    document.documentElement.className = "dark";
    document.documentElement.setAttribute("data-style", "nord");
    const tokens = extractMonacoTokens(true);
    expect(tokens.isDark).toBe(true);
    expect(tokens.styleName).toBe("nord");
    expect(tokens.bg.startsWith("#")).toBe(true);
  });

  it("determines mermaid theme based on class and variables", () => {
    document.documentElement.className = "dark";
    expect(getCurrentMermaidTheme()).toBe("dark");

    document.documentElement.className = "";
    expect(getCurrentMermaidTheme()).toBe("neutral");
  });
});

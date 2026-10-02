import { describe, expect, it } from "vitest";
import { oklchToHex } from "./colorMath";

describe("colorMath", () => {
  it("converts pure white and pure black accurately", () => {
    expect(oklchToHex("oklch(1.0 0 0)")).toBe("#ffffff");
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000");
  });

  it("converts docforge theme tokens accurately", () => {
    // index.css foreground: oklch(0.1884 0.0128 248.5103) -> #0f1419
    const hex = oklchToHex("oklch(0.1884 0.0128 248.5103)");
    expect(hex).toBe("#0f1419");
  });

  it("handles fallback and already-hex values", () => {
    expect(oklchToHex("#123456")).toBe("#123456");
    expect(oklchToHex("#fff")).toBe("#ffffff");
    expect(oklchToHex("invalid", "#abcdef")).toBe("#abcdef");
  });
});

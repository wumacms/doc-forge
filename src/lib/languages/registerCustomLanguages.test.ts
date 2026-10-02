import { describe, it, expect, vi } from "vitest";
import {
  registerJsonLanguage,
  registerVueLanguage,
  registerCustomLanguages,
} from "./registerCustomLanguages";

describe("registerCustomLanguages", () => {
  function createMockMonaco() {
    const registeredLangs: { id: string }[] = [];
    const monarchProviders = new Map<string, any>();
    const langConfigs = new Map<string, any>();

    return {
      languages: {
        getLanguages: vi.fn(() => registeredLangs),
        register: vi.fn((def) => {
          registeredLangs.push(def);
        }),
        setLanguageConfiguration: vi.fn((id, config) => {
          langConfigs.set(id, config);
        }),
        setMonarchTokensProvider: vi.fn((id, provider) => {
          monarchProviders.set(id, provider);
        }),
      },
      registeredLangs,
      monarchProviders,
      langConfigs,
    };
  }

  it("registers JSON language configuration and monarch tokenizer", () => {
    const mock = createMockMonaco();
    registerJsonLanguage(mock as any);

    expect(mock.langConfigs.has("json")).toBe(true);
    expect(mock.monarchProviders.has("json")).toBe(true);

    const jsonMonarch = mock.monarchProviders.get("json");
    expect(jsonMonarch.tokenizer.root).toBeDefined();
    expect(jsonMonarch.keywords).toContain("true");
    expect(jsonMonarch.keywords).toContain("false");
    expect(jsonMonarch.keywords).toContain("null");
  });

  it("registers Vue language with template, script and style sections", () => {
    const mock = createMockMonaco();
    registerVueLanguage(mock as any);

    expect(mock.registeredLangs.some((l) => l.id === "vue")).toBe(true);
    expect(mock.langConfigs.has("vue")).toBe(true);
    expect(mock.monarchProviders.has("vue")).toBe(true);

    const vueMonarch = mock.monarchProviders.get("vue");
    expect(vueMonarch.tokenizer.root).toBeDefined();
    expect(vueMonarch.tokenizer.templateBody).toBeDefined();
    expect(vueMonarch.tokenizer.tagAttributes).toBeDefined();
    expect(vueMonarch.tokenizer.scriptTs).toBeDefined();
    expect(vueMonarch.tokenizer.scriptJs).toBeDefined();
    expect(vueMonarch.tokenizer.styleCss).toBeDefined();
  });

  it("registers both via registerCustomLanguages", () => {
    const mock = createMockMonaco();
    registerCustomLanguages(mock as any);

    expect(mock.monarchProviders.has("json")).toBe(true);
    expect(mock.monarchProviders.has("vue")).toBe(true);
  });
});

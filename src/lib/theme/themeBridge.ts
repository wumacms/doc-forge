import { oklchToHex } from "./colorMath";

export type MonacoInstance = typeof import("monaco-editor");

let activeMonaco: MonacoInstance | null = null;

export function setMonacoInstance(monaco: MonacoInstance): void {
  activeMonaco = monaco;
}

export interface ComputedMonacoTokens {
  bg: string;
  fg: string;
  lineNo: string;
  lineNoActive: string;
  lineHighlight: string;
  selection: string;
  widgetBg: string;
  widgetBorder: string;
  gutterBg: string;
  scrollThumb: string;
  isDark: boolean;
  styleName: string;
  syntax: {
    comment: string;
    keyword: string;
    string: string;
    number: string;
    title: string;
    attr: string;
    builtin: string;
  };
}

/**
 * 从 DOM 根节点读取当前生效的计算属性并转换为 Hex
 * 具备双层 fallback：优先读取 --monaco-*，缺失时回退至对应 --color-*，再缺失时使用安全底色
 */
export function extractMonacoTokens(explicitDark?: boolean): ComputedMonacoTokens {
  if (typeof document === "undefined") {
    const isDark = explicitDark ?? false;
    return {
      bg: isDark ? "#000000" : "#ffffff",
      fg: isDark ? "#e7e9ea" : "#0f1419",
      lineNo: isDark ? "#6f7680" : "#8b95a1",
      lineNoActive: isDark ? "#ffffff" : "#000000",
      lineHighlight: isDark ? "#061622" : "#e3ecf6",
      selection: isDark ? "#061622" : "#e3ecf6",
      widgetBg: isDark ? "#17181c" : "#f7f8f8",
      widgetBorder: isDark ? "#242628" : "#e1eaef",
      gutterBg: isDark ? "#000000" : "#ffffff",
      scrollThumb: isDark ? "#181818" : "#e5e5e6",
      isDark,
      styleName: "docforge",
      syntax: {
        comment: isDark ? "#6f7680" : "#8b95a1",
        keyword: isDark ? "#c678dd" : "#a626a4",
        string: isDark ? "#98c379" : "#50a14f",
        number: isDark ? "#d19a66" : "#986801",
        title: isDark ? "#61afef" : "#4078f2",
        attr: isDark ? "#e5c07b" : "#b76b01",
        builtin: isDark ? "#56b6c2" : "#0184bc",
      },
    };
  }

  const root = document.documentElement;
  const isDark = explicitDark ?? root.classList.contains("dark");
  const styleName = root.getAttribute("data-style") || "docforge";
  const computed = getComputedStyle(root);

  const getVarHex = (varName: string, fallbackVar: string, fallbackHex: string): string => {
    const val = computed.getPropertyValue(varName).trim();
    if (val) return oklchToHex(val, fallbackHex);
    const fbVal = computed.getPropertyValue(fallbackVar).trim();
    if (fbVal) return oklchToHex(fbVal, fallbackHex);
    return fallbackHex;
  };

  const defaultBg = isDark ? "#000000" : "#ffffff";
  const defaultFg = isDark ? "#e7e9ea" : "#0f1419";
  const defaultMuted = isDark ? "#181818" : "#e5e5e6";
  const defaultAccent = isDark ? "#061622" : "#e3ecf6";
  const defaultBorder = isDark ? "#242628" : "#e1eaef";

  const defaultComment = isDark ? "#6f7680" : "#8b95a1";
  const defaultKeyword = isDark ? "#c678dd" : "#a626a4";
  const defaultString = isDark ? "#98c379" : "#50a14f";
  const defaultNumber = isDark ? "#d19a66" : "#986801";
  const defaultTitle = isDark ? "#61afef" : "#4078f2";
  const defaultAttr = isDark ? "#e5c07b" : "#b76b01";
  const defaultBuiltin = isDark ? "#56b6c2" : "#0184bc";

  const syntax = {
    comment: getVarHex("--hljs-comment", "--color-muted-foreground", defaultComment),
    keyword: getVarHex("--hljs-keyword", "--color-primary", defaultKeyword),
    string: getVarHex("--hljs-string", "--color-accent-foreground", defaultString),
    number: getVarHex("--hljs-number", "--color-destructive", defaultNumber),
    title: getVarHex("--hljs-title", "--color-foreground", defaultTitle),
    attr: getVarHex("--hljs-attr", "--color-primary", defaultAttr),
    builtin: getVarHex("--hljs-built_in", "--color-foreground", defaultBuiltin),
  };

  return {
    bg: getVarHex("--monaco-bg", "--color-background", defaultBg),
    fg: getVarHex("--monaco-fg", "--color-foreground", defaultFg),
    lineNo: getVarHex("--monaco-line-number", "--color-muted-foreground", isDark ? "#6f7680" : "#8b95a1"),
    lineNoActive: getVarHex("--monaco-line-number-active", "--color-foreground", defaultFg),
    lineHighlight: getVarHex("--monaco-line-highlight", "--color-accent", defaultAccent),
    selection: getVarHex("--monaco-selection", "--color-accent", defaultAccent),
    widgetBg: getVarHex("--monaco-widget-bg", "--color-card", isDark ? "#17181c" : "#f7f8f8"),
    widgetBorder: getVarHex("--monaco-widget-border", "--color-border", defaultBorder),
    gutterBg: getVarHex("--monaco-gutter-bg", "--color-background", defaultBg),
    scrollThumb: getVarHex("--monaco-scroll-thumb", "--color-muted", defaultMuted),
    isDark,
    styleName,
    syntax,
  };
}

/** 已注册主题的缓存，避免重复 defineTheme */
const registeredThemes = new Set<string>();

/**
 * 同步 Monaco 主题：
 * 1. 动态生成 themeId，如 "docforge-nord-dark"
 * 2. 提取 DOM CSS 变量实时转换为 Hex 字典
 * 3. 注入对应主题的语法高亮规则（覆盖关键字、字符串、注释等）
 * 4. 注册并切换主题
 */
export function syncMonacoThemeDynamic(
  dark?: boolean,
  customMonaco?: MonacoInstance,
): void {
  if (typeof document === "undefined") return;

  const m =
    customMonaco ??
    activeMonaco ??
    (typeof window !== "undefined"
      ? (window as unknown as { monaco?: MonacoInstance }).monaco
      : null);
  if (!m || !m.editor) return;

  const tokens = extractMonacoTokens(dark);
  const themeId = `docforge-${tokens.styleName}-${tokens.isDark ? "dark" : "light"}`;

  try {
    // 每次风格或明暗切换时重新注册或覆盖，确保 CSS 变量热更新即时反映
    m.editor.defineTheme(themeId, {
      base: tokens.isDark ? "vs-dark" : "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: tokens.syntax.comment.replace("#", "") },
        { token: "quote", foreground: tokens.syntax.comment.replace("#", "") },
        { token: "keyword", foreground: tokens.syntax.keyword.replace("#", "") },
        { token: "string", foreground: tokens.syntax.string.replace("#", "") },
        { token: "number", foreground: tokens.syntax.number.replace("#", "") },
        { token: "type", foreground: tokens.syntax.title.replace("#", "") },
        { token: "tag", foreground: tokens.syntax.keyword.replace("#", "") },
        { token: "attribute.name", foreground: tokens.syntax.attr.replace("#", "") },
        { token: "attribute.value", foreground: tokens.syntax.string.replace("#", "") },
        { token: "variable", foreground: tokens.syntax.builtin.replace("#", "") },
        { token: "variable.source", foreground: tokens.fg.replace("#", "") },
        { token: "meta.separator", foreground: tokens.syntax.comment.replace("#", "") },
        // JSON 专属高亮规则：key 与 value 鲜明区分
        { token: "string.key", foreground: tokens.syntax.attr.replace("#", "") },
        { token: "string.key.json", foreground: tokens.syntax.attr.replace("#", "") },
        { token: "string.value", foreground: tokens.syntax.string.replace("#", "") },
        { token: "string.value.json", foreground: tokens.syntax.string.replace("#", "") },
        { token: "number.json", foreground: tokens.syntax.number.replace("#", "") },
        { token: "keyword.json", foreground: tokens.syntax.keyword.replace("#", "") },
        { token: "delimiter.bracket.json", foreground: tokens.fg.replace("#", "") },
        { token: "delimiter.colon.json", foreground: tokens.fg.replace("#", "") },
        { token: "delimiter.comma.json", foreground: tokens.fg.replace("#", "") },
      ],
      colors: {
        "editor.background": tokens.bg,
        "editor.foreground": tokens.fg,
        "editorLineNumber.foreground": tokens.lineNo,
        "editorLineNumber.activeForeground": tokens.lineNoActive,
        "editor.lineHighlightBackground": tokens.lineHighlight,
        "editor.selectionBackground": tokens.selection,
        "editorWidget.background": tokens.widgetBg,
        "editorWidget.border": tokens.widgetBorder,
        "editorGutter.background": tokens.gutterBg,
        "scrollbarSlider.background": tokens.scrollThumb,
        "minimap.background": tokens.bg,
      },
    });
    registeredThemes.add(themeId);
    m.editor.setTheme(themeId);
  } catch (e) {
    console.warn("[ThemeBridge] Monaco 动态主题定义失败，回退至内置主题：", e);
    try {
      m.editor.setTheme(tokens.isDark ? "vs-dark" : "vs");
    } catch {
      // 容错静默
    }
  }
}

/**
 * 获取当前生效的 Mermaid 主题标识
 */
export function getCurrentMermaidTheme(): "neutral" | "dark" | "default" | "forest" {
  if (typeof document === "undefined") return "neutral";
  const root = document.documentElement;
  const raw = getComputedStyle(root).getPropertyValue("--mermaid-theme").trim();
  if (raw === "dark" || raw === "default" || raw === "forest" || raw === "neutral") {
    return raw;
  }
  return root.classList.contains("dark") ? "dark" : "neutral";
}

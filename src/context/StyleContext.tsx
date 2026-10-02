import React, { createContext, useContext, useEffect, useState } from "react";
import { THEME_REGISTRY, DEFAULT_THEME_ID, type ThemeMeta } from "@/styles/themeRegistry";
import { syncMonacoThemeDynamic } from "@/lib/theme/themeBridge";

interface StyleContextValue {
  style: string;
  setStyle: (style: string) => void;
  availableStyles: ThemeMeta[];
  currentMeta: ThemeMeta;
}

const StyleContext = createContext<StyleContextValue | null>(null);

const STORAGE_KEY = "docforge_style";

export function StyleProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyleState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME_ID;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEME_REGISTRY.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // 容错降级
    }
    return DEFAULT_THEME_ID;
  });

  const setStyle = (newStyle: string) => {
    if (!THEME_REGISTRY.some((t) => t.id === newStyle)) {
      newStyle = DEFAULT_THEME_ID;
    }
    setStyleState(newStyle);
    try {
      localStorage.setItem(STORAGE_KEY, newStyle);
    } catch {
      // 容错静默
    }
  };

  // 1. 同步 DOM 属性 data-style
  useEffect(() => {
    const root = document.documentElement;
    if (style === DEFAULT_THEME_ID) {
      root.removeAttribute("data-style");
    } else {
      root.setAttribute("data-style", style);
    }

    // 主题切换后立即同步 Monaco
    syncMonacoThemeDynamic();
  }, [style]);

  // 2. 监听 DOM class (.dark) 和 data-style 变动，确保 Monaco 始终保持色彩同步
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes") {
          syncMonacoThemeDynamic();
          break;
        }
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-style"],
    });

    return () => observer.disconnect();
  }, []);

  const currentMeta =
    THEME_REGISTRY.find((t) => t.id === style) || THEME_REGISTRY[0];

  return (
    <StyleContext.Provider
      value={{
        style,
        setStyle,
        availableStyles: THEME_REGISTRY,
        currentMeta,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
}

export function useDocTheme(): StyleContextValue {
  const ctx = useContext(StyleContext);
  if (!ctx) {
    throw new Error("useDocTheme must be used within StyleProvider");
  }
  return ctx;
}

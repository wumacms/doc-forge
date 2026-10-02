import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useDocTheme } from "@/context/StyleContext";
import { Sun, Moon, Palette, Check, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { style, setStyle, availableStyles, currentMeta } = useDocTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <div className="flex items-center border border-border bg-background">
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground"
          aria-label="加载主题"
        >
          <Palette className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">主题</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center border border-border bg-background">
      {/* 快捷明暗一键切换按钮 */}
      <button
        type="button"
        title={isDark ? "切换为浅色模式" : "切换为深色模式"}
        aria-label={isDark ? "切换为浅色模式" : "切换为深色模式"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {isDark ? (
          <Moon className="h-4 w-4" aria-hidden />
        ) : (
          <Sun className="h-4 w-4" aria-hidden />
        )}
      </button>

      {/* 风格与主题下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="选择风格主题与偏好"
            aria-label="选择风格主题与偏好"
            className="flex items-center gap-1.5 border-l border-border px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Palette className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{currentMeta.label}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            视觉风格 (Style)
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={style}
            onValueChange={setStyle}
            className="max-h-72 overflow-y-auto pr-1"
          >
            {availableStyles.map((item) => {
              const preview = isDark
                ? item.previewColors.dark
                : item.previewColors.light;
              const isSelected = style === item.id;
              return (
                <DropdownMenuRadioItem
                  key={item.id}
                  value={item.id}
                  className="flex cursor-pointer items-center justify-between py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {/* 预览色块 */}
                    <div
                      className="flex h-4 w-4 items-center justify-center border border-border shadow-xs"
                      style={{ backgroundColor: preview[1] }}
                      title={`背景: ${preview[1]}`}
                    >
                      <div
                        className="h-2 w-2"
                        style={{ backgroundColor: preview[0] }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            明暗模式 (Appearance)
          </DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1 px-1 py-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-1 border p-1.5 text-[11px] transition-colors ${
                theme === "light"
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>浅色</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-1 border p-1.5 text-[11px] transition-colors ${
                theme === "dark"
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>深色</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-1 border p-1.5 text-[11px] transition-colors ${
                theme === "system"
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>跟随</span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

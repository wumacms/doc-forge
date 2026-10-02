/**
 * 纯数学色彩空间转换工具：
 * 基于 Björn Ottosson 的 Oklab 色彩模型，将 oklch(L C H) 解析并转换为标准 7 位 sRGB 十六进制色值 (#rrggbb)。
 * 运行于纯 JS 环境，无 DOM canvas 依赖，避免旧版浏览器/特定环境解析 oklch 返回 #000000 导致黑底黑字问题。
 */

/**
 * 将 CSS 颜色字符串（主要是 oklch）转换为 hex
 * 支持格式示例：
 * - "oklch(0.6723 0.1606 244.9955)"
 * - "oklch(0.97 0.01 230 / 0.8)" (忽略 alpha 或默认返回 hex)
 * - "#ffffff", "rgb(255, 255, 255)" 直接透传或简单标准化
 */
export function oklchToHex(colorStr: string, fallbackHex = "#888888"): string {
  if (!colorStr) return fallbackHex;
  const trimmed = colorStr.trim();

  // 若已经是十六进制颜色
  if (trimmed.startsWith("#")) {
    if (trimmed.length === 4) {
      // #abc -> #aabbcc
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase();
    }
    return trimmed.slice(0, 7).toLowerCase();
  }

  // 若为 rgb/rgba 格式: rgb(r, g, b) 或 rgb(r g b)
  const rgbMatch = trimmed.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgbMatch) {
    const r = Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[1]))));
    const g = Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[2]))));
    const b = Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[3]))));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // 解析 oklch(L C H) 或 oklch(L C H / alpha)
  const oklchMatch = trimmed.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!oklchMatch) {
    return fallbackHex;
  }

  const L = oklchMatch[1].endsWith("%")
    ? parseFloat(oklchMatch[1]) / 100
    : parseFloat(oklchMatch[1]);
  const C = parseFloat(oklchMatch[2]);
  const H = parseFloat(oklchMatch[3]);

  if (Number.isNaN(L) || Number.isNaN(C) || Number.isNaN(H)) {
    return fallbackHex;
  }

  // 1. Oklch 极坐标 -> Oklab 直角坐标
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // 2. Oklab -> 锥体响应 (LMS 空间立方)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  // 3. LMS -> 线性 sRGB
  const rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // 4. 标准 sRGB Gamma 矫正与截断 (Clamp 0~1)
  const toSrgb = (val: number) => {
    const c = Math.max(0, Math.min(1, val));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(rLinear) * 255);
  const g = Math.round(toSrgb(gLinear) * 255);
  const bl = Math.round(toSrgb(bLinear) * 255);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`.toLowerCase();
}

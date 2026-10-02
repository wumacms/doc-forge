/* 将 index.css 中的 oklch 令牌转为 hex（Ottosson Oklab -> sRGB） */
const fs = require("fs");
const css = fs.readFileSync("src/index.css", "utf-8");

function oklchToHex(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const f = (c) => {
    c = Math.max(0, Math.min(1, c));
    c = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(r)}${f(g)}${f(bl)}`;
}

function parseBlock(re) {
  const block = css.match(re)?.[0] ?? "";
  const out = {};
  for (const m of block.matchAll(/--color-([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) {
    out[m[1]] = oklchToHex(+m[2], +m[3], +m[4]);
  }
  return out;
}

const light = parseBlock(/@theme inline \{[^}]*\}/s);
const dark = parseBlock(/\.dark \{[^}]*\}/s);

const need = ["background", "foreground", "card", "muted", "muted-foreground", "accent", "border", "primary", "input"];
const fmt = (obj) =>
  need.map((k) => `  ${k}: "${obj[k] ?? "?"}"`).join(",\n");

console.log("LIGHT = {\n" + fmt(light) + "\n};");
console.log("DARK = {\n" + fmt(dark) + "\n};");

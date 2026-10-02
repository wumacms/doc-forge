/**
 * 主题元数据注册表
 * 用于供顶部导航栏下拉选择器、预览色块渲染以及运行时校验合法主题 ID
 */

export interface ThemeMeta {
  id: string;
  label: string;
  description: string;
  previewColors: {
    light: [string, string]; // [primary, bg]
    dark: [string, string];
  };
}

export const DEFAULT_THEME_ID = "docforge";

export const THEME_REGISTRY: ThemeMeta[] = [
  {
    id: "docforge",
    label: "DocForge",
    description: "高对比度极简工程风格，经典纯黑白",
    previewColors: {
      light: ["#2563eb", "#ffffff"],
      dark: ["#3b82f6", "#000000"],
    },
  },
  {
    id: "github",
    label: "GitHub Primer",
    description: "GitHub 官方设计系统，阅读亲和力高",
    previewColors: {
      light: ["#0969da", "#ffffff"],
      dark: ["#2f81f7", "#0d1117"],
    },
  },
  {
    id: "nord",
    label: "Nord 极光",
    description: "北极冰雪冷色调，柔和低饱和，舒适护眼",
    previewColors: {
      light: ["#5e81ac", "#eceff4"],
      dark: ["#88c0d0", "#2e3440"],
    },
  },
  {
    id: "dracula",
    label: "Dracula 吸血鬼",
    description: "经典暗黑赛博风格，高饱和紫粉冷色反差",
    previewColors: {
      light: ["#9333ea", "#faf5ff"],
      dark: ["#bd93f9", "#282a36"],
    },
  },
  {
    id: "one-dark",
    label: "One Dark Pro",
    description: "Atom / VS Code 经典配色，层次丰富温润",
    previewColors: {
      light: ["#4078f2", "#fafafa"],
      dark: ["#61afef", "#282c34"],
    },
  },
  {
    id: "solarized",
    label: "Solarized 日光",
    description: "经典冷暖日光科学色相，学术审阅与长文写作",
    previewColors: {
      light: ["#268bd2", "#fdf6e3"],
      dark: ["#2aa198", "#002b36"],
    },
  },
  {
    id: "catppuccin",
    label: "Catppuccin 柔和",
    description: "马卡龙与低饱和度柔美色彩，舒适防疲劳",
    previewColors: {
      light: ["#8839ef", "#eff1f5"],
      dark: ["#cba6f7", "#1e1e2e"],
    },
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night 霓虹",
    description: "东京涉谷暗夜与霓虹街景，现代深邃美感",
    previewColors: {
      light: ["#2e7de9", "#e1e2e7"],
      dark: ["#7aa2f7", "#1a1b26"],
    },
  },
  {
    id: "coffee",
    label: "Coffee 醇香咖啡",
    description: "丝滑拿铁与深焙意式浓缩，温暖治愈",
    previewColors: {
      light: ["#9c5821", "#faf6ef"],
      dark: ["#d6944e", "#201813"],
    },
  },
  {
    id: "monokai",
    label: "Monokai 经典",
    description: "Sublime 传奇黑金黑绿，高饱和视觉冲击",
    previewColors: {
      light: ["#f92672", "#f8f8f2"],
      dark: ["#f92672", "#272822"],
    },
  },
  {
    id: "gruvbox",
    label: "Gruvbox 大地",
    description: "Vim 社区圣经级复古怀旧胶片，耐看柔和",
    previewColors: {
      light: ["#d65d0e", "#fbf1c7"],
      dark: ["#fe8019", "#282828"],
    },
  },
  {
    id: "rose-pine",
    label: "Rose Pine 蔷薇松木",
    description: "北欧森林冷调底配干枯蔷薇粉，静谧文艺",
    previewColors: {
      light: ["#d7827e", "#faf4ed"],
      dark: ["#ebbcba", "#191724"],
    },
  },
  {
    id: "everforest",
    label: "Everforest 常青树",
    description: "漫步雨后森林深绿，极度护眼自然调",
    previewColors: {
      light: ["#8da101", "#fdf6e3"],
      dark: ["#a7c080", "#2d353b"],
    },
  },
  {
    id: "sepia",
    label: "Sepia 羊皮纸",
    description: "Kindle 与古籍泛黄纸张墨韵，长文精读专精",
    previewColors: {
      light: ["#8b5523", "#f5ecd7"],
      dark: ["#cfa058", "#201a15"],
    },
  },
  {
    id: "editorial",
    label: "Editorial 报刊印刷",
    description: "纽约时报哑光油墨极简黑白，无干扰排版",
    previewColors: {
      light: ["#202020", "#f7f7f8"],
      dark: ["#ffffff", "#131314"],
    },
  },
  {
    id: "synthwave",
    label: "Synthwave '84",
    description: "80 年代复古街机电光霓虹粉青，未来科幻",
    previewColors: {
      light: ["#db2777", "#fdf2f8"],
      dark: ["#ff7edb", "#241b2f"],
    },
  },
  {
    id: "jetbrains",
    label: "JetBrains Darcula",
    description: "IntelliJ IDEA 工业级稳健深灰，工程师肌肉记忆",
    previewColors: {
      light: ["#3574f0", "#f8f8f8"],
      dark: ["#cc7832", "#2b2b2b"],
    },
  },
];

import type * as monaco from "monaco-editor";

/**
 * 注册 JSON 语言的 Monarch 分词解析器：
 * - 纯主线程同步解析，无需依赖复杂的 json.worker.js
 * - 明确区分属性名（key）与属性值（value），消除全单色问题
 * - 支持注释（JSONC 格式）与各种数字、布尔值高亮
 */
export function registerJsonLanguage(m: typeof monaco): void {
  if (!m.languages.getLanguages().some((l) => l.id === "json")) {
    m.languages.register({
      id: "json",
      extensions: [".json", ".jsonc", ".json5", ".map"],
      aliases: ["JSON", "json"],
      mimetypes: ["application/json"],
    });
  }

  m.languages.setLanguageConfiguration("json", {
    wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
    ],
  });

  m.languages.setMonarchTokensProvider("json", {
    defaultToken: "",
    tokenPostfix: ".json",
    keywords: ["true", "false", "null"],
    tokenizer: {
      root: [
        { include: "@whitespace" },

        // 浮点数、整数、科学计数法
        [/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/, "number"],

        // JSON 键名（紧随冒号的字符串）
        [/"(?:[^"\\]|\\.)*"(?=\s*:)/, "string.key"],

        // JSON 字符串值
        [/"(?:[^"\\]|\\.)*"/, "string.value"],

        // 布尔与空值关键字
        [/\b(?:true|false|null)\b/, "keyword"],

        // 标点符号与括号
        [/[{}[\],:]/, "delimiter"],
      ],
      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],
    },
  });
}

/**
 * 注册 Vue SFC（单文件组件）语言分词解析器：
 * - 补齐 Monaco 原生缺失的 Vue 语言注册
 * - 完整支持 <template>（v-* 指令、@事件缩写、:绑定缩写、#插槽、{{ 表达式 }}）
 * - 自动切入 <script setup lang="ts"> / <script> 的 TypeScript/JavaScript 嵌入高亮
 * - 自动切入 <style scoped lang="scss"> / <style> 的 SCSS/CSS 嵌入高亮
 */
export function registerVueLanguage(m: typeof monaco): void {
  if (!m.languages.getLanguages().some((l) => l.id === "vue")) {
    m.languages.register({
      id: "vue",
      extensions: [".vue"],
      aliases: ["Vue", "vue"],
      mimetypes: ["text/x-vue"],
    });
  }

  m.languages.setLanguageConfiguration("vue", {
    comments: {
      blockComment: ["<!--", "-->"],
    },
    brackets: [
      ["<!--", "-->"],
      ["<", ">"],
      ["{", "}"],
      ["(", ")"],
      ["[", "]"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "<", close: ">" },
    ],
    surroundingPairs: [
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "<", close: ">" },
    ],
    folding: {
      markers: {
        start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
        end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->"),
      },
    },
  });

  m.languages.setMonarchTokensProvider("vue", {
    defaultToken: "",
    tokenPostfix: ".vue",
    tokenizer: {
      root: [
        // HTML 注释
        [/<!--/, "comment", "@comment"],

        // <template> 块
        [/(<)(template)/, ["delimiter", { token: "tag", next: "@templateTag" }]],

        // <script setup lang="ts"> / <script lang="ts">
        [
          /(<)(script)([^>]*lang=["'](?:ts|typescript)["'][^>]*)(>)/,
          [
            "delimiter",
            "tag",
            "attribute.name",
            {
              token: "delimiter",
              next: "@scriptTs",
              nextEmbedded: "typescript",
            },
          ],
        ],

        // <script setup> 或普通 <script>
        [
          /(<)(script)([^>]*)(>)/,
          [
            "delimiter",
            "tag",
            "attribute.name",
            {
              token: "delimiter",
              next: "@scriptJs",
              nextEmbedded: "javascript",
            },
          ],
        ],

        // <style scoped lang="scss"> / <style lang="scss">
        [
          /(<)(style)([^>]*lang=["'](?:scss|sass)["'][^>]*)(>)/,
          [
            "delimiter",
            "tag",
            "attribute.name",
            {
              token: "delimiter",
              next: "@styleScss",
              nextEmbedded: "scss",
            },
          ],
        ],

        // <style scoped lang="less">
        [
          /(<)(style)([^>]*lang=["']less["'][^>]*)(>)/,
          [
            "delimiter",
            "tag",
            "attribute.name",
            {
              token: "delimiter",
              next: "@styleLess",
              nextEmbedded: "less",
            },
          ],
        ],

        // <style scoped> 或普通 <style>
        [
          /(<)(style)([^>]*)(>)/,
          [
            "delimiter",
            "tag",
            "attribute.name",
            {
              token: "delimiter",
              next: "@styleCss",
              nextEmbedded: "css",
            },
          ],
        ],

        // 顶层闭合标签
        [/(<\/)(template|script|style)(>)/, ["delimiter", "tag", "delimiter"]],

        // 其他顶层标签或文本
        [/[^<]+/, ""],
      ],

      templateTag: [
        [/>/, "delimiter", "@templateBody"],
        { include: "@tagAttributes" },
      ],

      templateBody: [
        [/<\/template\s*>/, { token: "@rematch", next: "@pop" }],
        [/<!--/, "comment", "@comment"],
        // 插值表达式 {{ ... }}
        [/\{\{/, "delimiter.bracket", "@interpolation"],
        // HTML 标签或自定义组件
        [/(<)([\w-]+)/, ["delimiter", { token: "tag", next: "@otherTag" }]],
        [/(<\/)([\w-]+)(>)/, ["delimiter", "tag", "delimiter"]],
        [/[^<{]+/, ""],
        [/./, ""],
      ],

      interpolation: [
        [/\}\}/, "delimiter.bracket", "@pop"],
        [/[^}]+/, "variable"],
      ],

      otherTag: [
        [/\/?>/, "delimiter", "@pop"],
        { include: "@tagAttributes" },
      ],

      tagAttributes: [
        // Vue 指令：v-if, v-for, v-model 等
        [/[vV]-[\w-]+/, "keyword"],
        // 事件绑定缩写：@click, @submit.prevent
        [/@[\w.-]+/, "keyword"],
        // 动态属性缩写：:prop, :class, :key
        [/:[\w.-]+/, "attribute.name"],
        // 插槽缩写：#header, #default
        [/#[\w.-]+/, "attribute.name"],
        // 常规属性：class, id, style 等
        [/[\w-]+/, "attribute.name"],
        // 等号
        [/=/, "delimiter"],
        // 属性字符串值
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        // 空白
        [/[ \t\r\n]+/, "white"],
      ],

      scriptTs: [
        [/<\/script\s*>/, { token: "delimiter", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]+/, ""],
      ],

      scriptJs: [
        [/<\/script\s*>/, { token: "delimiter", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]+/, ""],
      ],

      styleCss: [
        [/<\/style\s*>/, { token: "delimiter", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]+/, ""],
      ],

      styleScss: [
        [/<\/style\s*>/, { token: "delimiter", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]+/, ""],
      ],

      styleLess: [
        [/<\/style\s*>/, { token: "delimiter", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]+/, ""],
      ],

      comment: [
        [/-->/, "comment", "@pop"],
        [/[^-]+/, "comment"],
        [/./, "comment"],
      ],
    },
  });
}

/**
 * 安装所有扩展语言分词支持
 */
export function registerCustomLanguages(m: typeof monaco): void {
  registerJsonLanguage(m);
  registerVueLanguage(m);
}

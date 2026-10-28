export function grammarFor(path) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs", "py", "sql", "go", "rs", "java"].includes(ext))
    return "code";
  if (["css", "scss", "less"].includes(ext)) return "css";
  if (ext === "json") return "json";
  if (["md", "mdx"].includes(ext)) return "markdown";
  if (["html", "htm", "xml", "svg"].includes(ext)) return "html";
  return "text";
}

const KEYWORDS =
  "await|async|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|interface|let|new|of|return|static|super|switch|this|throw|try|type|typeof|var|void|while|yield|enum|implements|as|def|elif|lambda|None|select|from|where|insert|update|delete|join|group|order|by";

const LITERALS = "true|false|null|undefined|NaN|Infinity";

function escapeHtml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const RULES = {
  code: [
    { name: "comment", re: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*/y },
    { name: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y },
    { name: "number", re: /\b\d+(?:\.\d+)?\b/y },
    { name: "keyword", re: new RegExp(`\\b(?:${KEYWORDS})\\b`, "y") },
    { name: "literal", re: new RegExp(`\\b(?:${LITERALS})\\b`, "y") },
    { name: "fn", re: /\b[A-Za-z_$][\w$]*(?=\s*\()/y },
    { name: "type", re: /\b[A-Z][\w$]*\b/y },
    { name: "punct", re: /[{}()[\];,.:?=+\-*/%<>!&|^~]+/y },
  ],
  css: [
    { name: "comment", re: /\/\*[\s\S]*?\*\//y },
    { name: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
    { name: "type", re: /(?:@[\w-]+|--[\w-]+|\.[\w-]+|#[\w-]+)/y },
    { name: "keyword", re: /[\w-]+(?=\s*:)/y },
    { name: "number", re: /\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw|deg)?\b|#[0-9a-fA-F]{3,8}\b/y },
    { name: "punct", re: /[{}();:,>]+/y },
  ],
  json: [
    { name: "property", re: /"(?:\\.|[^"\\])*"(?=\s*:)/y },
    { name: "string", re: /"(?:\\.|[^"\\])*"/y },
    { name: "number", re: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/iy },
    { name: "literal", re: /\b(?:true|false|null)\b/y },
    { name: "punct", re: /[{}[\],:]+/y },
  ],
  markdown: [
    { name: "comment", re: /^#{1,6} [^\n]*/my },
    { name: "string", re: /`[^`\n]*`|```[\s\S]*?```/y },
    { name: "keyword", re: /\*\*[^*\n]+\*\*|__[^_\n]+__/y },
    { name: "type", re: /\[[^\]\n]*\]\([^)\n]*\)/y },
    { name: "punct", re: /^[-*+>] |^\d+\. /my },
  ],
  html: [
    { name: "comment", re: /<!--[\s\S]*?-->/y },
    { name: "type", re: /<\/?[A-Za-z][\w:-]*/y },
    { name: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
    { name: "keyword", re: /[\w-]+(?==)/y },
    { name: "punct", re: /[<>/=]+/y },
  ],
  text: [],
};

const CLASS = {
  comment: "tok-comment",
  string: "tok-string",
  number: "tok-number",
  keyword: "tok-keyword",
  literal: "tok-literal",
  property: "tok-property",
  fn: "tok-fn",
  type: "tok-type",
  punct: "tok-punct",
};

export function highlight(source, grammar) {
  const rules = RULES[grammar];
  if (!rules.length) return escapeHtml(source);

  let out = "";
  let i = 0;
  let plain = "";

  while (i < source.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(source);
      if (m && m[0].length) {
        if (plain) {
          out += escapeHtml(plain);
          plain = "";
        }
        out += `<span class="${CLASS[rule.name]}">${escapeHtml(m[0])}</span>`;
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += source[i];
      i += 1;
    }
  }
  if (plain) out += escapeHtml(plain);
  return out;
}

export function lineDiff(before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  const setA = new Set(a);
  const setB = new Set(b);
  const rows = [];
  for (const line of a) if (!setB.has(line)) rows.push({ type: "del", text: line });
  for (const line of b) rows.push({ type: setA.has(line) ? "same" : "add", text: line });
  return rows;
}

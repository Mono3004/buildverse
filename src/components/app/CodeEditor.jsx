import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { grammarFor, highlight } from "@/lib/highlight";

export function CodeEditor({
  path,
  value,
  onChange,
  readOnly = false,
  height = "clamp(320px, 52vh, 560px)",
}) {
  const taRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);

  const grammar = useMemo(() => grammarFor(path), [path]);
  const html = useMemo(() => highlight(value + "\n", grammar), [value, grammar]);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  function sync() {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  }

  useLayoutEffect(sync, [value]);
  useEffect(() => {
    if (taRef.current) taRef.current.scrollTop = 0;
  }, [path]);

  function onKeyDown(e) {
    if (readOnly || !onChange) return;
    const ta = e.currentTarget;
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = ta;
      const next = value.slice(0, s) + "  " + value.slice(en);
      onChange(next);
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    }
    if (e.key === "Enter") {
      const s = ta.selectionStart;
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, s))?.[0] ?? "";
      const extra = /[{([]$/.test(value.slice(0, s).trimEnd()) ? "  " : "";
      if (indent || extra) {
        e.preventDefault();
        const insert = "\n" + indent + extra;
        onChange(value.slice(0, s) + insert + value.slice(ta.selectionEnd));
        const pos = s + insert.length;
        requestAnimationFrame(() => ta.setSelectionRange(pos, pos));
      }
    }
  }

  return (
    <div className="relative flex bg-background/40 font-mono text-[13px] leading-6" style={{ height }}>
      <div
        ref={gutterRef}
        aria-hidden
        className="hide-scrollbar w-12 shrink-0 overflow-hidden border-r border-border py-4 text-right text-muted-foreground/60 select-none"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="pr-3">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-auto p-4 whitespace-pre"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <textarea
          ref={taRef}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          onScroll={sync}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`Code editor for ${path}`}
          className="absolute inset-0 resize-none overflow-auto bg-transparent p-4 whitespace-pre text-transparent caret-primary outline-none selection:bg-primary/25"
        />
      </div>
    </div>
  );
}

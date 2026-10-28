import { useMemo, useState } from "react";

function buildTree(files) {
  const root = { name: "", path: "", children: [] };
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    const parts = file.path.split("/").filter(Boolean);
    let cursor = root;
    parts.forEach((part, i) => {
      const isLeaf = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");
      let next = cursor.children.find((c) => c.name === part && !!c.file === isLeaf);
      if (!next) {
        next = { name: part, path, children: [], file: isLeaf ? file : undefined };
        cursor.children.push(next);
      }
      cursor = next;
    });
  }
  const sort = (nodes) =>
    nodes
      .map((n) => ({ ...n, children: sort(n.children) }))
      .sort((a, b) => Number(!!a.file) - Number(!!b.file) || a.name.localeCompare(b.name));
  return sort(root.children);
}

export function FileTree({ files, activePath, dirtyPaths, onOpen, onDelete }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [collapsed, setCollapsed] = useState({});

  const render = (nodes, depth) =>
    nodes.map((node) => {
      const pad = { paddingLeft: `${depth * 12 + 8}px` };
      if (node.file) {
        const isActive = activePath === node.file.path;
        return (
          <li key={node.path} className="group flex items-center gap-1">
            <button
              onClick={() => onOpen(node.file)}
              style={pad}
              className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left font-mono text-xs transition-colors ${
                isActive
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
              }`}
            >
              <span aria-hidden className="opacity-60">
                ▪
              </span>
              <span className="truncate">{node.name}</span>
              {dirtyPaths.has(node.file.path) && (
                <span aria-label="unsaved" className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" />
              )}
            </button>
            <button
              onClick={() => onDelete(node.file)}
              aria-label={`Delete ${node.file.path}`}
              className="px-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
            >
              ✕
            </button>
          </li>
        );
      }
      const isClosed = collapsed[node.path];
      return (
        <li key={node.path}>
          <button
            onClick={() => setCollapsed((p) => ({ ...p, [node.path]: !p[node.path] }))}
            style={pad}
            aria-expanded={!isClosed}
            className="flex w-full items-center gap-1.5 rounded-lg py-1.5 text-left font-mono text-xs text-foreground/80 hover:bg-surface-elevated/60"
          >
            <span aria-hidden className={`transition-transform ${isClosed ? "" : "rotate-90"}`}>
              ›
            </span>
            <span className="truncate">{node.name}</span>
          </button>
          {!isClosed && <ul>{render(node.children, depth + 1)}</ul>}
        </li>
      );
    });

  return <ul className="space-y-0.5">{render(tree, 0)}</ul>;
}

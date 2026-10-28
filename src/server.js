import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import fs from "node:fs";
import path from "node:path";

let serverEntryPromise;

const DEMO_WORKSPACE_DIR = path.resolve(process.cwd(), "demo_workspace");

function ensureDemoWorkspaceExists() {
  if (!fs.existsSync(DEMO_WORKSPACE_DIR)) {
    fs.mkdirSync(DEMO_WORKSPACE_DIR, { recursive: true });
    
    // Seed initial starter files in demo_workspace
    fs.writeFileSync(
      path.join(DEMO_WORKSPACE_DIR, "README.md"),
      "# BuildVerse Local Workspace\n\nSynced directly with `E:\\Heartbeat API\\demo_workspace` on disk.\n\nEdit files in VS Code or in the Web App and click Push / Pull to sync!\n"
    );
    
    const srcDir = path.join(DEMO_WORKSPACE_DIR, "src");
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, "App.jsx"),
      "import React from 'react';\n\nexport default function App() {\n  return (\n    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>\n      <h1>BuildVerse Demo Workspace</h1>\n      <p>Physical disk sync active at E:\\Heartbeat API\\demo_workspace</p>\n    </div>\n  );\n}\n"
    );
    
    fs.writeFileSync(
      path.join(DEMO_WORKSPACE_DIR, "package.json"),
      JSON.stringify({ name: "demo-workspace", version: "1.0.0", private: true }, null, 2)
    );
  }
}

function readFilesRecursively(dirPath, baseDir = dirPath) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name.startsWith(".")) {
      continue;
    }
    if (entry.isDirectory()) {
      results = results.concat(readFilesRecursively(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const content = fs.readFileSync(fullPath, "utf-8");
      results.push({
        id: `f_disk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        path: relativePath,
        content,
        language: relativePath.endsWith(".json") ? "JSON" : relativePath.endsWith(".md") ? "Markdown" : "JavaScript",
        updated_at: new Date().toISOString(),
      });
    }
  }
  return results;
}

async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // REAL LOCAL DISK SYNC API ENDPOINTS FOR E:\Heartbeat API\demo_workspace
    if (url.pathname === "/api/v1/local-sync/pull") {
      try {
        ensureDemoWorkspaceExists();
        const files = readFilesRecursively(DEMO_WORKSPACE_DIR);
        return new Response(
          JSON.stringify({
            success: true,
            folder: DEMO_WORKSPACE_DIR,
            files,
            message: `Pulled ${files.length} physical files from E:\\Heartbeat API\\demo_workspace`,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500 });
      }
    }

    if (url.pathname === "/api/v1/local-sync/push" && request.method === "POST") {
      try {
        ensureDemoWorkspaceExists();
        const body = await request.json();
        const files = body.files || [];

        for (const file of files) {
          if (!file.path) continue;
          const targetPath = path.join(DEMO_WORKSPACE_DIR, file.path);
          const parentDir = path.dirname(targetPath);
          fs.mkdirSync(parentDir, { recursive: true });
          fs.writeFileSync(targetPath, file.content || "", "utf-8");
        }

        return new Response(
          JSON.stringify({
            success: true,
            folder: DEMO_WORKSPACE_DIR,
            count: files.length,
            message: `Pushed ${files.length} files to physical disk at E:\\Heartbeat API\\demo_workspace`,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500 });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return response;
    } catch (error) {
      console.error("[SSR Error Captured]:", error);
      const message = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
      return new Response(
        `<!doctype html>
<html>
  <head><title>SSR Debug Error</title></head>
  <body style="font-family: monospace; padding: 2rem; background: #111; color: #ff6b6b;">
    <h2>Server Side Rendering Error</h2>
    <pre style="white-space: pre-wrap; background: #222; padding: 1rem; border-radius: 8px;">${message}</pre>
    <button onclick="location.reload()" style="padding: 0.5rem 1rem; cursor: pointer; margin-top: 1rem;">Reload Page</button>
  </body>
</html>`,
        {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }
      );
    }
  },
};

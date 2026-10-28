import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { DEFAULT_OBJECTS } from "./ChromeScene";

const ChromeScene = lazy(() => import("./ChromeScene"));

const STORAGE_KEY = "nexus.scene.layout.v1";

function safePosition(position, fallback) {
  if (!Array.isArray(position) || position.length < 3) return fallback;
  const [x, y, z] = position;
  if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") return fallback;
  return [Math.max(-4.8, Math.min(4.8, x)), Math.max(-3.2, Math.min(3.2, y)), z];
}

function loadLayout() {
  if (typeof window === "undefined") return DEFAULT_OBJECTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OBJECTS;
    const saved = JSON.parse(raw);
    return DEFAULT_OBJECTS.map((d) => {
      const hit = saved.find((s) => s.id === d.id);
      return hit ? { ...d, position: safePosition(hit.position, d.position) } : d;
    });
  } catch {
    return DEFAULT_OBJECTS;
  }
}

export function Scene3D({ className = "" }) {
  const [objects, setObjects] = useState(DEFAULT_OBJECTS);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setObjects(loadLayout());
  }, []);

  const persist = useCallback((next) => {
    setObjects(next);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next.map(({ id, position }) => ({ id, position }))),
      );
    } catch {
      /* storage unavailable */
    }
  }, []);

  const reset = useCallback(() => {
    setObjects(DEFAULT_OBJECTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return (
    <>
      <div
        className={`absolute inset-0 touch-none opacity-90 select-none ${placing ? "z-30" : "z-0"} ${className}`}
        aria-hidden
      >
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <ChromeScene objects={objects} placing={placing} onChange={persist} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="pointer-events-auto absolute top-24 right-4 z-50 flex flex-col items-end gap-2 md:top-28 md:right-8">
        <button
          type="button"
          onClick={() => setPlacing((p) => !p)}
          className={`rounded-full border px-3.5 py-1.5 text-[11px] tracking-wide uppercase backdrop-blur transition-colors ${
            placing
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          {placing ? "Done placing" : "Place objects"}
        </button>
        {placing && (
          <>
            <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              Drag any object to rearrange
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              Reset layout
            </button>
          </>
        )}
      </div>
    </>
  );
}

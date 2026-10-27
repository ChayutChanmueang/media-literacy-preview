import { useCallback, useEffect, useRef } from "react";
import { stageScale, textScale } from "./gameViewport";

type Options = {
  gameId: string;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

const debugEnabled = () => {
  try {
    return new URLSearchParams(window.location.search).get("vpdebug") === "1";
  } catch {
    return false;
  }
};

/**
 * Text zoom the browser puts on top of our px sizes (Android WebViews such as LINE can follow the
 * phone's font-size setting): 1 = none. A 100px line should measure 100px.
 */
function measureTextZoom(): number {
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;visibility:hidden;font-size:100px;line-height:1;top:0;left:-9999px";
  probe.textContent = "ก";
  document.body.appendChild(probe);
  const zoom = probe.getBoundingClientRect().height / 100;
  probe.remove();
  return Math.round(zoom * 100) / 100;
}

/**
 * Screen-size scaling for a fun game's root element (one root per phase is fine — pass `ref` to each).
 *
 * Measures the root and sets `--gp-s` / `--gp-t` on it from `stageScale()`, so every gp-* size inside
 * (GameStageHeader, Button3D, …) shrinks smoothly with the screen instead of the 3 steps of the
 * `.gp-compact` media queries — the inline value wins over those, and nothing outside the game changes.
 * Also sets `data-stage-scale` (read by the e2e test), logs one `game_viewport` event per mount, and
 * with `?vpdebug=1` shows the numbers in a corner box for checking on a real phone.
 *
 * `nodeRef` is the root that is mounted now, for games that need `s` themselves (G13's canvas).
 */
export function useStageScale({ gameId, logEvent }: Options) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const debugRef = useRef<HTMLDivElement | null>(null);
  const loggedRef = useRef(false);
  const logRef = useRef(logEvent);

  useEffect(() => {
    logRef.current = logEvent;
  }, [logEvent]);

  const apply = useCallback(
    (el: HTMLElement) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!(w > 0) || !(h > 0)) return;
      const s = stageScale(w, h);
      const t = textScale(s);
      el.style.setProperty("--gp-s", s.toFixed(3));
      el.style.setProperty("--gp-t", t.toFixed(3));
      el.dataset.stageScale = s.toFixed(3);

      const vv = window.visualViewport;
      const info = {
        game_id: gameId,
        inner: `${window.innerWidth}x${window.innerHeight}`,
        visual: vv ? `${Math.round(vv.width)}x${Math.round(vv.height)}@${vv.scale}` : null,
        screen: `${window.screen.width}x${window.screen.height}`,
        dpr: window.devicePixelRatio || 1,
        root: `${Math.round(w)}x${Math.round(h)}`,
        scale: Number(s.toFixed(3)),
      };
      if (!loggedRef.current) {
        loggedRef.current = true;
        logRef.current("game_viewport", { ...info, text_zoom: measureTextZoom() });
      }
      if (debugEnabled()) {
        if (!debugRef.current) {
          const box = document.createElement("div");
          box.setAttribute("aria-hidden", "true");
          box.dataset.devOnly = "vpdebug";
          box.style.cssText =
            "position:fixed;left:4px;bottom:4px;z-index:9999;pointer-events:none;background:rgba(15,23,42,.85);color:#fff;font:14px/1.35 monospace;padding:4px 8px;border-radius:6px;white-space:pre";
          document.body.appendChild(box);
          debugRef.current = box;
        }
        debugRef.current.textContent =
          `inner ${info.inner}  dpr ${info.dpr}\nvisual ${info.visual}\nroot ${info.root}  s ${info.scale}  t ${t.toFixed(2)}\ntextZoom ${measureTextZoom()}`;
      }
    },
    [gameId]
  );

  // stable callback ref: re-observes only when a different root mounts (phase change)
  const ref = useCallback(
    (el: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      nodeRef.current = el;
      if (!el) return;
      apply(el); // before first paint, so the sizes never jump
      const observer = new ResizeObserver(() => apply(el));
      observer.observe(el);
      observerRef.current = observer;
    },
    [apply]
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      debugRef.current?.remove();
      debugRef.current = null;
    },
    []
  );

  return { ref, nodeRef };
}

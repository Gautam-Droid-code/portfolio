"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Application } from "@splinetool/runtime";
import { useLoading } from "@/context/loading-context";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SceneBoundary } from "./scene-boundary";

// The Spline runtime is heavy and must never ship in the main or server bundle.
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const FALLBACK_MS = 5000;
const MAX_PIXEL_RATIO = 1.5;

// The scene's "Camera" is orthographic, framed tight on the face. We reframe it
// on load so the whole figure (head to sneakers) stands in the card: position +
// a level rotation, plus `zoom` applied to the camera's scale — for an ortho
// camera, larger scale = wider view = more of the body in frame. Tuned by eye
// against the live scene at the card's ~4:5 aspect; re-tune if the scene is
// re-exported with a different camera.
const CAMERA_FRAME = { x: -43, y: 150, z: 5000, rotX: 0, zoom: 3.4 };

// --- Head tracking -----------------------------------------------------------
// The exported figure is a SINGLE baked mesh ("output_unwrapped") with no head
// bone, so the scene's authored "Look At" can only swivel the whole body. To
// move just the head, we deform the mesh directly: vertices above the neck are
// rotated toward the cursor, with a smooth falloff across the neck band so the
// shoulders stay planted and nothing tears. Local-space Y (geometry units):
// the figure runs roughly -250 (feet) to +250 (hair); the neck sits near 185.
const HEAD_MESH_NAME = "output_unwrapped";
const NECK_LOW_Y = 165; // below this: no rotation (shoulders/torso stay put)
const NECK_HIGH_Y = 200; // above this: full rotation (head turns as one)
const NECK_PIVOT_Y = 185; // vertical pivot the head swings around
const MAX_YAW = 0.52; // ~30° left/right
const MAX_PITCH = 0.22; // ~13° up/down
const EASE = 0.12; // approach speed toward the cursor target
const SETTLE_EPS = 0.0004; // below this delta the head is "at rest"

type PositionAttr = {
  array: Float32Array;
  count: number;
  needsUpdate: boolean;
};

type ThreeObject = {
  isMesh?: boolean;
  name?: string;
  geometry?: { attributes?: { position?: PositionAttr } };
  children?: ThreeObject[];
};

type HeadData = {
  pos: PositionAttr;
  orig: Float32Array; // untouched rest positions
  full: Int32Array; // vertices that rotate fully (one shared rotation)
  band: Int32Array; // neck-band vertices (per-vertex weighted rotation)
  bandW: Float32Array; // smoothstep weight per band vertex
  px: number;
  pz: number;
};

function findMeshByName(root: ThreeObject, name: string): ThreeObject | null {
  const stack: ThreeObject[] = [root];

  while (stack.length) {
    const node = stack.pop();

    if (!node) {
      continue;
    }

    if (node.isMesh && node.name === name) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        stack.push(child);
      }
    }
  }

  return null;
}

// Pre-compute the head/neck vertex sets once so each frame only does the math.
function buildHeadData(app: Application): HeadData | null {
  try {
    const scene = (app as unknown as { _scene?: ThreeObject })._scene;

    if (!scene) {
      return null;
    }

    const mesh = findMeshByName(scene, HEAD_MESH_NAME);
    const pos = mesh?.geometry?.attributes?.position;

    if (!pos || !(pos.array instanceof Float32Array)) {
      return null;
    }

    const orig = Float32Array.from(pos.array);
    const count = pos.count;

    // Pivot x/z: centroid of the clearly-head vertices, so the head swings
    // around its own column rather than the mesh origin.
    let cx = 0;
    let cz = 0;
    let n = 0;

    for (let i = 0; i < count; i += 1) {
      if (orig[i * 3 + 1] > NECK_HIGH_Y + 5) {
        cx += orig[i * 3];
        cz += orig[i * 3 + 2];
        n += 1;
      }
    }

    if (n > 0) {
      cx /= n;
      cz /= n;
    }

    const full: number[] = [];
    const band: number[] = [];
    const bandW: number[] = [];

    for (let i = 0; i < count; i += 1) {
      const y = orig[i * 3 + 1];

      if (y <= NECK_LOW_Y) {
        continue;
      }

      if (y >= NECK_HIGH_Y) {
        full.push(i);
      } else {
        let w = (y - NECK_LOW_Y) / (NECK_HIGH_Y - NECK_LOW_Y);
        w = w * w * (3 - 2 * w); // smoothstep
        band.push(i);
        bandW.push(w);
      }
    }

    if (full.length === 0 && band.length === 0) {
      return null;
    }

    return {
      pos,
      orig,
      full: Int32Array.from(full),
      band: Int32Array.from(band),
      bandW: Float32Array.from(bandW),
      px: cx,
      pz: cz,
    };
  } catch {
    // Reaching the three.js scene is best-effort; without it the figure simply
    // stays still and everything else (framing, poster) still works.
    return null;
  }
}

// Rotate the head vertices by (yaw, pitch) around the neck pivot. Full-weight
// vertices share one sin/cos; only the thin neck band pays per-vertex trig.
function deformHead(head: HeadData, yaw: number, pitch: number): void {
  const { pos, orig, full, band, bandW, px, pz } = head;
  const a = pos.array;
  const py = NECK_PIVOT_Y;

  const sY = Math.sin(yaw);
  const cY = Math.cos(yaw);
  const sP = Math.sin(pitch);
  const cP = Math.cos(pitch);

  for (let k = 0; k < full.length; k += 1) {
    const i = full[k];
    const x = orig[i * 3] - px;
    const y = orig[i * 3 + 1] - py;
    const z = orig[i * 3 + 2] - pz;

    const x1 = x * cY + z * sY;
    const z1 = -x * sY + z * cY;
    const y2 = y * cP - z1 * sP;
    const z2 = y * sP + z1 * cP;

    a[i * 3] = x1 + px;
    a[i * 3 + 1] = y2 + py;
    a[i * 3 + 2] = z2 + pz;
  }

  for (let k = 0; k < band.length; k += 1) {
    const i = band[k];
    const w = bandW[k];
    const sy = Math.sin(yaw * w);
    const cy = Math.cos(yaw * w);
    const sp = Math.sin(pitch * w);
    const cp = Math.cos(pitch * w);

    const x = orig[i * 3] - px;
    const y = orig[i * 3 + 1] - py;
    const z = orig[i * 3 + 2] - pz;

    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;

    a[i * 3] = x1 + px;
    a[i * 3 + 1] = y2 + py;
    a[i * 3 + 2] = z2 + pz;
  }

  pos.needsUpdate = true;
}

type SceneObject = {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
};

type SplineInternals = {
  // Public runtime 2.x exposes no DPR setter; guarded and optional on purpose.
  _renderer?: { setPixelRatio?: (ratio: number) => void };
};

type NetworkInformation = {
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

/**
 * The avatar stands beside the hero as a full figure (no card frame). As the
 * cursor moves anywhere across the hero section, only the figure's HEAD turns
 * to follow it — the body stays planted. (The scene's authored whole-body
 * "Look At" is left dormant: it only reacts to pointer events dispatched onto
 * the canvas, and we no longer forward any.) The WebGL loop runs only while the
 * hero is on screen and the tab is visible. Mobile / reduced-data never loads
 * the runtime and shows the static poster instead.
 */
export function AvatarStage({ className }: { className?: string }) {
  const { setReady } = useLoading();
  const [canLoad, setCanLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const headRef = useRef<HeadData | null>(null);
  const inViewRef = useRef(true);

  // Spline only mounts for a fine pointer, a wide viewport, and no data saver.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const wideViewport = window.matchMedia("(min-width: 1024px)");
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;

    const update = () => {
      setCanLoad(
        finePointer.matches &&
          wideViewport.matches &&
          !reducedData.matches &&
          connection?.saveData !== true,
      );
    };

    update();
    const queries = [finePointer, wideViewport, reducedData];
    queries.forEach((query) => query.addEventListener("change", update));
    connection?.addEventListener?.("change", update);

    return () => {
      queries.forEach((query) => query.removeEventListener("change", update));
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  const syncPlayback = useCallback(() => {
    const app = appRef.current;

    if (!app) {
      return;
    }

    const active = inViewRef.current && !document.hidden;

    if (active) {
      if (app.isStopped) {
        app.play();
      }
    } else if (!app.isStopped) {
      app.stop();
    }
  }, []);

  const handleLoad = useCallback(
    (app: Application) => {
      appRef.current = app;

      try {
        const internals = app as Application & SplineInternals;
        internals._renderer?.setPixelRatio?.(
          Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
        );
      } catch {
        // Private renderer hook; the scene still works without the DPR cap.
      }

      try {
        // Keep the canvas itself transparent (the environment background is off
        // in the exported scene; this also clears the canvas clear colour).
        (
          app as Application & { setBackgroundColor?: (color: string) => void }
        ).setBackgroundColor?.("transparent");

        // Reframe the orthographic "Camera" so the whole figure is in view. The
        // runtime re-applies the scene's authored camera on the first frames after
        // load, so assert our framing now and again just after.
        const frameCamera = () => {
          const camera = app.findObjectByName("Camera") as
            | SceneObject
            | undefined;

          if (camera?.position) {
            camera.position.x = CAMERA_FRAME.x;
            camera.position.y = CAMERA_FRAME.y;
            camera.position.z = CAMERA_FRAME.z;
          }

          if (camera?.rotation) {
            camera.rotation.x = CAMERA_FRAME.rotX;
            camera.rotation.y = 0;
            camera.rotation.z = 0;
          }

          if (camera?.scale) {
            camera.scale.x = CAMERA_FRAME.zoom;
            camera.scale.y = CAMERA_FRAME.zoom;
            camera.scale.z = CAMERA_FRAME.zoom;
          }
        };

        frameCamera();
        [120, 350, 700].forEach((ms) => window.setTimeout(frameCamera, ms));
      } catch {
        // Scene tuning is best-effort; the avatar still renders without it.
      }

      // Pre-compute the head/neck vertex sets for cursor-driven head turning.
      headRef.current = buildHeadData(app);

      if (typeof window !== "undefined") {
        (window as unknown as { __spline?: Application }).__spline = app;
      }

      setLoaded(true);
      setReady();
      syncPlayback();
    },
    [setReady, syncPlayback],
  );

  const handleSceneError = useCallback(() => {
    appRef.current = null;
    headRef.current = null;
    setFailed(true);
    setReady();
  }, [setReady]);

  // Turn only the HEAD toward the cursor as it moves across the whole hero
  // section. A small render loop eases the head from its current angle to the
  // target and parks itself once it has settled, so there is zero per-frame
  // cost while the cursor is still.
  useEffect(() => {
    if (!canLoad) {
      return;
    }

    const section =
      frameRef.current?.closest("section") ?? frameRef.current?.parentElement;

    if (!section) {
      return;
    }

    const target = { yaw: 0, pitch: 0 };
    const current = { yaw: 0, pitch: 0 };
    let raf = 0;

    const tick = () => {
      current.yaw += (target.yaw - current.yaw) * EASE;
      current.pitch += (target.pitch - current.pitch) * EASE;

      const head = headRef.current;

      if (head) {
        deformHead(head, current.yaw, current.pitch);
      }

      const atRest =
        Math.abs(target.yaw - current.yaw) < SETTLE_EPS &&
        Math.abs(target.pitch - current.pitch) < SETTLE_EPS;

      if (atRest) {
        current.yaw = target.yaw;
        current.pitch = target.pitch;

        if (head) {
          deformHead(head, current.yaw, current.pitch);
        }

        raf = 0;
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const clamp = (value: number, limit: number) =>
      value < -limit ? -limit : value > limit ? limit : value;

    const handleMove = (event: PointerEvent) => {
      const canvas = appRef.current?.canvas;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      // Cursor offset from the head's on-screen anchor, normalised to [-1, 1].
      const anchorX = rect.left + rect.width * 0.5;
      const anchorY = rect.top + rect.height * 0.32;
      const nx = clamp((event.clientX - anchorX) / (rect.width * 0.5), 1);
      const ny = clamp((event.clientY - anchorY) / (rect.height * 0.5), 1);

      target.yaw = nx * MAX_YAW;
      target.pitch = ny * MAX_PITCH;
      wake();
    };

    const handleLeave = () => {
      target.yaw = 0;
      target.pitch = 0;
      wake();
    };

    section.addEventListener("pointermove", handleMove as EventListener);
    section.addEventListener("pointerleave", handleLeave as EventListener);

    return () => {
      section.removeEventListener("pointermove", handleMove as EventListener);
      section.removeEventListener("pointerleave", handleLeave as EventListener);

      if (raf) {
        cancelAnimationFrame(raf);
      }

      // Return the head to its rest pose so a remount starts clean.
      const head = headRef.current;

      if (head) {
        deformHead(head, 0, 0);
      }
    };
  }, [canLoad, loaded]);

  // Pause the render loop when the hero leaves the viewport or the tab hides.
  useEffect(() => {
    if (!canLoad) {
      return;
    }

    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 },
    );

    observer.observe(frame);

    const handleVisibility = () => syncPlayback();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [canLoad, syncPlayback]);

  // The gate falls back to ready if the scene never resolves either way.
  useEffect(() => {
    if (!canLoad || loaded || failed) {
      return;
    }

    const timer = window.setTimeout(() => setReady(), FALLBACK_MS);

    return () => window.clearTimeout(timer);
  }, [canLoad, failed, loaded, setReady]);

  const liveVisible = canLoad && !failed && loaded;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={frameRef}
        data-spline-loaded={loaded}
        className="relative aspect-[4/5] w-full"
      >
        {/* Resting / fallback state: static poster of the avatar. */}
        {!posterFailed && (
          <Image
            src="/hero/avatar-poster.png"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            onError={() => setPosterFailed(true)}
            className={cn(
              "object-contain object-bottom transition-opacity duration-base ease-out-expo",
              liveVisible ? "opacity-0" : "opacity-100",
            )}
          />
        )}

        {/* Live, cursor-tracking figure — pointer-events off so it never blocks
            the hero text or buttons; head tracking is driven by the hero-level
            pointer listener above. */}
        {canLoad && !failed && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-slow ease-out-expo",
              liveVisible ? "opacity-100" : "opacity-0",
            )}
          >
            <SceneBoundary onError={handleSceneError}>
              <Spline
                scene={siteConfig.splineScene}
                onLoad={handleLoad}
                renderOnDemand={false}
                style={{ width: "100%", height: "100%" }}
              />
            </SceneBoundary>

            {/* Masks the free-tier Spline badge without a hard edge. */}
            <div className="absolute bottom-0 right-0 h-16 w-44 bg-[radial-gradient(120%_120%_at_100%_100%,rgb(13_13_13/0.94)_0%,rgb(13_13_13/0.72)_46%,transparent_80%)]" />
          </div>
        )}
      </div>

      <p className="sr-only">
        A 3D avatar of Gautam whose head follows your cursor across the hero.
      </p>
    </div>
  );
}

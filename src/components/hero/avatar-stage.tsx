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
// The scene ships framed tight on the face. These camera values pull back and
// drop the framing so the whole figure (head through torso) stands in view;
// tuned by eye against the live scene. x and rotation keep their scene defaults.
// The box is a fixed 4:5 aspect at every width, so one framing holds everywhere.
// Levelling the camera (rotationX 0) and centring on the figure is far more
// stable than the scene's default downward tilt.
const CAMERA_FRAME = { x: -47, y: 460, z: 8600 };

type SplineInternals = {
  // Public runtime 2.x exposes no DPR setter; guarded and optional on purpose.
  _renderer?: { setPixelRatio?: (ratio: number) => void };
};

type SceneObject = {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
};

type NetworkInformation = {
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

/**
 * The avatar stands beside the hero as a full figure (no card frame) and looks
 * toward the cursor as it moves anywhere across the hero section, not just over
 * the figure itself: a pointer listener on the hero forwards coordinates to the
 * Spline canvas, which drives the scene's look-at. The WebGL loop runs only
 * while the hero is on screen and the tab is visible. Mobile / reduced-data
 * never loads the runtime and shows the static poster instead.
 */
export function AvatarStage({ className }: { className?: string }) {
  const { setReady } = useLoading();
  const [canLoad, setCanLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
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
        // Drop the grey studio backdrop so the figure sits on the dark hero,
        // and reframe the camera to show the full figure instead of the face.
        (
          app as Application & { setBackgroundColor?: (color: string) => void }
        ).setBackgroundColor?.("transparent");

        const camera = app.findObjectByName("Camera") as
          | SceneObject
          | undefined;

        if (camera?.position) {
          camera.position.x = CAMERA_FRAME.x;
          camera.position.y = CAMERA_FRAME.y;
          camera.position.z = CAMERA_FRAME.z;
        }

        if (camera?.rotation) {
          camera.rotation.x = 0;
        }
      } catch {
        // Scene tuning is best-effort; the avatar still renders without it.
      }

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
    setFailed(true);
    setReady();
  }, [setReady]);

  // Forward pointer movement from the WHOLE hero section to the Spline canvas so
  // the avatar tracks the cursor everywhere in the hero, not only over itself.
  useEffect(() => {
    if (!canLoad) {
      return;
    }

    const section =
      frameRef.current?.closest("section") ?? frameRef.current?.parentElement;

    if (!section) {
      return;
    }

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      const canvas = appRef.current?.canvas;

      if (!canvas || !pending) {
        return;
      }

      const init = {
        clientX: pending.x,
        clientY: pending.y,
        bubbles: true,
        cancelable: true,
        view: window,
      };

      // Dispatch both: the runtime's look-at reads whichever it listens for.
      canvas.dispatchEvent(
        new PointerEvent("pointermove", {
          ...init,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
      canvas.dispatchEvent(new MouseEvent("mousemove", init));
    };

    const handleMove = (event: PointerEvent) => {
      pending = { x: event.clientX, y: event.clientY };

      if (!frame) {
        frame = requestAnimationFrame(flush);
      }
    };

    section.addEventListener("pointermove", handleMove as EventListener);

    return () => {
      section.removeEventListener("pointermove", handleMove as EventListener);

      if (frame) {
        cancelAnimationFrame(frame);
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
            the hero text or buttons; tracking is driven by the forwarder. */}
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
        A 3D avatar of Gautam that follows your cursor across the hero.
      </p>
    </div>
  );
}

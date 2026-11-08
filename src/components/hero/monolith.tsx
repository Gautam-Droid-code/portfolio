"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * An original monolith robot — three chunky matte slabs standing on a shared
 * base, with one continuous glowing sensor slit across the front. As the cursor
 * moves, the stack cantilevers toward it (pivoting from the base, so the top
 * leans most) and the slabs step in an alternating gait, so it reads as an
 * articulating machine turning to face you. Built from primitives in Three.js
 * via React Three Fiber — an original design, not a replica of any film robot.
 *
 * The sensor slit reads the site's --accent token (theme-aware). Hover brightens
 * it; a click pops the slabs apart and lets them settle. Honours reduced motion.
 * Lazy-loaded (ssr: false) so Three.js never blocks first paint.
 */

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function useAccent(): string {
  const [accent, setAccent] = useState("#9ab6d2");
  useEffect(() => {
    const read = () => setAccent(readVar("--accent", "#9ab6d2"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);
  return accent;
}

function safeColor(value: string, fallback: string): THREE.Color {
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color(fallback);
  }
}

const SLAB_H = 1.7;
const SLAB_W = 0.66;
const SLAB_D = 0.66;
const SLABS = [-0.74, 0, 0.74]; // x positions

type ModelProps = {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  accent: string;
  reduce: boolean;
};

function MonolithBot({ pointer, accent, reduce }: ModelProps) {
  const lean = useRef<THREE.Group>(null);
  const slabRefs = useRef<Array<THREE.Group | null>>([]);
  const hot = useRef(0);
  const pop = useRef(0);

  const hullMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#141518"),
        metalness: 0.62,
        roughness: 0.46,
      }),
    [],
  );
  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#23262c"),
        metalness: 0.7,
        roughness: 0.38,
      }),
    [],
  );
  const slitMat = useMemo(() => {
    const color = safeColor(accent, "#9ab6d2");
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color.clone(),
      emissiveIntensity: 2,
      toneMapped: false,
    });
  }, [accent]);

  useEffect(() => {
    const all = [hullMat, edgeMat, slitMat];
    return () => all.forEach((material) => material.dispose());
  }, [hullMat, edgeMat, slitMat]);

  useFrame((state, delta) => {
    const group = lean.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    const px = reduce ? 0 : pointer.current.x;
    const py = reduce ? 0 : pointer.current.y;

    // cantilever toward the cursor — pivots at the base (origin at y=0),
    // so the top leans most, like it is turning to face you
    group.rotation.y += (px * 0.55 - group.rotation.y) * 0.07;
    group.rotation.x += (-py * 0.3 - group.rotation.x) * 0.07;

    pop.current *= 0.9;
    if (Math.abs(pop.current) < 0.001) pop.current = 0;

    // activity: more cursor movement / hover => taller steps
    const amp = 0.03 + hot.current * 0.12 + Math.abs(px) * 0.06;

    SLABS.forEach((x, index) => {
      const node = slabRefs.current[index];
      if (!node) return;
      const phase = index * Math.PI * 0.8;
      const step = reduce ? 0 : Math.sin(t * 1.9 + phase) * amp;
      const weight = px * x * 0.14; // slabs on the cursor side carry weight
      const burst = pop.current * (1 + index * 0.4);
      node.position.y = step + weight + burst;
      node.rotation.y += (px * 0.3 - node.rotation.y) * 0.1;
    });

    slitMat.emissiveIntensity = THREE.MathUtils.damp(
      slitMat.emissiveIntensity,
      2 + hot.current * 2,
      6,
      delta,
    );
  });

  return (
    // outer group: scale + a hair of top-down tilt. Slabs stand on y = 0 so the
    // inner lean pivots from the base.
    <group position={[0, -0.75, 0]} rotation={[0.04, 0, 0]} scale={0.82}>
      <group
        ref={lean}
        onPointerOver={(event) => {
          event.stopPropagation();
          hot.current = 1;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hot.current = 0;
          document.body.style.cursor = "";
        }}
        onClick={() => {
          pop.current = 0.4;
        }}
      >
        {SLABS.map((x, index) => (
          <group
            key={index}
            position={[x, 0, 0]}
            ref={(node) => {
              slabRefs.current[index] = node;
            }}
          >
            {/* slab body — base sits on y = 0 */}
            <mesh material={hullMat} position={[0, SLAB_H / 2, 0]}>
              <boxGeometry args={[SLAB_W, SLAB_H, SLAB_D]} />
            </mesh>
            {/* front face plate */}
            <mesh material={edgeMat} position={[0, SLAB_H / 2, SLAB_D / 2 + 0.005]}>
              <boxGeometry args={[SLAB_W - 0.1, SLAB_H - 0.12, 0.03]} />
            </mesh>
            {/* continuous glowing sensor slit near the top (aligned across slabs) */}
            <mesh material={slitMat} position={[0, SLAB_H - 0.26, SLAB_D / 2 + 0.03]}>
              <boxGeometry args={[SLAB_W - 0.06, 0.1, 0.03]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function Monolith() {
  const pointer = useRef({ x: 0, y: 0 });
  const accent = useAccent();
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(query.matches);
    const onChange = () => setReduce(query.matches);
    query.addEventListener("change", onChange);

    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      query.removeEventListener("change", onChange);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const accentColor = safeColor(accent, "#9ab6d2");

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      frameloop={reduce ? "demand" : "always"}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <directionalLight position={[-4, 2, 2]} intensity={0.5} color={accentColor} />
      <pointLight position={[0, 1, 3]} intensity={1.6} distance={9} color={accentColor} />
      <MonolithBot pointer={pointer} accent={accent} reduce={reduce} />
    </Canvas>
  );
}

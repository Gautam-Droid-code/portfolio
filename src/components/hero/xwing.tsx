"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * A 3D X-wing-style starfighter (Three.js via React Three Fiber), built from
 * primitives — no model file, no Spline, no badge. Long fuselage with a nose
 * cone, cockpit canopy and astromech dome, four S-foils locked in the
 * attack-position "X", forward wingtip laser cannons, and glowing engine
 * exhausts. Posed at a 3/4 hero angle; the craft banks toward the cursor.
 * Engine/cannon glows read the site's --accent token, so they re-tint with the
 * light/dark theme. Hover brightens the engines; a click rolls the craft.
 *
 * Note: the X-wing is a Lucasfilm design; this is an original low-poly homage.
 * Loaded via next/dynamic (ssr: false) so Three.js never blocks first paint.
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

type WingProps = {
  side: 1 | -1;
  vert: 1 | -1;
  hull: THREE.Material;
  dark: THREE.Material;
  stripe: THREE.Material;
  glow: THREE.Material;
};

/** One S-foil: wing panel, accent stripe, forward cannon, engine + exhaust. */
function Wing({ side, vert, hull, dark, stripe, glow }: WingProps) {
  return (
    <group scale={[side, 1, 1]}>
      <group position={[0.12, 0, -0.7]} rotation={[0, 0.14, vert * 0.4]}>
        {/* wing panel */}
        <mesh material={hull} position={[1.0, 0, 0]}>
          <boxGeometry args={[1.9, 0.05, 0.55]} />
        </mesh>
        {/* accent stripe near the tip */}
        <mesh material={stripe} position={[1.68, 0.035, 0]}>
          <boxGeometry args={[0.34, 0.02, 0.5]} />
        </mesh>
        {/* wingtip laser cannon (points forward) */}
        <mesh
          material={dark}
          position={[1.95, 0, 0.75]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.035, 0.035, 1.7, 10]} />
        </mesh>
        <mesh material={glow} position={[1.95, 0, 1.62]}>
          <sphereGeometry args={[0.05, 10, 10]} />
        </mesh>
        {/* engine nacelle at the wing root */}
        <mesh
          material={hull}
          position={[0.34, 0, -0.1]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.18, 0.18, 0.72, 18]} />
        </mesh>
        {/* intake ring */}
        <mesh
          material={dark}
          position={[0.34, 0, 0.25]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.16, 0.03, 10, 20]} />
        </mesh>
        {/* engine exhaust glow */}
        <mesh material={glow} position={[0.34, 0, -0.47]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 20]} />
        </mesh>
      </group>
    </group>
  );
}

type ModelProps = {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  accent: string;
  reduce: boolean;
};

function Starfighter({ pointer, accent, reduce }: ModelProps) {
  const bank = useRef<THREE.Group>(null);
  const hot = useRef(0);
  const roll = useRef(0);

  const hullMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#cfd3da"),
        metalness: 0.45,
        roughness: 0.55,
      }),
    [],
  );
  const darkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#262a31"),
        metalness: 0.6,
        roughness: 0.4,
      }),
    [],
  );
  const glassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#121820"),
        metalness: 0.3,
        roughness: 0.1,
      }),
    [],
  );
  const stripeMat = useMemo(() => {
    const color = safeColor(accent, "#9ab6d2");
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color.clone(),
      emissiveIntensity: 0.35,
      metalness: 0.3,
      roughness: 0.5,
    });
  }, [accent]);
  const glowMat = useMemo(() => {
    const color = safeColor(accent, "#9ab6d2");
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color.clone(),
      emissiveIntensity: 2,
      toneMapped: false,
    });
  }, [accent]);

  useEffect(() => {
    const all = [hullMat, darkMat, glassMat, stripeMat, glowMat];
    return () => all.forEach((material) => material.dispose());
  }, [hullMat, darkMat, glassMat, stripeMat, glowMat]);

  useFrame((state, delta) => {
    const group = bank.current;
    if (!group) return;
    const t = state.clock.elapsedTime;

    const targetY = reduce ? 0 : pointer.current.x * 0.5;
    const targetX = reduce ? 0 : -pointer.current.y * 0.32;
    group.rotation.y += (targetY - group.rotation.y) * 0.07;
    group.rotation.x += (targetX - group.rotation.x) * 0.07;

    roll.current *= 0.9;
    if (Math.abs(roll.current) < 0.001) roll.current = 0;

    if (reduce) {
      group.rotation.z = roll.current;
      group.position.y = 0;
    } else {
      group.rotation.z = Math.sin(t * 0.7) * 0.05 + roll.current;
      group.position.y = Math.sin(t * 1.0) * 0.07;
    }

    glowMat.emissiveIntensity = THREE.MathUtils.damp(
      glowMat.emissiveIntensity,
      2 + hot.current * 1.8,
      6,
      delta,
    );
  });

  return (
    // outer group holds the fixed 3/4 hero pose; inner group does the banking
    <group rotation={[0.14, -0.6, 0]} scale={0.8}>
      <group
        ref={bank}
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
          roll.current = Math.PI * 2;
        }}
      >
        {/* fuselage */}
        <mesh material={hullMat} position={[0, 0, -0.1]}>
          <boxGeometry args={[0.4, 0.38, 2.0]} />
        </mesh>
        {/* nose cone */}
        <mesh material={hullMat} position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.24, 0.9, 14]} />
        </mesh>
        {/* nose accent band */}
        <mesh material={stripeMat} position={[0, 0, 0.78]}>
          <boxGeometry args={[0.42, 0.4, 0.14]} />
        </mesh>

        {/* cockpit canopy */}
        <mesh material={darkMat} position={[0, 0.24, 0.18]}>
          <boxGeometry args={[0.28, 0.2, 0.62]} />
        </mesh>
        <mesh material={glassMat} position={[0, 0.3, 0.3]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.24, 0.12, 0.34]} />
        </mesh>
        {/* astromech dome */}
        <mesh material={darkMat} position={[0, 0.3, -0.5]}>
          <sphereGeometry args={[0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>

        {/* four S-foils in the attack-position X */}
        <Wing side={1} vert={1} hull={hullMat} dark={darkMat} stripe={stripeMat} glow={glowMat} />
        <Wing side={1} vert={-1} hull={hullMat} dark={darkMat} stripe={stripeMat} glow={glowMat} />
        <Wing side={-1} vert={1} hull={hullMat} dark={darkMat} stripe={stripeMat} glow={glowMat} />
        <Wing side={-1} vert={-1} hull={hullMat} dark={darkMat} stripe={stripeMat} glow={glowMat} />
      </group>
    </group>
  );
}

export function Xwing() {
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
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      frameloop={reduce ? "demand" : "always"}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-4, -1, -2]} intensity={0.45} color={accentColor} />
      <pointLight position={[0, 0, 3]} intensity={2} distance={8} color={accentColor} />
      <Starfighter pointer={pointer} accent={accent} reduce={reduce} />
    </Canvas>
  );
}

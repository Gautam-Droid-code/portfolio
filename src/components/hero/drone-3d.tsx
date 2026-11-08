"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * A real-3D front-facing mech drone (Three.js via React Three Fiber). Built
 * entirely from primitives — no model file, no Spline, no badge. The whole
 * craft banks toward the cursor with true perspective and lighting; the sensor
 * eye and wingtip thrusters glow (emissive). Materials read the site's --accent
 * / --surface-raised tokens, so it re-tints with the light/dark theme. Hover
 * brightens the thrusters; a click rolls the craft. Honours reduced motion.
 *
 * Loaded via next/dynamic (ssr: false) from AvatarCard so Three.js never ships
 * in the server bundle and never blocks first paint.
 */

type Palette = { accent: string; metal: string };

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function useThemePalette(): Palette {
  const [palette, setPalette] = useState<Palette>({
    accent: "#9ab6d2",
    metal: "#2b2f37",
  });

  useEffect(() => {
    const read = () =>
      setPalette({
        accent: readVar("--accent", "#9ab6d2"),
        metal: readVar("--surface-raised", "#2b2f37"),
      });
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);

  return palette;
}

function safeColor(value: string, fallback: string): THREE.Color {
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color(fallback);
  }
}

type ModelProps = {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  palette: Palette;
  reduce: boolean;
};

const ARM_ANGLES = [45, 135, 225, 315];

function DroneModel({ pointer, palette, reduce }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const hot = useRef(0); // 0..1 hover warmth
  const roll = useRef(0); // decaying click barrel-roll

  const metalMat = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: safeColor(palette.metal, "#2b2f37"),
      metalness: 0.9,
      roughness: 0.38,
    });
    return material;
  }, [palette.metal]);

  const darkMat = useMemo(() => {
    const base = safeColor(palette.metal, "#2b2f37").clone();
    base.multiplyScalar(0.45);
    return new THREE.MeshStandardMaterial({
      color: base,
      metalness: 0.7,
      roughness: 0.5,
    });
  }, [palette.metal]);

  const glowMat = useMemo(() => {
    const color = safeColor(palette.accent, "#9ab6d2");
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color.clone(),
      emissiveIntensity: 1.8,
      toneMapped: false,
      metalness: 0.2,
      roughness: 0.3,
    });
  }, [palette.accent]);

  useEffect(() => {
    return () => {
      metalMat.dispose();
      darkMat.dispose();
      glowMat.dispose();
    };
  }, [metalMat, darkMat, glowMat]);

  useFrame((state, delta) => {
    const craft = group.current;
    if (!craft) return;
    const t = state.clock.elapsedTime;

    const targetY = reduce ? 0 : pointer.current.x * 0.6;
    const targetX = reduce ? 0 : -pointer.current.y * 0.4;

    craft.rotation.y += (targetY - craft.rotation.y) * 0.07;
    craft.rotation.x += (targetX - craft.rotation.x) * 0.07;

    roll.current *= 0.9;
    if (Math.abs(roll.current) < 0.001) roll.current = 0;

    if (reduce) {
      craft.rotation.z = roll.current;
      craft.position.y = 0;
    } else {
      craft.rotation.z = Math.sin(t * 0.8) * 0.05 + roll.current;
      craft.position.y = Math.sin(t * 1.1) * 0.08;
    }

    // ease hover warmth and push it into the emissive thrusters
    const hotTarget = hot.current;
    const current = glowMat.emissiveIntensity;
    glowMat.emissiveIntensity = THREE.MathUtils.damp(
      current,
      1.8 + hotTarget * 1.6,
      6,
      delta,
    );
  });

  return (
    <group
      ref={group}
      scale={0.82}
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
      {/* fuselage — hexagonal body */}
      <mesh material={metalMat} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 1.5, 6]} />
      </mesh>

      {/* chest plate / cockpit recess */}
      <mesh material={darkMat} position={[0, 0.12, 0.42]}>
        <boxGeometry args={[0.7, 0.8, 0.3]} />
      </mesh>

      {/* sensor eye */}
      <mesh material={glowMat} position={[0, 0.16, 0.62]}>
        <sphereGeometry args={[0.2, 24, 24]} />
      </mesh>
      <mesh material={metalMat} position={[0, 0.16, 0.56]}>
        <torusGeometry args={[0.26, 0.05, 12, 24]} />
      </mesh>

      {/* lower power core */}
      <mesh material={glowMat} position={[0, -0.5, 0.42]}>
        <sphereGeometry args={[0.1, 16, 16]} />
      </mesh>

      {/* top fin */}
      <mesh material={metalMat} position={[0, 0.98, 0]}>
        <coneGeometry args={[0.1, 0.4, 4]} />
      </mesh>

      {/* four wings in an X, each with a thruster pod + cannon */}
      {ARM_ANGLES.map((deg, index) => {
        const angle = THREE.MathUtils.degToRad(deg);
        return (
          <group key={index} rotation={[0, 0, angle]}>
            {/* wing arm */}
            <mesh material={metalMat} position={[0.85, 0, 0]}>
              <boxGeometry args={[1.5, 0.12, 0.26]} />
            </mesh>
            {/* power line down the wing */}
            <mesh material={glowMat} position={[0.85, 0.07, 0]}>
              <boxGeometry args={[1.2, 0.02, 0.05]} />
            </mesh>
            {/* thruster pod */}
            <mesh
              material={metalMat}
              position={[1.62, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.17, 0.22, 0.34, 18]} />
            </mesh>
            {/* thruster glow */}
            <mesh material={glowMat} position={[1.82, 0, 0]}>
              <sphereGeometry args={[0.14, 18, 18]} />
            </mesh>
            {/* wing cannon */}
            <mesh
              material={darkMat}
              position={[2.2, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.035, 0.035, 0.7, 10]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Drone3D() {
  const pointer = useRef({ x: 0, y: 0 });
  const palette = useThemePalette();
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

  const accent = safeColor(palette.accent, "#9ab6d2");

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      frameloop={reduce ? "demand" : "always"}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-4, -1, -2]} intensity={0.4} color={accent} />
      <pointLight position={[0, 0, 2]} intensity={2.4} distance={7} color={accent} />
      <DroneModel pointer={pointer} palette={palette} reduce={reduce} />
    </Canvas>
  );
}

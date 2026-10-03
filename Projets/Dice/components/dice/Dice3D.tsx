"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Action, Zone } from "@/lib/types";

/**
 * 3D dice scene with React Three Fiber.
 * - Two dice (action + zone)
 * - Roll animation with bounce
 * - Texture per face dynamically generated to match theme
 * - Auto fallback to CSS if WebGL unavailable
 */

interface Props {
  actions: (Action | null)[]; // 6 faces
  zones: (Zone | null)[]; // 6 faces
  rolling: boolean;
  selectedActionIdx: number; // 0–5, the face that should land up after roll
  selectedZoneIdx: number;
  onRollDone?: () => void;
}

// Box geometry face order: +X, -X, +Y, -Y, +Z, -Z
const FACE_UP_ROT = [
  new THREE.Euler(0, 0, -Math.PI / 2),
  new THREE.Euler(0, 0, Math.PI / 2),
  new THREE.Euler(0, 0, 0),
  new THREE.Euler(Math.PI, 0, 0),
  new THREE.Euler(-Math.PI / 2, 0, 0),
  new THREE.Euler(Math.PI / 2, 0, 0),
];

interface ThemePalette {
  bg: string;
  textColor: string;
  borderColor: string;
  isDark: boolean;
}

function makeFaceTexture(emoji: string, label: string, palette: ThemePalette) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 512, 512);

  if (palette.isDark) {
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 320);
    grad.addColorStop(0, palette.borderColor + "33");
    grad.addColorStop(1, palette.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = palette.borderColor;
    ctx.lineWidth = 6;
    ctx.shadowColor = palette.borderColor;
    ctx.shadowBlur = 30;
    ctx.strokeRect(20, 20, 472, 472);
    ctx.shadowBlur = 0;
  } else {
    ctx.strokeStyle = "#1a0510";
    ctx.lineWidth = 32;
    ctx.strokeRect(16, 16, 480, 480);
  }

  ctx.font = '180px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (palette.isDark) {
    ctx.shadowColor = palette.borderColor;
    ctx.shadowBlur = 30;
  }
  ctx.fillText(emoji, 256, 220);
  ctx.shadowBlur = 0;

  ctx.fillStyle = palette.textColor;
  ctx.font = palette.isDark
    ? 'bold 56px Unbounded, sans-serif'
    : '900 60px Fraunces, Georgia, serif';
  if (palette.isDark) {
    ctx.shadowColor = palette.textColor;
    ctx.shadowBlur = 20;
  }

  // Wrap long labels
  const words = label.split(" ");
  if (words.length > 1 && label.length > 11) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    ctx.fillText(line1, 256, 360);
    ctx.fillText(line2, 256, 420);
  } else {
    ctx.fillText(label, 256, 380);
  }
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface DieProps {
  faces: ({ emoji: string; word: string } | null)[];
  palette: ThemePalette;
  rolling: boolean;
  targetFace: number;
  position: [number, number, number];
  rotationDir: 1 | -1;
}

function Die({ faces, palette, rolling, targetFace, position, rotationDir }: DieProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const animRef = useRef<{
    startTime: number;
    duration: number;
    fromX: number;
    fromY: number;
    fromZ: number;
    toX: number;
    toY: number;
    toZ: number;
    bounce: boolean;
  } | null>(null);

  const geometry = useMemo(() => new RoundedBoxGeometry(1.6, 1.6, 1.6, 4, 0.16), []);

  const materials = useMemo(() => {
    return faces.map((f) => {
      const tex = f
        ? makeFaceTexture(f.emoji, f.word, palette)
        : makeFaceTexture("?", "—", palette);
      tex.anisotropy = 8;
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.35,
        metalness: palette.isDark ? 0.3 : 0.05,
        emissive: palette.isDark ? new THREE.Color(palette.borderColor) : new THREE.Color(0x000000),
        emissiveIntensity: palette.isDark ? 0.2 : 0,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faces, palette.isDark, palette.bg, palette.borderColor, palette.textColor]);

  useEffect(() => {
    return () => {
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      geometry.dispose();
    };
  }, [materials, geometry]);

  // Trigger roll animation
  useEffect(() => {
    if (!rolling || !meshRef.current) return;
    const m = meshRef.current;
    const target = FACE_UP_ROT[targetFace];
    animRef.current = {
      startTime: performance.now(),
      duration: 1700,
      fromX: m.rotation.x,
      fromY: m.rotation.y,
      fromZ: m.rotation.z,
      toX: target.x + Math.PI * 2 * 4 * rotationDir,
      toY: Math.PI * 2 * 3 * rotationDir,
      toZ: target.z + Math.PI * 2 * 2,
      bounce: true,
    };
  }, [rolling, targetFace, rotationDir]);

  useFrame((_, dt) => {
    const m = meshRef.current;
    if (!m) return;

    if (animRef.current) {
      const a = animRef.current;
      const t = Math.min((performance.now() - a.startTime) / a.duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      m.rotation.x = a.fromX + (a.toX - a.fromX) * eased;
      m.rotation.y = a.fromY + (a.toY - a.fromY) * eased;
      m.rotation.z = a.fromZ + (a.toZ - a.fromZ) * eased;
      const bt = Math.min(t * 1.2, 1);
      m.position.y = position[1] + Math.sin(bt * Math.PI) * 1.5;
      if (t >= 1) {
        m.position.y = position[1];
        const target = FACE_UP_ROT[targetFace];
        m.rotation.set(target.x, 0, target.z);
        animRef.current = null;
      }
    } else {
      // idle gentle rotation
      m.rotation.y += dt * 0.18 * rotationDir;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      geometry={geometry}
      material={materials}
    />
  );
}

function FloorShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <shadowMaterial opacity={0.25} />
    </mesh>
  );
}

function Lights({ palette }: { palette: ThemePalette }) {
  return (
    <>
      <ambientLight intensity={palette.isDark ? 0.5 : 0.6} color={palette.isDark ? "#4a0e3a" : "#ffffff"} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={palette.isDark ? 0.8 : 1.2}
        color={palette.isDark ? "#ff007a" : "#ffffff"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-radius={6}
      />
      {palette.isDark && (
        <directionalLight position={[-5, 4, -5]} intensity={1.5} color="#00f0ff" />
      )}
    </>
  );
}

function Resizer() {
  const { gl, camera, size } = useThree();
  useEffect(() => {
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const cam = camera as THREE.PerspectiveCamera;
      cam.aspect = size.width / size.height;
      cam.updateProjectionMatrix();
    }
    gl.setSize(size.width, size.height);
  }, [size, camera, gl]);
  return null;
}

function Scene({
  actions,
  zones,
  rolling,
  selectedActionIdx,
  selectedZoneIdx,
  onRollDone,
}: Props) {
  const { theme } = useTheme();

  const palette: ThemePalette = useMemo(() => {
    if (theme === "dark") {
      return {
        bg: "#0a0a0e",
        textColor: "#ff007a",
        borderColor: "#ff007a",
        isDark: true,
      };
    }
    return {
      bg: "#ffffff",
      textColor: "#1a0510",
      borderColor: "#ff3d8b",
      isDark: false,
    };
  }, [theme]);

  const palette2: ThemePalette = useMemo(() => {
    if (theme === "dark") {
      return { bg: "#0a0a0e", textColor: "#00f0ff", borderColor: "#00f0ff", isDark: true };
    }
    return { bg: "#e8b835", textColor: "#1a0510", borderColor: "#e85a3c", isDark: false };
  }, [theme]);

  // signal "done" after the roll duration
  useEffect(() => {
    if (!rolling) return;
    const t = setTimeout(() => onRollDone?.(), 1750);
    return () => clearTimeout(t);
  }, [rolling, onRollDone]);

  return (
    <>
      <Resizer />
      <Lights palette={palette} />
      <FloorShadow />
      <Die
        faces={actions}
        palette={palette}
        rolling={rolling}
        targetFace={selectedActionIdx}
        position={[-1.4, 0, 0]}
        rotationDir={1}
      />
      <Die
        faces={zones}
        palette={palette2}
        rolling={rolling}
        targetFace={selectedZoneIdx}
        position={[1.4, 0, 0]}
        rotationDir={-1}
      />
    </>
  );
}

export function Dice3D(props: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const ok = !!(c.getContext("webgl2") || c.getContext("webgl"));
      setSupported(ok);
    } catch {
      setSupported(false);
    }
  }, []);

  if (supported === false) return null; // parent will render CSS fallback

  return (
    <div className="w-full aspect-[16/10] max-h-[360px]">
      <Suspense fallback={<div className="w-full h-full grid place-items-center text-muted text-sm">Chargement…</div>}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 3.5, 6.5], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene {...props} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export function isWebGLSupported(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

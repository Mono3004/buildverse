import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

export const DEFAULT_OBJECTS = [
  { id: "knot-1", kind: "knot", position: [-3.2, 1.35, -0.5], scale: 0.92 },
  { id: "blob-1", kind: "blob", position: [3.15, 1.05, 0.4], scale: 1.12 },
  { id: "spikes-1", kind: "spikes", position: [-2.85, -1.65, -0.8], scale: 0.82 },
  { id: "ring-1", kind: "ring", position: [2.95, -1.75, -0.4], scale: 0.86 },
  { id: "capsule-1", kind: "capsule", position: [-1.45, 2.35, -1.4], scale: 0.86 },
  { id: "pearl-1", kind: "pearl", position: [1.35, -2.5, 0.4], scale: 0.48 },
  { id: "pearl-2", kind: "pearl", position: [-3.75, -0.25, 0.6], scale: 0.36 },
  { id: "knot-2", kind: "knot", position: [1.75, 2.55, -1.6], scale: 0.52 },
  { id: "shard-1", kind: "shard", position: [3.75, -0.2, -1.2], scale: 0.68 },
  { id: "coil-1", kind: "coil", position: [-2.05, -2.85, -1.1], scale: 0.62 },
];

function Chrome({ rough = 0.02 }) {
  return (
    <meshStandardMaterial color="#e8ecf0" metalness={1} roughness={rough} envMapIntensity={2.2} />
  );
}

function Knot() {
  const ref = useRef(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.x += d * 0.25;
    ref.current.rotation.y += d * 0.35;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.38, 180, 32]} />
      <Chrome />
    </mesh>
  );
}

function Blob() {
  const ref = useRef(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.4;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshTransmissionMaterial
        thickness={0.9}
        roughness={0.05}
        chromaticAberration={0.35}
        ior={1.6}
        backside
        color="#dfe6ec"
      />
    </mesh>
  );
}

function Spikes() {
  const spikes = useMemo(() => {
    const out = [];
    const n = 70;
    for (let i = 0; i < n; i += 1) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      const p = [Math.cos(theta) * rad, y, Math.sin(theta) * rad];
      out.push({ p, r: [Math.atan2(p[2], p[1]) + Math.PI / 2, 0, -Math.atan2(p[0], p[1])] });
    }
    return out;
  }, []);
  const ref = useRef(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.3;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.86, 48, 48]} />
        <meshStandardMaterial color="#f4f6f8" metalness={0.25} roughness={0.35} />
      </mesh>
      {spikes.map((s, i) => (
        <mesh key={i} position={s.p} rotation={s.r}>
          <coneGeometry args={[0.08, 0.42, 10]} />
          <meshStandardMaterial color="#fbfcfd" metalness={0.2} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Pearl() {
  return (
    <mesh>
      <sphereGeometry args={[1, 48, 48]} />
      <Chrome rough={0.05} />
    </mesh>
  );
}

function Ring() {
  const ref = useRef(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.z += d * 0.2;
    ref.current.rotation.x += d * 0.12;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1, 0.22, 40, 140]} />
      <Chrome rough={0.04} />
    </mesh>
  );
}

function CapsuleShape() {
  const ref = useRef(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.4) * 0.7;
    ref.current.rotation.y = s.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={ref}>
      <capsuleGeometry args={[0.42, 1.1, 18, 36]} />
      <meshStandardMaterial color="#f7f9fa" metalness={0.35} roughness={0.28} />
    </mesh>
  );
}

function Shard() {
  const ref = useRef(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.x += d * 0.18;
    ref.current.rotation.y += d * 0.3;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1, 0]} />
      <Chrome rough={0.01} />
    </mesh>
  );
}

function Coil() {
  const ref = useRef(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.5;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.35) * 0.5;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, i * 0.32 - 0.48, 0]} rotation={[Math.PI / 2, 0, i * 0.5]}>
          <torusGeometry args={[0.8 - i * 0.06, 0.1, 24, 90]} />
          <meshStandardMaterial
            color={i % 2 ? "#f6f8fa" : "#e6ebf0"}
            metalness={i % 2 ? 0.3 : 1}
            roughness={i % 2 ? 0.3 : 0.04}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

const SHAPES = {
  knot: Knot,
  blob: Blob,
  spikes: Spikes,
  ring: Ring,
  capsule: CapsuleShape,
  pearl: Pearl,
  shard: Shard,
  coil: Coil,
};

const FLOAT_SETTINGS = {
  knot: [1.4, 0.5, 1.1],
  blob: [2, 0.8, 1.4],
  spikes: [1.1, 0.4, 0.9],
  ring: [1.6, 0.6, 1.2],
  capsule: [1.9, 0.5, 1.5],
  pearl: [2.6, 1, 2],
  shard: [1.7, 0.7, 1.3],
  coil: [1.3, 0.45, 1],
};

function SceneItem({
  obj,
  placing,
  active,
  hovered,
  onGrab,
  onHover,
}) {
  const Shape = SHAPES[obj.kind];
  const [f0, f1, f2] = FLOAT_SETTINGS[obj.kind];
  const boost = hovered || active ? 1.14 : 1;

  const content = (
    <group
      position={obj.position}
      scale={obj.scale * boost}
      onPointerDown={placing ? (e) => onGrab(e, obj.id) : undefined}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(obj.id);
      }}
      onPointerOut={() => onHover(null)}
    >
      <Shape />
    </group>
  );

  if (placing) return content;
  return (
    <Float speed={f0} rotationIntensity={f1} floatIntensity={f2}>
      {content}
    </Float>
  );
}

function Rig({ enabled, children }) {
  const ref = useRef(null);
  const { pointer } = useThree();
  useFrame((_, d) => {
    if (!ref.current) return;
    const k = Math.min(1, d * 3);
    const tx = enabled ? -pointer.y * 0.3 : 0;
    const ty = enabled ? pointer.x * 0.45 : 0;
    ref.current.rotation.y += (ty - ref.current.rotation.y) * k;
    ref.current.rotation.x += (tx - ref.current.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

function Dragger({
  dragId,
  objects,
  placing,
  onPick,
  onRelease,
  onMove,
}) {
  const { pointer, viewport, camera, gl } = useThree();

  useEffect(() => {
    if (!placing) return;
    const canvas = gl.domElement;

    const pickNearest = () => {
      if (!objects.length) return;
      let nearest = objects[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const obj of objects) {
        const v = viewport.getCurrentViewport(camera, [0, 0, obj.position[2]]);
        const px = obj.position[0] / (v.width / 2);
        const py = obj.position[1] / (v.height / 2);
        const distance = Math.hypot(pointer.x - px, pointer.y - py);
        if (distance < nearestDistance) {
          nearest = obj;
          nearestDistance = distance;
        }
      }

      onPick(nearest.id);
    };

    canvas.addEventListener("pointerdown", pickNearest);
    canvas.addEventListener("pointerup", onRelease);
    canvas.addEventListener("pointercancel", onRelease);
    window.addEventListener("pointerup", onRelease);

    return () => {
      canvas.removeEventListener("pointerdown", pickNearest);
      canvas.removeEventListener("pointerup", onRelease);
      canvas.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("pointerup", onRelease);
    };
  }, [camera, gl.domElement, objects, onPick, onRelease, placing, pointer.x, pointer.y, viewport]);

  useFrame(() => {
    if (!dragId) return;
    const target = objects.find((obj) => obj.id === dragId);
    const z = target?.position[2] ?? 0;
    const v = viewport.getCurrentViewport(camera, [0, 0, z]);
    const next = new Vector3((pointer.x * v.width) / 2, (pointer.y * v.height) / 2, z);
    onMove(Math.max(-5.8, Math.min(5.8, next.x)), Math.max(-3.7, Math.min(3.7, next.y)));
  });
  return null;
}

export default function ChromeScene({
  objects,
  placing = false,
  onChange,
}) {
  const [dragId, setDragId] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleGrab = useCallback((e, id) => {
    e.stopPropagation();
    setDragId(id);
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  }, []);

  const releaseDrag = useCallback(() => setDragId(null), []);

  const handleMove = useCallback(
    (x, y) => {
      if (!dragId || !onChange) return;
      onChange(
        objects.map((o) => (o.id === dragId ? { ...o, position: [x, y, o.position[2]] } : o)),
      );
    },
    [dragId, objects, onChange],
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      className="!touch-none"
      onPointerUp={(e) => {
        if (e.target instanceof Element && e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
        releaseDrag();
      }}
      onPointerCancel={releaseDrag}
      onPointerLeave={releaseDrag}
      style={{ cursor: placing ? (dragId ? "grabbing" : "grab") : "default" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, -4]} intensity={0.8} color="#9df" />
      <Suspense fallback={null}>
        <Rig enabled={!placing}>
          {objects.map((o) => (
            <SceneItem
              key={o.id}
              obj={o}
              placing={placing}
              active={dragId === o.id}
              hovered={hovered === o.id}
              onGrab={handleGrab}
              onHover={setHovered}
            />
          ))}
        </Rig>
        <Environment preset="studio" />
      </Suspense>
      <Dragger
        dragId={dragId}
        objects={objects}
        placing={placing}
        onPick={setDragId}
        onRelease={releaseDrag}
        onMove={handleMove}
      />
      <OrbitControls
        enabled={!placing}
        enablePan={false}
        enableZoom={false}
        autoRotate={!placing}
        autoRotateSpeed={0.6}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}

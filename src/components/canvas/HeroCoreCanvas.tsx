"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Curated Sleek Developer Tech Stack Colors (Harmonious Sapphire, Azure, Cyan & White)
const TECH_STACK = [
  { name: "Python", color: "#60A5FA", icon: "🐍" },
  { name: "Java", color: "#93C5FD", icon: "☕" },
  { name: "React", color: "#38BDF8", icon: "⚛️" },
  { name: "Next.js", color: "#F8FAFC", icon: "▲" },
  { name: "Docker", color: "#3B82F6", icon: "🐳" },
  { name: "Linux", color: "#38BDF8", icon: "🐧" },
  { name: "AI", color: "#818CF8", icon: "🤖" },
  { name: "ML", color: "#A5B4FC", icon: "🧠" },
  { name: "Cloud", color: "#60A5FA", icon: "☁️" },
  { name: "Git", color: "#F87171", icon: "🌿" },
  { name: "Firebase", color: "#FBBF24", icon: "🔥" },
  { name: "Supabase", color: "#34D399", icon: "⚡" },
  { name: "JavaScript", color: "#FBBF24", icon: "🟨" },
];

function NeuralCoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerWireframeRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (outerWireframeRef.current) {
      outerWireframeRef.current.rotation.y -= delta * 0.2;
      outerWireframeRef.current.rotation.z += delta * 0.15;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
      ring1Ref.current.rotation.x += delta * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.6;
      ring2Ref.current.rotation.y += delta * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.4;
      ring3Ref.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group scale={0.95}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 3]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#1E40AF"
          emissiveIntensity={1.8}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh ref={outerWireframeRef}>
        <sphereGeometry args={[1.7, 16, 16]} />
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#2563EB"
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.1, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={2.5}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.5, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#818CF8"
          emissive="#4F46E5"
          emissiveIntensity={2.5}
        />
      </mesh>

      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 4, Math.PI / 3]}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#2563EB"
          emissiveIntensity={2.0}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles({ count = 250 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#3B82F6"),
      new THREE.Color("#38BDF8"),
      new THREE.Color("#818CF8"),
      new THREE.Color("#60A5FA"),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 2.8 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

function OrbitingTechBadges() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {TECH_STACK.map((tech, index) => {
        const angle = (index / TECH_STACK.length) * Math.PI * 2;
        const radius = 3.3;
        const heightOffset = Math.sin(index * 1.5) * 0.9;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={tech.name} position={[x, heightOffset, z]}>
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <Html center distanceFactor={11} zIndexRange={[0, 10]}>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0F19]/90 backdrop-blur-xl border text-xs font-bold whitespace-nowrap shadow-xl cursor-pointer transition-all hover:scale-110 hover:border-cyan-400 select-none"
                  style={{
                    boxShadow: `0 0 16px ${tech.color}35`,
                    borderColor: `${tech.color}45`,
                  }}
                >
                  <span className="text-sm">{tech.icon}</span>
                  <span style={{ color: tech.color }}>{tech.name}</span>
                </div>
              </Html>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

export function HeroCoreCanvas() {
  return (
    <div className="w-full h-full min-h-[480px] sm:min-h-[550px] relative z-0 overflow-visible">
      <Canvas
        camera={{ position: [0, 0, 9.8], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.6} color="#3B82F6" />
        <pointLight position={[-10, -10, -5]} intensity={2.2} color="#06B6D4" />

        <NeuralCoreSphere />
        <FloatingParticles count={250} />
        <OrbitingTechBadges />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}

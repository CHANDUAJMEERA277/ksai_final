"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck, Cpu, Code2, Users } from "lucide-react";

const AUTH_TECH_STACK = [
  { name: "React", color: "#38BDF8", icon: "⚛️" },
  { name: "Next.js", color: "#F8FAFC", icon: "▲" },
  { name: "Java", color: "#93C5FD", icon: "☕" },
  { name: "Python", color: "#60A5FA", icon: "🐍" },
  { name: "Docker", color: "#3B82F6", icon: "🐳" },
  { name: "Linux", color: "#38BDF8", icon: "🐧" },
  { name: "AI", color: "#818CF8", icon: "🤖" },
  { name: "Cloud", color: "#60A5FA", icon: "☁️" },
  { name: "Git", color: "#F87171", icon: "🌿" },
];

const HIGHLIGHTS = [
  { text: "AI Coding Mentor", icon: Code2, color: "#3B82F6" },
  { text: "Smart Learning", icon: Sparkles, color: "#38BDF8" },
  { text: "Workforce Management", icon: Cpu, color: "#818CF8" },
  { text: "Real-Time Collaboration", icon: Users, color: "#10B981" },
  { text: "Secure Authentication", icon: ShieldCheck, color: "#60A5FA" },
];

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y -= delta * 0.3;
      outerRef.current.rotation.z += delta * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.6;
      ring1Ref.current.rotation.x += delta * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.5;
      ring2Ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group scale={0.95}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#1E40AF"
          emissiveIntensity={2.0}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh ref={outerRef}>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#2563EB"
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.0, 0.025, 16, 100]} />
        <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={2.5} />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.4, 0.025, 16, 100]} />
        <meshStandardMaterial color="#818CF8" emissive="#4F46E5" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

function OrbitingBadges() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {AUTH_TECH_STACK.map((tech, index) => {
        const angle = (index / AUTH_TECH_STACK.length) * Math.PI * 2;
        const radius = 3.0;
        const height = Math.sin(index * 1.8) * 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={tech.name} position={[x, height, z]}>
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <Html center distanceFactor={10.5}>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0F19]/90 backdrop-blur-xl border text-xs font-bold whitespace-nowrap shadow-xl select-none"
                  style={{
                    boxShadow: `0 0 14px ${tech.color}35`,
                    borderColor: `${tech.color}45`,
                  }}
                >
                  <span className="text-xs">{tech.icon}</span>
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

export function AuthSceneCanvas() {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeHighlight = HIGHLIGHTS[activeHighlightIndex];
  const Icon = activeHighlight.icon;

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 pt-16 z-10 overflow-hidden">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Logo */}
      <div className="flex items-center gap-3 z-20 pt-8 pl-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400 p-[1px] shadow-lg shadow-blue-500/30 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="KnowledgeStream AI Logo" className="w-full h-full object-cover rounded-[10px]" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
            Knowledge<span className="text-blue-500">Stream</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              AI OS
            </span>
          </span>
        </div>
      </div>

      {/* Center 3D Three.js AI Core Canvas */}
      <div className="w-full h-[360px] sm:h-[450px] relative my-auto overflow-visible">
        <Canvas camera={{ position: [0, 0, 8.5], fov: 46 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#3B82F6" />
          <pointLight position={[-8, -5, -5]} intensity={1.5} color="#06B6D4" />

          <CoreSphere />
          <OrbitingBadges />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1.0}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.4}
          />
        </Canvas>
      </div>

      {/* Bottom Text & Auto-Rotating Feature Checklist */}
      <div className="space-y-2.5 z-20 max-w-xl pb-2 pl-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Where Learning Meets <span className="gradient-text-hero">Intelligence.</span>
        </h1>

        <div className="h-8 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHighlight.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-white/15 text-sm font-semibold text-white shadow-lg"
            >
              <CheckCircle2 size={18} className="text-emerald-400" />
              <Icon size={18} style={{ color: activeHighlight.color }} />
              <span>{activeHighlight.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

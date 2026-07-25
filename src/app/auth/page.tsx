"use client";

import React, { useState } from "react";
import { BackgroundParticles } from "@/components/canvas/BackgroundParticles";
import { AuthSceneCanvas } from "@/components/auth/AuthSceneCanvas";
import { AuthGlassCard } from "@/components/auth/AuthGlassCard";
import { ArrowLeft, CheckCircle2, UserCheck, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [authUser, setAuthUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  return (
    <main className="relative h-screen lg:h-dvh bg-[#09090B] text-white overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Background Particles & Grid */}
      <BackgroundParticles />

      {/* Top Floating Back Link */}
      <div className="absolute top-[clamp(0.75rem,2.5vh,1.5rem)] left-[clamp(0.75rem,2.5vw,1.5rem)] z-30">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10 text-[10px] font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all shadow-lg"
        >
          <ArrowLeft size={12} />
          Back to Homepage
        </a>
      </div>

      {/* Main Responsive Layout */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 h-full items-center z-10 max-h-screen overflow-hidden">
        {/* Left Side (60% Desktop / Top on Tablet / Hidden on Mobile) */}
        <div className="hidden md:block lg:col-span-7 h-full border-r border-white/5 bg-gradient-to-b from-[#09090B] via-[#0D0D18] to-[#09090B] relative overflow-hidden flex items-center justify-center p-0">
          <div className="hero-scale-wrapper">
            <AuthSceneCanvas />
          </div>
        </div>

        {/* Right Side (40% Desktop / Bottom on Tablet / Fullscreen Mobile) */}
        <div className="lg:col-span-5 w-full h-full flex items-center justify-center p-[clamp(0.5rem,2vh,1.5rem)] relative z-20 my-auto overflow-hidden">
          <AnimatePresence mode="wait">
            {!authUser ? (
              <AuthGlassCard onAuthSuccess={(user) => setAuthUser(user)} />
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 rounded-3xl border border-emerald-500/50 text-center space-y-5 max-w-md w-full shadow-2xl bg-emerald-950/20"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl font-extrabold text-white">
                    Welcome, {authUser.name || "Explorer"}!
                  </h2>
                  <p className="text-slate-300 text-xs">
                    Authenticated into <span className="text-cyan-400 font-bold">{authUser.role || "Student"}</span> workspace in local SQLite database.
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#0C0C14]/80 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Logged in as: {authUser.email}</span>
                </div>

                <a
                  href="/dashboard"
                  className="inline-block px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 glow-btn"
                >
                  Enter OS Dashboard &rarr;
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

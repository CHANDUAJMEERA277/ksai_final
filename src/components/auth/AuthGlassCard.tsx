"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { AuthLoadingOverlay } from "./AuthLoadingOverlay";

interface AuthGlassCardProps {
  onAuthSuccess: (user: { name?: string; email?: string; role?: string }) => void;
}

export function AuthGlassCard({ onAuthSuccess }: AuthGlassCardProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  const handleStartAuth = (user: { name?: string; email?: string; role?: string }) => {
    setAuthenticatedUser(user);
    setIsLoading(true);
  };

  const handleCompleteAuth = () => {
    setIsLoading(false);
    if (authenticatedUser) {
      onAuthSuccess(authenticatedUser);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center max-h-full">
      {/* Floating Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="p-[clamp(0.75rem,2.5vh,1.5rem)] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-[#0a0a0f] backdrop-blur-2xl shadow-[0_0_30px_rgba(139,92,246,0.15),0_0_60px_rgba(34,211,238,0.1)] animate-float flex flex-col max-h-[92vh]"
      >
        {/* Top Radial Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-purple-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Card Header Title */}
        <div className="text-center mb-[clamp(0.35rem,1.5vh,1rem)] space-y-0.5 flex-shrink-0">
          <h2 className="text-[clamp(1.1rem,2.5vh,1.45rem)] font-extrabold text-[#f5f5f7] tracking-tight leading-tight">
            {activeTab === "login" ? "Welcome Back 👋" : "Join KnowledgeStream 🚀"}
          </h2>
          <p className="text-[clamp(0.6rem,1.4vh,0.75rem)] text-[#a0a0b0]">
            {activeTab === "login"
              ? "Continue your intelligent AI journey."
              : "Create your account and start building."}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="relative p-0.5 rounded-xl bg-[#0a0a10] border border-white/10 flex items-center mb-[clamp(0.35rem,1.5vh,1rem)] flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-1.5 rounded-lg text-[clamp(0.65rem,1.6vh,0.75rem)] font-bold transition-all relative z-10 ${
              activeTab === "login" ? "text-white" : "text-[#6b7280] hover:text-[#9ca3af]"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-1.5 rounded-lg text-[clamp(0.65rem,1.6vh,0.75rem)] font-bold transition-all relative z-10 ${
              activeTab === "signup" ? "text-white" : "text-[#6b7280] hover:text-[#9ca3af]"
            }`}
          >
            Sign Up
          </button>

          {/* Animated Pill Background */}
          <motion.div
            className="absolute inset-y-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md"
            initial={false}
            animate={{
              left: activeTab === "login" ? "2px" : "50%",
              width: "calc(50% - 2px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <LoginForm
                  onSubmitSuccess={handleStartAuth}
                  onSwitchToSignUp={() => setActiveTab("signup")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <SignUpForm
                  onSubmitSuccess={handleStartAuth}
                  onSwitchToLogin={() => setActiveTab("login")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Simulated Multi-step Loading Overlay */}
      {isLoading && <AuthLoadingOverlay onComplete={handleCompleteAuth} />}
    </div>
  );
}

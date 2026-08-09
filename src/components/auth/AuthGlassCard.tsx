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
  const isSignupActive = activeTab === "signup";
  const [authenticatedUser, setAuthenticatedUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [googlePrefill, setGooglePrefill] = useState<{
    name: string;
    email: string;
    googleId?: string;
    emailVerified?: boolean;
  } | null>(null);

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

  const handleGooglePrefill = (data: {
    name: string;
    email: string;
    googleId?: string;
    emailVerified?: boolean;
  }) => {
    setGooglePrefill(data);
    setActiveTab("signup");
  };

  return (
    <div className={`w-full mx-auto transition-all duration-300 ${isSignupActive ? "max-w-xl sm:max-w-2xl" : "max-w-md sm:max-w-lg"}`}>
      {/* Floating Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative bg-[#0C0C14]/90 backdrop-blur-2xl glow-border-blue w-full flex flex-col"
      >
        {/* Top Radial Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {activeTab === "login" && (
          <div className="text-center mb-5 space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome Back 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Continue your intelligent AI journey.
            </p>
          </div>
        )}

        {/* Tab Switcher Pills */}
        <div className="relative p-1.5 rounded-2xl bg-white/5 border border-white/15 flex items-center mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all relative z-10 ${
              activeTab === "login" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all relative z-10 ${
              activeTab === "signup" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>

          {/* Animated Pill Background */}
          <motion.div
            className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
            initial={false}
            animate={{
              left: activeTab === "login" ? "6px" : "50%",
              width: "calc(50% - 6px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Form Content */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm
                  onSubmitSuccess={handleStartAuth}
                  onSwitchToSignUp={() => setActiveTab("signup")}
                  onGooglePrefill={handleGooglePrefill}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignUpForm
                  onSubmitSuccess={handleStartAuth}
                  onSwitchToLogin={() => setActiveTab("login")}
                  googlePrefill={googlePrefill}
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

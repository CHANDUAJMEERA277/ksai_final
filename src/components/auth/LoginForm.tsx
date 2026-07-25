"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onSubmitSuccess: (user: { name: string; email: string; role: string }) => void;
  onSwitchToSignUp: () => void;
}

export function LoginForm({ onSubmitSuccess, onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError(null);
  setSubmitting(true);

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result) {
      setError("Something went wrong.");
      setSubmitting(false);
      return;
    }

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    window.location.href = "/dashboard";
  } catch (err) {
    console.error(err);
    setError("Something went wrong.");
    setSubmitting(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-[clamp(0.35rem,1vh,0.75rem)] pr-1.5">
        {error && (
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
            Email Address
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@knowledgestream.ai"
              className="w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0]">
              Password
            </label>
            <a href="#" className="text-[10px] text-cyan-400/80 hover:text-cyan-400 hover:underline">
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/70" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-8 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-cyan-400 cursor-pointer"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-purple-500/30 bg-[#1a1a2e] text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 w-3 h-3 cursor-pointer"
          />
          <label htmlFor="remember" className="text-[10px] text-[#a0a0b0] cursor-pointer select-none">
            Remember me on this device
          </label>
        </div>
      </div>

      {/* Action / Buttons Section */}
      <div className="flex-shrink-0 pt-2 space-y-2">
        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-[clamp(0.45rem,1.1vh,0.65rem)] rounded-xl font-bold text-white text-[11px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(34,211,238,0.3),0_0_40px_rgba(139,92,246,0.2)] disabled:opacity-60 transition-all cursor-pointer"
        >
          {submitting ? "Signing in..." : "Login to AI Workspace"}
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Divider */}
        <div className="relative my-2 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-2 bg-[#0a0a0f] text-[9px] uppercase font-bold text-[#6b7280] tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { name: "Google", icon: "🌐" },
            { name: "GitHub", icon: "💻" },
            { name: "Microsoft", icon: "❖" },
            { name: "Apple", icon: "🍎" },
          ].map((provider) => (
            <button
              key={provider.name}
              type="button"
              onClick={async () => {
                if (provider.name === "Google") {
                  await signIn("google", { callbackUrl: "/dashboard" });
                  return;
                }
                if (provider.name === "GitHub") {
                  await signIn("github", { callbackUrl: "/dashboard" });
                  return;
                }
                setEmail(`demo@${provider.name.toLowerCase()}.com`);
                setPassword("demo12345");
              }}
              className="py-1.5 rounded-xl bg-[#1a1a2e] border border-white/10 hover:border-cyan-500/40 text-[10px] font-semibold text-[#e2e8f0] hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span>{provider.icon}</span>
              <span className="hidden sm:inline">{provider.name}</span>
            </button>
          ))}
        </div>

        {/* Bottom Switcher */}
        <div className="text-center pt-1 text-[11px] text-[#a0a0b0]">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-cyan-400 font-bold hover:underline cursor-pointer"
          >
            Create Account &rarr;
          </button>
        </div>
      </div>
    </form>
  );
}

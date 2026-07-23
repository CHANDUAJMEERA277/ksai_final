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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
          Email Address
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@knowledgestream.ai"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Password
          </label>
          <a href="#" className="text-xs text-cyan-400 hover:underline">
            Forgot Password?
          </a>
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer select-none">
          Remember me on this device
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 glow-btn flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/25 mt-2 disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Login to AI Workspace"}
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Divider */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-[#0C0C14] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          OR CONTINUE WITH
        </span>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-4 gap-2.5">
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
  await signIn("google", {
    callbackUrl: "/dashboard",
  });
  return;
}

            if (provider.name === "GitHub") {
  await signIn("github", {
    callbackUrl: "/dashboard",
  });
  return;
}

  setEmail(`demo@${provider.name.toLowerCase()}.com`);
  setPassword("demo12345");
}}
            className="py-2.5 rounded-xl glass-panel border border-white/10 hover:border-blue-500/40 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{provider.icon}</span>
            <span className="hidden sm:inline">{provider.name}</span>
          </button>
        ))}
      </div>

      {/* Bottom Switcher */}
      <div className="text-center pt-2 text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-cyan-400 font-bold hover:underline"
        >
          Create Account &rarr;
        </button>
      </div>
    </form>
  );
}

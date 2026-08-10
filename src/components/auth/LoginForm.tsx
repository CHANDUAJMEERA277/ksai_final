"use client";

import React, { useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound, RotateCcw, Edit2 } from "lucide-react";

interface LoginFormProps {
  onSubmitSuccess: (user: { name: string; email: string; role: string }) => void;
  onSwitchToSignUp: () => void;
  onGooglePrefill?: (data: {
    name: string;
    email: string;
    googleId?: string;
    emailVerified?: boolean;
  }) => void;
}

function validatePassword(password: string) {
  const checks = [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase", passed: /[A-Z]/.test(password) },
    { label: "Lowercase", passed: /[a-z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
    { label: "Special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];

  return {
    checks,
    passed: checks.every((check) => check.passed),
  };
}

export function LoginForm({ onSubmitSuccess, onSwitchToSignUp, onGooglePrefill }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotStep, setForgotStep] = useState<"login" | "email" | "otp" | "password">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpDigits, setForgotOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotSendingOtp, setForgotSendingOtp] = useState(false);
  const [forgotVerifyingOtp, setForgotVerifyingOtp] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const forgotInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const forgotPasswordState = useMemo(() => validatePassword(forgotPassword), [forgotPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Login failed.");
        setSubmitting(false);
        return;
      }

      onSubmitSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError("Network error connecting to authentication server.");
      setSubmitting(false);
    }
  };

const handleGoogleSignIn = async () => {
  setError(null);
  setSuccessMessage(null);

  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  } catch (err) {
    console.error("Google Sign-In Error:", err);
    setError("Google Sign-In failed. Please try again.");
  }
};
  const handleForgotOtpSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim()) {
      setError("Please enter the email address associated with your account.");
      return;
    }

    setForgotSendingOtp(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, purpose: "reset-password" }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Unable to send a reset code right now.");
        setForgotSendingOtp(false);
        return;
      }

      setForgotOtpDigits(Array(6).fill(""));
      setForgotCountdown(600);
      setSuccessMessage("Verification code sent successfully. We have sent a reset code to your email.");
      setForgotStep("otp");
    } catch (err) {
      console.error(err);
      setError("Network error sending reset code.");
    } finally {
      setForgotSendingOtp(false);
    }
  };

  const handleForgotOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const code = forgotOtpDigits.join("");
    if (code.length !== 6) return;

    setForgotVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: code }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "The reset code is invalid or has expired.");
        setForgotVerifyingOtp(false);
        return;
      }

      setSuccessMessage("OTP verified. Please enter your new password.");
      setForgotStep("password");
    } catch (err) {
      console.error(err);
      setError("Network error verifying reset code.");
    } finally {
      setForgotVerifyingOtp(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotPasswordState.passed) {
      setError("Use a stronger password with 8+ characters, uppercase, number, and a special character.");
      return;
    }

    if (forgotPassword !== forgotConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setForgotSubmitting(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, password: forgotPassword }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Unable to reset password.");
        setForgotSubmitting(false);
        return;
      }

      setSuccessMessage("Password updated successfully. You can now sign in with your new password.");
      setForgotStep("login");
      setForgotPassword("");
      setForgotConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Network error updating password.");
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 1);
    const nextDigits = [...forgotOtpDigits];
    nextDigits[index] = sanitized;
    setForgotOtpDigits(nextDigits);

    if (sanitized && index < 5) {
      forgotInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !forgotOtpDigits[index] && index > 0) {
      const nextDigits = [...forgotOtpDigits];
      nextDigits[index - 1] = "";
      setForgotOtpDigits(nextDigits);
      forgotInputRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const nextDigits = Array(6).fill("");
    pasted.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setForgotOtpDigits(nextDigits);
  };

  const renderForgotPasswordFlow = () => {
    if (forgotStep === "email") {
      return (
        <form onSubmit={handleForgotOtpSend} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotSendingOtp || !forgotEmail.trim()}
            className="w-full py-[clamp(0.45rem,1.1vh,0.65rem)] rounded-xl font-bold text-white text-[11px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {forgotSendingOtp ? "Sending reset code..." : "Send OTP"}
            {forgotSendingOtp ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
          </button>
          <button type="button" onClick={() => setForgotStep("login")} className="text-[11px] text-cyan-400 hover:underline">
            Back to login
          </button>
        </form>
      );
    }

    if (forgotStep === "otp") {
      return (
        <form onSubmit={handleForgotOtpVerify} className="space-y-3">
          <div className="text-center text-[11px] text-slate-400">
            Enter the 6-digit code sent to <span className="text-cyan-300">{forgotEmail}</span>.
          </div>
          <div className="flex items-center justify-center gap-2" onPaste={handleForgotOtpPaste}>
            {forgotOtpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  forgotInputRefs.current[index] = node;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleForgotOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleForgotOtpKeyDown(index, event)}
                className="h-10 w-8 rounded-lg border border-purple-500/30 bg-[#1a1a2e] text-center text-sm font-semibold text-white"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={forgotVerifyingOtp || forgotOtpDigits.join("").length !== 6}
            className="w-full py-[clamp(0.45rem,1.1vh,0.65rem)] rounded-xl font-bold text-white text-[11px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {forgotVerifyingOtp ? "Verifying..." : "Verify OTP"}
            {forgotVerifyingOtp ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          </button>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button type="button" onClick={() => handleForgotOtpSend()} className="text-cyan-400 hover:underline flex items-center gap-1" disabled={forgotSendingOtp || forgotCountdown > 0}>
              <RotateCcw size={12} /> {forgotSendingOtp ? "Sending..." : forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : "Resend OTP"}
            </button>
            <button type="button" onClick={() => setForgotStep("email")} className="hover:text-white">
              Change email
            </button>
          </div>
        </form>
      );
    }

    if (forgotStep === "password") {
      return (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/70" />
              <input
                type={showForgotPassword ? "text" : "password"}
                value={forgotPassword}
                onChange={(e) => setForgotPassword(e.target.value)}
                className="w-full pl-9 pr-8 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowForgotPassword(!showForgotPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]">
                {showForgotPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/70" />
              <input
                type={showForgotConfirmPassword ? "text" : "password"}
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-8 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]">
                {showForgotConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {forgotPassword.length > 0 && !forgotPasswordState.passed && (
            <ul className="ml-4 text-[10px] text-slate-400 list-disc space-y-1">
              {forgotPasswordState.checks.map((check) => (
                <li key={check.label}>{check.label}</li>
              ))}
            </ul>
          )}
          <button
            type="submit"
            disabled={forgotSubmitting || !forgotPasswordState.passed || forgotPassword !== forgotConfirmPassword}
            className="w-full py-[clamp(0.45rem,1.1vh,0.65rem)] rounded-xl font-bold text-white text-[11px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {forgotSubmitting ? "Updating password..." : "Update Password"}
            {forgotSubmitting ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
          </button>
          <button type="button" onClick={() => setForgotStep("login")} className="text-[11px] text-cyan-400 hover:underline">
            Back to login
          </button>
        </form>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-[clamp(0.35rem,1vh,0.75rem)] pr-1.5">
        {error && (
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center gap-1.5">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {forgotStep !== "login" ? (
          renderForgotPasswordFlow()
        ) : (
          <>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">Email Address</label>
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

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0]">Password</label>
                <button type="button" onClick={() => setForgotStep("email")} className="text-[10px] text-cyan-400/80 hover:text-cyan-400 hover:underline">
                  Forgot Password?
                </button>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-cyan-400 cursor-pointer">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

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
          </>
        )}
      </div>

      <div className="flex-shrink-0 pt-2 space-y-2">
        {forgotStep === "login" ? (
          <>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-[clamp(0.45rem,1.1vh,0.65rem)] rounded-xl font-bold text-white text-[11px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(34,211,238,0.3),0_0_40px_rgba(139,92,246,0.2)] disabled:opacity-60 transition-all cursor-pointer"
            >
              {submitting ? "Signing in..." : "Login to AI Workspace"}
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-2 bg-[#0a0a0f] text-[9px] uppercase font-bold text-[#6b7280] tracking-wider">
                OR CONTINUE WITH
              </span>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-1.5 rounded-xl bg-[#1a1a2e] border border-white/10 hover:border-cyan-500/40 text-[10px] font-semibold text-[#e2e8f0] hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>🌐</span>
                <span>Google</span>
              </button>
            </div>

            <div className="text-center pt-1 text-[11px] text-[#a0a0b0]">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={onSwitchToSignUp} className="text-cyan-400 font-bold hover:underline cursor-pointer">
                Create Account &rarr;
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

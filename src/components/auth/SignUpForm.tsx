"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Globe, ArrowRight, AlertCircle } from "lucide-react";
import { RoleSelector, RoleType } from "./RoleSelector";

interface SignUpFormProps {
  onSubmitSuccess: (user: { name: string; email: string; role: string }) => void;
  onSwitchToLogin: () => void;
}

export function SignUpForm({ onSubmitSuccess, onSwitchToLogin }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RoleType>("Student");
  const [country, setCountry] = useState("United States");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role,
          country,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Registration failed.");
        setSubmitting(false);
        return;
      }

     alert("🎉 Account created successfully! Please login.");
     setName("");
     setEmail("");
     setPhone("");
     setPassword("");
     setConfirmPassword(""); 
     onSwitchToLogin();
    } catch (err) {
      console.error(err);
      setError("Network error connecting to local DB.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-[clamp(0.3rem,0.9vh,0.55rem)] pr-1.5">
        {error && (
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
            Full Name
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Email & Phone grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(0.35rem,0.8vh,0.65rem)]">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
              Email
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@tech.com"
                className="w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/70" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Role Selector Matrix */}
        <RoleSelector selectedRole={role} onSelectRole={setRole} />

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(0.35rem,0.8vh,0.65rem)]">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/70" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-8 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white placeholder-[#6b7280] text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-cyan-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/70" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border text-white text-xs focus:outline-none transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-cyan-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Country Selector */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] block">
            Country / Region
          </label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full pl-9 pr-3 py-[clamp(0.35rem,0.9vh,0.5rem)] rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
              <option value="Canada">Canada</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>
        </div>

        {/* Accept Terms */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="rounded border-purple-500/30 bg-[#1a1a2e] text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 w-3 h-3 cursor-pointer"
          />
          <label htmlFor="terms" className="text-[10px] text-[#a0a0b0] cursor-pointer select-none">
            I agree to KnowledgeStream AI <span className="text-cyan-400 underline">Terms</span> &amp; <span className="text-cyan-400 underline">Privacy</span>
          </label>
        </div>
      </div>

      {/* Action/Buttons Section */}
      <div className="flex-shrink-0 pt-2 space-y-2">
        {/* Submit Button */}
        <button
          type="submit"
          disabled={!acceptTerms || submitting || (!!password && password !== confirmPassword)}
          className="w-full py-[clamp(0.45rem,1.1vh,0.65rem)] rounded-xl font-bold text-white text-[11px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(34,211,238,0.3),0_0_40px_rgba(139,92,246,0.2)] disabled:opacity-50 transition-all cursor-pointer"
        >
          {submitting ? "Writing to SQLite DB..." : "Create Account & Start"}
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Social Logins */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-[#a0a0b0]">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-cyan-400 font-bold hover:underline cursor-pointer"
          >
            Login &rarr;
          </button>
        </div>
      </div>
    </form>
  );
}

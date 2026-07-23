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
    <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
          Full Name
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Email & Phone grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@tech.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Role Selector Matrix */}
      <RoleSelector selectedRole={role} onSelectRole={setRole} />

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-white text-xs focus:outline-none ${
                confirmPassword && confirmPassword !== password
                  ? "border-red-500 focus:border-red-500"
                  : "border-white/10 focus:border-cyan-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Country Selector */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
          Country / Region
        </label>
        <div className="relative">
          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#12121A] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
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
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="terms" className="text-[11px] text-slate-300 cursor-pointer">
          I agree to KnowledgeStream AI <span className="text-cyan-400 underline">Terms of Service</span> &amp; <span className="text-cyan-400 underline">Privacy Policy</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!acceptTerms || submitting || (!!password && password !== confirmPassword)}
        className="w-full py-3 rounded-xl font-bold text-white text-xs bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 glow-btn flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {submitting ? "Writing to SQLite DB..." : "Create Account & Start"}
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Social Logins */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-cyan-400 font-bold hover:underline"
        >
          Login &rarr;
        </button>
      </div>
    </form>
  );
}

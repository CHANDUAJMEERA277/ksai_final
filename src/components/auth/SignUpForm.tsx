"use client";

import React, { useMemo, useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

interface SignUpFormProps {
  onSubmitSuccess: (user: { name: string; email: string; role: string }) => void;
  onSwitchToLogin: () => void;
}

interface FormTouchedState {
  name: boolean;
  email: boolean;
  phone: boolean;
  collegeName: boolean;
  department: boolean;
  currentYear: boolean;
  password: boolean;
  confirmPassword: boolean;
  acceptTerms: boolean;
}

const DEPARTMENT_OPTIONS = [
  "Artificial Intelligence & Data Science",
  "Computer Science Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "MBA",
  "MCA",
  "BCA",
  "BSc",
  "Other",
];

const YEAR_OPTIONS = ["B.Tech I", "B.Tech II", "B.Tech III", "B.Tech IV", "Others"];

interface DarkSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  hasError: boolean;
  onBlur?: () => void;
}

function DarkSelect({ value, onChange, options, placeholder, hasError, onBlur }: DarkSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option === value) ?? placeholder;

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
          onBlur?.();
        }
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs focus:outline-none focus:border-cyan-400 ${
          hasError ? "border-red-500/70 focus:border-red-400" : "border-white/10"
        } ${value ? "text-white" : "text-slate-500"}`}
        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="ml-3 text-slate-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-white/10 bg-[#0C0C14]/95 p-1.5 shadow-2xl backdrop-blur-xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                value === option ? "bg-cyan-500/15 text-cyan-300" : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function validatePassword(password: string) {
  const checks = [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase", passed: /[A-Z]/.test(password) },
    { label: "Lowercase", passed: /[a-z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
    { label: "Special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const strength = passedCount <= 2 ? "Weak" : passedCount <= 4 ? "Good" : "Strong";

  return { checks, strength, passed: passedCount === checks.length };
}

function validateName(name: string) {
  if (!name.trim()) return "Full name is required.";
  if (name.trim().length < 3 || name.trim().length > 50) return "Name must be between 3 and 50 characters.";
  return null;
}

function validateEmail(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Email is required.";
  if (!emailPattern.test(email.trim().toLowerCase())) return "Please enter a valid email address.";
  return null;
}

function validatePhone(phone: string) {
  if (!phone.trim()) return "Phone number is required.";
  if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ""))) return "Phone number must be exactly 10 digits.";
  return null;
}

function validateCollegeName(value: string) {
  if (!value.trim()) return "College name is required for students.";
  return null;
}

function validateDepartment(value: string) {
  if (!value) return "Department is required for students.";
  return null;
}

function validateCurrentYear(value: string) {
  if (!value) return "Current studying year is required for students.";
  return null;
}

function validateTerms(value: boolean) {
  if (!value) return "Please accept the terms and privacy policy.";
  return null;
}

export function SignUpForm({ onSubmitSuccess, onSwitchToLogin }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [department, setDepartment] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<FormTouchedState>({
    name: false,
    email: false,
    phone: false,
    collegeName: false,
    department: false,
    currentYear: false,
    password: false,
    confirmPassword: false,
    acceptTerms: false,
  });

  const passwordState = useMemo(() => validatePassword(password), [password]);
  const role = "Student";

  const validationErrors = useMemo(() => ({
    name: touched.name ? validateName(name) : null,
    email: touched.email ? validateEmail(email) : null,
    phone: touched.phone ? validatePhone(phone) : null,
    collegeName: touched.collegeName ? validateCollegeName(collegeName) : null,
    department: touched.department ? validateDepartment(department) : null,
    currentYear: touched.currentYear ? validateCurrentYear(currentYear) : null,
    password: touched.password ? (passwordState.passed ? null : "Password must include 8+ characters, uppercase, lowercase, number, and a special character.") : null,
    confirmPassword: touched.confirmPassword ? (confirmPassword && confirmPassword === password ? null : "Passwords do not match.") : null,
    acceptTerms: touched.acceptTerms ? validateTerms(acceptTerms) : null,
  }), [acceptTerms, collegeName, confirmPassword, currentYear, department, email, name, password, passwordState.passed, phone, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextTouched = {
      name: true,
      email: true,
      phone: true,
      collegeName: true,
      department: true,
      currentYear: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    };
    setTouched(nextTouched);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.replace(/\D/g, "");
    const nameError = validateName(trimmedName);
    const emailError = validateEmail(trimmedEmail);
    const phoneError = validatePhone(trimmedPhone);
    const collegeError = role === "Student" ? validateCollegeName(collegeName) : null;
    const departmentError = role === "Student" ? validateDepartment(department) : null;
    const yearError = role === "Student" ? validateCurrentYear(currentYear) : null;
    const passwordError = passwordState.passed ? null : "Password must include 8+ characters, uppercase, lowercase, number, and a special character.";
    const confirmError = password !== confirmPassword ? "Passwords do not match." : null;
    const termsError = validateTerms(acceptTerms);

    const formErrors = [nameError, emailError, phoneError, collegeError, departmentError, yearError, passwordError, confirmError, termsError].filter(Boolean);

    if (formErrors.length > 0) {
      setError("Please complete the highlighted fields before continuing.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          phone: trimmedPhone,
          collegeName: role === "Student" ? collegeName.trim() || null : null,
          department: role === "Student" ? (department === "Other" ? customDepartment.trim() || null : department || null) : null,
          currentYear: role === "Student" ? currentYear || null : null,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Registration failed.");
        setSubmitting(false);
        return;
      }

      onSubmitSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError("Network error connecting to local DB.");
      setSubmitting(false);
    }
  };

  const inputClassName = (hasError: boolean) =>
    `w-full px-3 py-2.5 rounded-xl bg-white/5 border text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 ${
      hasError ? "border-red-500/70 focus:border-red-400" : "border-white/10"
    }`;

  const fieldLabelClassName = "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 block";

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-2 space-y-3.5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className={fieldLabelClassName}>Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder="Alex Rivera"
              className={`pl-9 pr-3 py-2.5 ${inputClassName(Boolean(validationErrors.name))}`}
            />
          </div>
          {validationErrors.name && <p className="text-[10px] text-red-300">{validationErrors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={fieldLabelClassName}>Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="alex@tech.com"
                className={`pl-9 pr-3 py-2.5 ${inputClassName(Boolean(validationErrors.email))}`}
              />
            </div>
            {validationErrors.email && <p className="text-[10px] text-red-300">{validationErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className={fieldLabelClassName}>Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                placeholder="9876543210"
                className={`pl-9 pr-3 py-2.5 ${inputClassName(Boolean(validationErrors.phone))}`}
              />
            </div>
            {validationErrors.phone && <p className="text-[10px] text-red-300">{validationErrors.phone}</p>}
          </div>
        </div>

        {role === "Student" && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="space-y-1">
              <label className={fieldLabelClassName}>College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, collegeName: true }))}
                placeholder="Enter College Name"
                className={inputClassName(Boolean(validationErrors.collegeName))}
              />
              {validationErrors.collegeName && <p className="text-[10px] text-red-300">{validationErrors.collegeName}</p>}
            </div>

            <div className="space-y-1">
              <label className={fieldLabelClassName}>Department</label>
              <DarkSelect
                value={department}
                onChange={(value) => {
                  setDepartment(value);
                  setTouched((prev) => ({ ...prev, department: true }));
                }}
                options={DEPARTMENT_OPTIONS}
                placeholder="Select Department"
                hasError={Boolean(validationErrors.department)}
                onBlur={() => setTouched((prev) => ({ ...prev, department: true }))}
              />
              {validationErrors.department && <p className="text-[10px] text-red-300">{validationErrors.department}</p>}
            </div>

            {department === "Other" && (
              <div className="space-y-1">
                <label className={fieldLabelClassName}>Custom Department</label>
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="Enter Department"
                  className={inputClassName(false)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className={fieldLabelClassName}>Current Studying Year</label>
              <DarkSelect
                value={currentYear}
                onChange={(value) => {
                  setCurrentYear(value);
                  setTouched((prev) => ({ ...prev, currentYear: true }));
                }}
                options={YEAR_OPTIONS}
                placeholder="Select Year"
                hasError={Boolean(validationErrors.currentYear)}
                onBlur={() => setTouched((prev) => ({ ...prev, currentYear: true }))}
              />
              {validationErrors.currentYear && <p className="text-[10px] text-red-300">{validationErrors.currentYear}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={fieldLabelClassName}>Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="••••••••"
                className={`pl-9 pr-8 py-2.5 ${inputClassName(Boolean(validationErrors.password))}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {validationErrors.password && <p className="text-[10px] text-red-300">{validationErrors.password}</p>}
            {password.length > 0 && !passwordState.passed && (
              <div className="text-[10px] text-amber-300/90 space-y-1">
                <div className="flex items-center gap-1">
                  <AlertCircle size={12} className="text-amber-400" />
                  <span>Password must contain:</span>
                </div>
                <ul className="ml-4 list-disc space-y-0.5 text-slate-400">
                  {passwordState.checks.map((check) => (
                    <li key={check.label}>{check.label}</li>
                  ))}
                </ul>
              </div>
            )}
            {password.length > 0 && passwordState.passed && (
              <p className="text-[10px] text-emerald-400">✓ Strong password</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={fieldLabelClassName}>Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                placeholder="••••••••"
                className={`pl-9 pr-3 py-2.5 ${inputClassName(Boolean(validationErrors.confirmPassword))}`}
              />
            </div>
            {validationErrors.confirmPassword && <p className="text-[10px] text-red-300">{validationErrors.confirmPassword}</p>}
          </div>
        </div>
      </div>

        <div className="mt-3 border-t border-white/10 pt-3 space-y-2.5 bg-[#0C0C14]/80 backdrop-blur">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                setTouched((prev) => ({ ...prev, acceptTerms: true }));
              }}
              className="mt-0.5 rounded border-white/20 bg-white/5 text-cyan-500"
            />
            <label htmlFor="terms" className="text-[11px] leading-5 text-slate-300 cursor-pointer">
              I agree to KnowledgeStream AI <a href="#" onClick={(e) => e.preventDefault()} className="text-cyan-400 underline">Terms of Service</a> &amp; <a href="#" onClick={(e) => e.preventDefault()} className="text-cyan-400 underline">Privacy Policy</a>
            </label>
          </div>
          {validationErrors.acceptTerms && <p className="text-[10px] text-red-300">{validationErrors.acceptTerms}</p>}

          <button
            type="submit"
            disabled={submitting || !acceptTerms || (!!password && password !== confirmPassword)}
            className="w-full py-3 rounded-xl font-bold text-white text-xs bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 glow-btn flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {submitting ? "Creating Account..." : "Create Account & Start"}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
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

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  User, Lock, Target, Bell, AlertTriangle, ShieldCheck, Check, Key,
  Save, Volume2, Globe, Building, BookOpen, Sparkles, CheckCircle2,
  Trash2, RefreshCw, Smartphone, Mail, Cpu
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "goals" | "notifications" | "danger"
  >("profile");

  // User Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [country, setCountry] = useState("United States");
  const [role, setRole] = useState("Student");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Learning Goals State
  const [targetChapters, setTargetChapters] = useState(2);
  const [targetQuizzes, setTargetQuizzes] = useState(10);
  const [targetAIChats, setTargetAIChats] = useState(5);
  const [preferredTrack, setPreferredTrack] = useState("java");

  // Notifications & Voice State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(80);

  // Danger Zone State
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Status & Feedback States
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (res.ok && json.user) {
          const u = json.user;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setCollege(u.college || "");
          setDepartment(u.department || "");
          setCurrentYear(u.currentYear || "");
          setCountry(u.country || "United States");
          setRole(u.role || "Student");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!isPending) {
      if (!session) {
        router.push("/auth");
      } else {
        loadUserData();
      }
    }
  }, [session, isPending, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          college,
          department,
          currentYear,
          country,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Profile settings updated successfully!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error || "Failed to update profile settings.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error || "Failed to change password.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Network error changing password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deleteConfirmPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/auth";
      } else {
        setErrorMessage(data.error || "Failed to delete account.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Network error deleting account.");
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#4F46E5] animate-spin" />
        <div className="text-slate-600 text-xs font-mono font-bold">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar Menu */}
      <LeftSidebar
        activeTab="Settings"
        onTabChange={(tab) => {
          if (tab === "Dashboard") router.push("/dashboard");
          else if (tab === "Explore Courses") router.push("/courses/catalog");
          else if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Mentor") router.push("/codexai");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Workspace") router.push("/workspace");
          else if (tab === "Certificates") router.push("/certificates");
        }}
        fullHeight={true}
      />

      {/* Main Workspace Content Area */}
      <main className="flex-1 h-full flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full custom-scrollbar">
        {/* Top Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4F46E5] text-xs font-bold border border-blue-100 mb-2">
              <Sparkles size={13} /> Account &amp; Preferences
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Settings ⚙️
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Manage your personal profile, security options, learning goals, and notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
              Role: <span className="text-[#4F46E5] font-black">{role}</span>
            </span>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Settings Tab Navigation & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Sub-Tab Navigation Pills */}
          <div className="lg:col-span-3 space-y-1.5">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full p-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer border ${
                activeTab === "profile"
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <User size={16} /> Profile Details
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full p-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer border ${
                activeTab === "security"
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Lock size={16} /> Security &amp; Password
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`w-full p-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer border ${
                activeTab === "goals"
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Target size={16} /> Weekly Goals &amp; Track
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full p-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer border ${
                activeTab === "notifications"
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bell size={16} /> Notifications &amp; Audio
            </button>

            <button
              onClick={() => setActiveTab("danger")}
              className={`w-full p-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer border ${
                activeTab === "danger"
                  ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20"
                  : "bg-white text-red-600 border-slate-200 hover:bg-red-50/50"
              }`}
            >
              <AlertTriangle size={16} /> Danger Zone
            </button>
          </div>

          {/* Main Right Content Panel */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Tab 1: Profile Details */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <User size={18} className="text-[#4F46E5]" /> Personal Profile
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your display name, college information, and contact info.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name (Non-editable) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">Full Name</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">🔒 Signup Field</span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      disabled
                      title="Name provided at registration is non-editable"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Email Address (Non-editable) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">Email Address (Account ID)</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">🔒 Signup Field</span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-mono font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone Number (Editable) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Country (Editable) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">Country / Region</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    />
                  </div>

                  {/* College / Institution (Non-editable) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">College / Institution</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">🔒 Registered College</span>
                    </div>
                    <input
                      type="text"
                      value={college}
                      disabled
                      title="College name provided at signup is non-editable"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Department / Branch (Non-editable) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">Department / Branch</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">🔒 Registered Branch</span>
                    </div>
                    <input
                      type="text"
                      value={department}
                      disabled
                      title="Branch provided at signup is non-editable"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Current Year */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-black text-slate-700">Current Year of Study</label>
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">-- Select Year --</option>
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Graduated">Graduated / Working Professional</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Security & Password */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Lock size={18} className="text-[#4F46E5]" /> Security &amp; Password
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your account password and manage session security.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="text-xs font-extrabold text-[#4F46E5] flex items-center gap-1.5">
                    <ShieldCheck size={16} /> Active Session Info
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Your session is protected with SHA-256 tokens in local SQLite database.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Key size={14} />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Weekly Goals & Track */}
            {activeTab === "goals" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Target size={18} className="text-[#4F46E5]" /> Learning Goals &amp; Track Preferences
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure your weekly learning targets and default coding track.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Target Chapters */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="text-xs font-black text-slate-700">Target Chapters / Week</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={targetChapters}
                      onChange={(e) => setTargetChapters(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  {/* Target Quizzes */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="text-xs font-black text-slate-700">Target Quizzes / Week</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={targetQuizzes}
                      onChange={(e) => setTargetQuizzes(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  {/* Target AI Sessions */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="text-xs font-black text-slate-700">AI Practice Chats / Week</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={targetAIChats}
                      onChange={(e) => setTargetAIChats(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black text-slate-700">Primary Language Track Focus</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "java", title: "Java Architecture", icon: "☕" },
                      { id: "python", title: "Python AI & DSA", icon: "🐍" },
                      { id: "cpp", title: "C++ STL Masterclass", icon: "⚡" },
                      { id: "c", title: "C Low-Level", icon: "💻" },
                    ].map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setPreferredTrack(track.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                          preferredTrack === track.id
                            ? "bg-blue-50 border-[#4F46E5] text-[#4F46E5] font-black shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-lg">{track.icon}</span>
                        <span className="text-xs font-bold">{track.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setSuccessMessage("Goal preferences updated successfully!");
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Save size={14} /> Save Goal Settings
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Notifications & Audio */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Bell size={18} className="text-[#4F46E5]" /> Notifications &amp; Audio Preferences
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Customize alert notifications and speech synthesis voice output.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email Notifications Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Weekly Digest &amp; Email Alerts</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Receive weekly XP summaries and leaderboard standing notifications via email.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-5 h-5 text-[#4F46E5] rounded accent-[#4F46E5] cursor-pointer"
                    />
                  </div>

                  {/* Streak Alert Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Daily Streak Reminders</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Get in-app reminders to maintain your daily coding streak.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={streakAlerts}
                      onChange={(e) => setStreakAlerts(e.target.checked)}
                      className="w-5 h-5 text-[#4F46E5] rounded accent-[#4F46E5] cursor-pointer"
                    />
                  </div>

                  {/* Speech Voice Volume Slider */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-black text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Volume2 size={16} className="text-[#4F46E5]" /> Lesson Speech Output Volume
                      </span>
                      <span className="font-mono text-[#4F46E5]">{voiceVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                      className="w-full accent-[#4F46E5] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setSuccessMessage("Notification preferences saved!");
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Save size={14} /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Tab 5: Danger Zone */}
            {activeTab === "danger" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-red-600 flex items-center gap-2">
                    <AlertTriangle size={18} /> Danger Zone
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Irreversible actions for your account. Please proceed with caution.
                  </p>
                </div>

                <div className="p-6 rounded-3xl border border-red-200 bg-red-50/40 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900">Delete Account &amp; Wipe Progress</h4>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      Deleting your account will permanently remove your progress, XP scores, certificates, and enrollment status from the database. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Trash2 size={14} /> Delete Account Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">Are you absolutely sure?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your account password below to confirm permanent deletion of your account.
                </p>
              </div>

              <input
                type="password"
                placeholder="Enter password to confirm..."
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500"
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || !deleteConfirmPassword}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingAccount ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

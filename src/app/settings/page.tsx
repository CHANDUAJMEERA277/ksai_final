"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Sliders, 
  Bell, 
  ShieldAlert, 
  CreditCard, 
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  Lock,
  Download,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real Database Profile States
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCollege, setProfileCollege] = useState("");
  const [profileDept, setProfileDept] = useState("");
  const [profileYear, setProfileYear] = useState("");
  const [profileCountry, setProfileCountry] = useState("United States");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Real Password Change States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Real Deletion State
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletionError, setDeletionError] = useState("");

  // User details fetched from /api/dashboard payload
  const [userProfile, setUserProfile] = useState<any>(null);
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [dashboardNotifications, setDashboardNotifications] = useState<{ unreadCount: number; list: any[] }>({
    unreadCount: 0,
    list: [],
  });

  // Notifications toggle ref
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const fetchSettingsData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();

      if (json.success) {
        setUserProfile(json.user);
        setProfileName(json.user.name || "");
        setProfilePhone(json.user.phone || "");
        setProfileCollege(json.user.college || "");
        setProfileDept(json.user.department || "");
        setProfileYear(json.user.currentYear || "");
        setProfileCountry(json.user.country || "United States");

        // Set learning stats from real data
        setEnrollmentsCount(json.continueLearningCourses?.length || 0);
        
        // Fetch real certificates count
        const certRes = await fetch("/api/certificates");
        const certJson = await certRes.json();
        if (certJson.success) {
          setCertificatesCount(certJson.certificates?.length || 0);
        }

        setDashboardNotifications(json.notifications || { unreadCount: 0, list: [] });
      } else {
        setError(json.error || "Failed to load settings data.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        fetchSettingsData();
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, router]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const res = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          college: profileCollege,
          department: profileDept,
          currentYear: profileYear,
          country: profileCountry,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setProfileSuccessMsg("✅ Profile settings saved successfully.");
        // Refresh sidebar and stats data
        fetchSettingsData();
      } else {
        alert(json.error || "Failed to save profile changes.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error saving profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPasswordSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(json.error || "Failed to change password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Network error changing password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadData = () => {
    if (!userProfile) return;

    const exportData = {
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        phone: profilePhone,
        college: profileCollege,
        department: profileDept,
        currentYear: profileYear,
        role: userProfile.role,
        country: profileCountry,
        level: userProfile.level,
        xp: userProfile.xp,
        createdAt: userProfile.createdAt,
      },
      learningStats: {
        enrolledCoursesCount: enrollmentsCount,
        certificatesCount: certificatesCount,
      },
      exportDate: new Date().toISOString(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ksai-profile-${userProfile.email}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletionError("");

    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      setDeletionError("Please type 'delete my account' to confirm.");
      return;
    }

    setDeletingAccount(true);

    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        alert("Your account has been deleted. Redirecting you to login...");
        window.location.href = "/auth";
      } else {
        setDeletionError(json.error || "Failed to delete account.");
      }
    } catch (err) {
      console.error(err);
      setDeletionError("Network error deleting account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok && session?.user) {
        fetchSettingsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "Dashboard") router.push("/dashboard");
    else if (tab === "Courses") router.push("/courses");
    else if (tab === "Leaderboard") router.push("/leaderboard");
    else if (tab === "AI Mentor") router.push("/codexai");
    else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
    else if (tab === "Certificates") router.push("/certificates");
  };

  if (error) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="p-8 rounded-3xl border border-red-200 bg-red-50/50 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="text-red-500 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-slate-900">Settings Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const memberSince = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "N/A";

  const isGoogleUser = userProfile?.provider === "GOOGLE";

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Left Sidebar */}
      <LeftSidebar
        activeTab="Settings"
        onTabChange={handleTabChange}
        userProfile={userProfile || undefined}
        isLight={false}
        fullHeight={true}
      />

      {/* Main Right Area */}
      <main className="flex-1 h-full flex flex-col overflow-hidden p-5 sm:p-6 gap-3.5 w-full min-w-0">
        
        {/* Header Row */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              System Settings ⚙️
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Manage your personal student profile, security settings, credentials, and data exports.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search settings..." 
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 w-60 focus:outline-none focus:border-[#4F46E5] placeholder-slate-400"
                disabled
              />
            </div>

            {/* Notification Icon */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:shadow-sm"
              >
                <Bell size={16} />
                {dashboardNotifications?.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {dashboardNotifications.unreadCount}
                  </span>
                )}
              </button>

              {notificationsDropdownOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 scrollbar-thin">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Notifications</span>
                    <span className="text-[10px] text-slate-400 font-medium">{dashboardNotifications?.unreadCount} unread</span>
                  </div>
                  {dashboardNotifications.list.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                  ) : (
                    dashboardNotifications.list.map((n: any) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer border ${
                          n.read ? "bg-white border-transparent text-slate-500" : "bg-blue-50/40 border-slate-100 text-slate-800 hover:bg-blue-50/70"
                        }`}
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Links Row */}
        <div className="flex border-b border-slate-200/80 gap-6 flex-shrink-0">
          {[
            { id: "Profile", label: "Profile", icon: UserIcon },
            { id: "Account", label: "Account", icon: SettingsIcon },
            { id: "Preferences", label: "Preferences", icon: Sliders },
            { id: "Notifications", label: "Notifications", icon: Bell },
            { id: "Privacy", label: "Privacy & Security", icon: ShieldAlert },
            { id: "Billing", label: "Billing", icon: CreditCard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === tab.id 
                  ? "border-[#4F46E5] text-[#4F46E5]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body Scroll Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar pb-6 min-h-0">
          
          {/* PROFILE TAB */}
          {activeTab === "Profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-1">
              {/* Left Side fields */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Sparkles size={16} className="text-[#4F46E5]" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Edit Student Profile</h3>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      {profileSuccessMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={userProfile?.email || ""}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-xs text-slate-400 cursor-not-allowed focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. +91 98765 43210"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Country / Region</label>
                      <input 
                        type="text" 
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <span>Educational Details</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">College Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Stanford University"
                          value={profileCollege}
                          onChange={(e) => setProfileCollege(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Department</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Computer Science"
                          value={profileDept}
                          onChange={(e) => setProfileDept(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Current Year</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 3rd Year"
                          value={profileYear}
                          onChange={(e) => setProfileYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-md flex items-center justify-center disabled:opacity-50"
                    >
                      {savingProfile ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side Info widgets */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[2px] shadow-md flex items-center justify-center text-2xl font-black text-white">
                    {userProfile?.image ? (
                      <img src={userProfile.image} alt={profileName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      profileName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">{profileName}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 font-bold uppercase mt-1 inline-block">
                      {userProfile?.role || "Student"}
                    </span>
                  </div>

                  <div className="w-full border-t border-slate-100 pt-4 text-left space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Member Since:</span>
                      <span className="text-slate-700 font-bold">{memberSince}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Level / XP:</span>
                      <span className="text-[#4F46E5] font-bold font-mono">Lvl {userProfile?.level || 1} ({userProfile?.xp || 0} XP)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "Account" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-1">
              <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles size={16} className="text-[#4F46E5]" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Account Status</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Subscription Plan</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">Free Learning Tier</div>
                    </div>
                    <span className="text-[9px] px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-500 font-bold uppercase">
                      Default Standard
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Razorpay Integration</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">Active and ready for secure course subscriptions.</div>
                    </div>
                    <span className="text-[9px] px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 size={11} /> Ready
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sliders size={16} className="text-[#4F46E5]" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Learning Stats</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Enrolled Courses</span>
                    <div className="text-xl font-black text-slate-800 font-mono mt-1">{enrollmentsCount}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Certificates Earned</span>
                    <div className="text-xl font-black text-slate-800 font-mono mt-1">{certificatesCount}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 col-span-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Cumulative XP</span>
                    <div className="text-xl font-black text-[#4F46E5] font-mono mt-1">{userProfile?.xp || 0} XP</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "Preferences" && (
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm max-w-2xl space-y-4 py-1">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sliders size={16} className="text-slate-400" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Preferences</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Workspace and AI Mentor personalized preferences (including Dark Mode editor options) are currently managed directly within the coding sandbox activity views. Custom configuration options will be centralizable here in future releases.
              </p>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "Notifications" && (
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm max-w-2xl space-y-4 py-1">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Bell size={16} className="text-slate-400" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Notification Preferences</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Student notification alerts are preconfigured to dispatch updates relating to quiz achievements and streak milestones. Custom toggle controls are currently disabled under default student OS settings.
              </p>
            </div>
          )}

          {/* PRIVACY & SECURITY TAB */}
          {activeTab === "Privacy" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-1">
              {/* Change Password Panel */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleChangePassword} className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Lock size={16} className="text-[#4F46E5]" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Security &amp; Password</h3>
                  </div>

                  {passwordError && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={15} /> Password updated successfully.
                    </div>
                  )}

                  {isGoogleUser && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/60 text-slate-700 text-xs leading-relaxed">
                      💡 You are signed in via Google OAuth. You can set a password below to enable credentials-based direct login.
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Only require old password if they actually have one set */}
                    {!isGoogleUser && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Current Password</label>
                        <input 
                          type="password" 
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required={!isGoogleUser}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-md flex items-center justify-center disabled:opacity-50"
                    >
                      {changingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Side Panels - Quick Actions & Danger Zone */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Download size={15} className="text-slate-400" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Data Portability</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Download a secure JSON archive containing all educational details, course milestones, level progressions, and telemetry logs.
                  </p>
                  <button
                    onClick={handleDownloadData}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <Download size={13} />
                    Download My Data
                  </button>
                </div>

                {/* DANGER ZONE - Account Deletion */}
                <div className="p-6 rounded-3xl border border-red-200 bg-red-50/20 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-red-200/50">
                    <Trash2 size={15} className="text-red-500" />
                    <h4 className="text-xs font-black text-red-600 uppercase tracking-wider">Danger Zone</h4>
                  </div>

                  {deletionError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {deletionError}
                    </div>
                  )}

                  <p className="text-[11px] text-red-700/80 leading-relaxed">
                    Deleting your account is permanent. It will instantly remove all profile fields, sandbox editor codes, and verified certificates.
                  </p>

                  <form onSubmit={handleDeleteAccount} className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Type 'delete my account' to confirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-red-200/60 bg-white text-xs text-slate-800 placeholder-red-300 focus:outline-none focus:border-red-500"
                    />

                    <button
                      type="submit"
                      disabled={deletingAccount || deleteConfirmText.toLowerCase() !== "delete my account"}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Permanently Delete Account
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === "Billing" && (
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm max-w-2xl space-y-4 py-1">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard size={16} className="text-slate-400" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Billing Settings</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Billing history, invoices, and payment management settings are not yet available. Course payments are processed securely via external Razorpay gateways on-demand.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Bot,
  LayoutGrid,
  GraduationCap,
  BookOpen,
  FolderGit2,
  CheckSquare,
  Clock,
  Code2,
  Terminal,
  FileText,
  Video,
  Award,
  Briefcase,
  Users,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  Lock,
  Compass,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile?: {
    name?: string;
    role?: string;
    level?: number;
    xp?: number;
    targetXp?: number;
    image?: string | null;
    [key: string]: any;
  };
  isLight?: boolean;
  fullHeight?: boolean;
}

const MENU_ITEMS = [
  {
    id: "Explore Courses",
    label: "Explore Courses",
    icon: Compass,
    category: "Main",
  },
  {
    id: "Dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    category: "Main",
  },

  {
    id: "Courses",
    label: "My Courses",
    icon: BookOpen,
    category: "Academic",
  },

  {
    id: "AI Mentor",
    label: "CodexAI",
    icon: Code2,
    category: "AI Tools",
  },

  {
    id: "AI Quiz Generator",
    label: "AI Quiz Generator",
    icon: Brain,
    category: "AI Tools",
  },

  {
    id: "Workspace",
    label: "Editor",
    icon: LayoutGrid,
    category: "Main",
  },

  {
    id: "Certificates",
    label: "Certificates",
    icon: Award,
    category: "Career",
  },

  {
    id: "Leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    category: "Social",
  },

  {
    id: "Resume Builder",
    label: "Resume Builder",
    icon: FileText,
    category: "Career",
  },

  {
    id: "Interview Prep",
    label: "Interview Prep",
    icon: Video,
    category: "Career",
  },

  {
    id: "Settings",
    label: "Settings",
    icon: Settings,
    category: "System",
  },
];

export function LeftSidebar({ activeTab, onTabChange, userProfile, isLight = false, fullHeight = false }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [localProfile, setLocalProfile] = useState<{
    name: string;
    role: string;
    level: number;
    xp: number;
    targetXp: number;
    image?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!userProfile) {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setLocalProfile({
              name: data.user.name,
              role: data.user.role,
              level: data.user.level ?? 1,
              xp: data.user.xp ?? 0,
              targetXp: data.user.targetXp ?? 1000,
              image: data.user.image,
            });
          }
        })
        .catch(console.error);
    }
  }, [userProfile]);

  const activeProfile = userProfile || localProfile || (session?.user ? {
    name: session.user.name ?? "Student",
    role: (session.user as any).role ?? "Student",
    level: 1,
    xp: 0,
    targetXp: 1000,
    image: session.user.image,
  } : null);

  const userRole = activeProfile?.role ?? "Student";
  const isPro = userRole !== "Student";

  return (
    <aside
      className={`flex flex-col justify-between transition-all duration-300 z-30 select-none border-r ${
        isLight 
          ? "bg-white border-slate-200/80 text-slate-700" 
          : "dark-sidebar bg-[#09090B]/90 border-white/10 backdrop-blur-xl text-white"
      } ${
        fullHeight 
          ? "h-screen sticky top-0" 
          : "h-[calc(100vh-4rem)] sticky top-16"
      } ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Logo Header if fullHeight */}
      {fullHeight && (
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? "border-slate-100 bg-white" : "border-white/10 bg-[#060609]"
        }`}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-[#09090B] rounded-[11px] flex items-center justify-center">
                  <Brain size={16} className="text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-sm tracking-tight leading-none flex items-center gap-1.5 ${
                  isLight ? "text-[#0F172A]" : "text-white"
                }`}>
                  KnowledgeStream
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${
                    isLight 
                      ? "bg-blue-50 border-blue-200 text-blue-600" 
                      : "bg-blue-500/20 border-cyan-500/30 text-cyan-300"
                  }`}>
                    AI OS
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">
                  Teach to Code. Not to Copy.
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center py-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1px] shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-[#09090B] rounded-[7px] flex items-center justify-center">
                  <Brain size={14} className="text-cyan-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation List */}
      <div className="p-2.5 overflow-y-auto custom-scrollbar flex-1 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          
          let isActive = activeTab === item.id;
          if (pathname) {
            if (item.id === "Explore Courses" && pathname.startsWith("/courses/catalog")) {
              isActive = true;
            } else if (item.id === "Dashboard" && pathname === "/dashboard") {
              isActive = true;
            } else if (item.id === "Courses" && pathname.startsWith("/courses") && !pathname.startsWith("/courses/catalog")) {
              isActive = true;
            } else if (item.id === "AI Mentor" && (pathname.startsWith("/codexai") || pathname.startsWith("/codeai"))) {
              isActive = true;
            } else if (item.id === "AI Quiz Generator" && pathname.startsWith("/quiz-generator")) {
              isActive = true;
            } else if (item.id === "Leaderboard" && pathname.startsWith("/leaderboard")) {
              isActive = true;
            } else if (item.id === "Certificates" && pathname.startsWith("/certificates")) {
              isActive = true;
            } else if (item.id === "Settings" && pathname.startsWith("/settings")) {
              isActive = true;
            }
          }

          const isLocked = !isPro && (item.id === "Resume Builder" || item.id === "Interview Prep");

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isLocked) {
                  alert("🔒 This feature is premium. Please upgrade to Pro Developer to unlock!");
                  return;
                }
                onTabChange(item.id);
                
                if (item.id === "Explore Courses") {
                  router.push("/courses/catalog");
                } else if (item.id === "Dashboard") {
                  router.push("/dashboard");
                } else if (item.id === "Courses") {
                  router.push("/courses");
                } else if (item.id === "AI Mentor") {
                  router.push("/codexai");
                } else if (item.id === "AI Quiz Generator") {
                  router.push("/quiz-generator");
                } else if (item.id === "Leaderboard") {
                  router.push("/leaderboard");
                } else if (item.id === "Certificates") {
                  router.push("/certificates");
                } else if (item.id === "Settings") {
                  router.push("/settings");
                }
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all group relative cursor-pointer ${
                isActive
                  ? isLight
                    ? "bg-[#EEF2FF] text-[#4F46E5] border-r-4 border-[#4F46E5] shadow-sm shadow-[#4F46E5]/10"
                    : "bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/60 text-white shadow-lg shadow-blue-500/10"
                  : isLight
                    ? "text-slate-600 hover:text-[#0F172A] hover:bg-slate-50"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform group-hover:scale-110 ${
                  isActive 
                    ? isLight ? "text-[#4F46E5]" : "text-cyan-400" 
                    : isLight ? "text-slate-500 group-hover:text-slate-800" : "text-slate-400 group-hover:text-cyan-300"
                }`}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isLocked ? (
                <Lock size={14} className="ml-auto text-slate-400 shrink-0" />
              ) : (
                isActive && !collapsed && (
                  <span className={`w-2 h-2 rounded-full ml-auto animate-pulse ${
                    isLight ? "bg-[#4F46E5]" : "bg-cyan-400"
                  }`} />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Controls & User Profile Widget */}
      <div className={`p-3 border-t space-y-3 ${
        isLight ? "border-slate-100 bg-[#F8FAFC]" : "border-white/10 bg-[#060609]"
      }`}>
        {!collapsed && (
          <>
            {/* Upgrade to Pro Card */}
            <div className={`p-3 rounded-2xl border text-center space-y-2 ${
              isLight 
                ? "bg-[#EEF2FF]/60 border-purple-100" 
                : "glass-panel border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-blue-950/15"
            }`}>
              <div className={`text-xs font-black flex items-center justify-center gap-1 ${
                isLight ? "text-[#0F172A]" : "text-white"
              }`}>
                👑 Upgrade to Pro
              </div>
              <p className={`text-[10px] leading-relaxed font-semibold ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}>
                Unlock unlimited AI help, advanced analytics, and more.
              </p>
              <button 
                onClick={() => alert("Payment Gateway Integration Active: Razorpay Subscription Triggered")}
                className="w-full py-2 rounded-xl text-xs font-extrabold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all cursor-pointer shadow-md"
              >
                Upgrade Now
              </button>
            </div>

            {/* Sidebar Profile Widget */}
            {activeProfile && (
              <div className={`p-2.5 rounded-2xl border flex flex-col gap-2 ${
                isLight ? "bg-white border-slate-200" : "glass-panel border-white/10 bg-white/5"
              }`}>
                <div className="flex items-center gap-2.5">
                  {activeProfile.image ? (
                    <img 
                      src={activeProfile.image} 
                      alt={activeProfile.name || "User"} 
                      className="w-7 h-7 rounded-full border border-slate-200/50 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white text-xs border border-white/20 shrink-0">
                      {(activeProfile.name || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-extrabold truncate ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                      {activeProfile.name || "Student"}
                    </div>
                    <div className={`text-[10px] font-mono font-bold ${isLight ? "text-[#4F46E5]" : "text-cyan-400"}`}>
                      Level {activeProfile.level ?? 0}
                    </div>
                  </div>
                </div>
                
                {/* XP Progress Bar */}
                <div className="space-y-1">
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isLight ? "bg-slate-100" : "bg-white/10"
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLight ? "bg-gradient-to-r from-blue-500 to-[#4F46E5]" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      }`}
                      style={{ width: `${Math.min(100, (((activeProfile.xp ?? 0) / (activeProfile.targetXp || 1000))) * 100)}%` }}
                    />
                  </div>
                  <div className={`text-[9px] font-mono text-right font-bold ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {activeProfile.xp ?? 0} / {activeProfile.targetXp ?? 1000} XP
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch (err) {
              console.error("Logout failed:", err);
            }
            window.location.href = "/auth";
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all text-left cursor-pointer"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center justify-center p-2 rounded-xl transition-all border ${
            isLight 
              ? "text-slate-500 hover:text-[#0F172A] border-slate-200 bg-white" 
              : "text-slate-400 hover:text-white border-white/10 bg-[#060609]"
          }`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}

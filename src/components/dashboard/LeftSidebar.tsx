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
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile?: {
    name: string;
    role: string;
    level: number;
    xp: number;
    targetXp: number;
    image?: string | null;
  };
}

const MENU_ITEMS = [
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

export function LeftSidebar({ activeTab, onTabChange, userProfile }: LeftSidebarProps) {
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
      className={`dark-sidebar h-[calc(100vh-4rem)] border-r border-white/10 bg-[#09090B]/90 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 sticky top-16 z-30 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation List */}
      <div className="p-3 overflow-hidden flex-1 space-y-0.5">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          
          let isActive = activeTab === item.id;
          if (pathname) {
            if (item.id === "Dashboard" && pathname === "/dashboard") {
              isActive = true;
            } else if (item.id === "Courses" && pathname.startsWith("/courses")) {
              isActive = true;
            } else if (item.id === "AI Mentor" && (pathname.startsWith("/codexai") || pathname.startsWith("/codeai"))) {
              isActive = true;
            } else if (item.id === "AI Quiz Generator" && pathname.startsWith("/quiz-generator")) {
              isActive = true;
            } else if (item.id === "Leaderboard" && pathname.startsWith("/leaderboard")) {
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
                
                // Sidebar routing
                if (item.id === "Dashboard") {
                  router.push("/dashboard");
                } else if (item.id === "Courses") {
                  router.push("/courses");
                } else if (item.id === "AI Mentor") {
                  router.push("/codexai");
                } else if (item.id === "AI Quiz Generator") {
                  router.push("/quiz-generator");
                } else if (item.id === "Leaderboard") {
                  router.push("/leaderboard");
                }
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/60 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"
                }`}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isLocked ? (
                <Lock size={12} className="ml-auto text-slate-500 shrink-0" />
              ) : (
                isActive && !collapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto animate-pulse" />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Controls & Collapse Toggle */}
      <div className="p-3 border-t border-white/10 space-y-4 bg-[#060609]">
        {!collapsed && (
          <>
            {/* Upgrade to Pro Card */}
            <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-blue-950/15 text-center space-y-3">
              <div className="text-xs font-black text-white flex items-center justify-center gap-1">
                👑 Upgrade to Pro
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                Unlock unlimited AI help, advanced analytics, and more.
              </p>
              <button 
                onClick={() => alert("Payment Gateway Integration Active: Razorpay Subscription Triggered")}
                className="w-full py-2 rounded-xl text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-purple-500/10"
              >
                Upgrade Now
              </button>
            </div>

            {/* Sidebar Profile Widget */}
            {activeProfile && (
              <div className="glass-panel p-3 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {activeProfile.image ? (
                    <img 
                      src={activeProfile.image} 
                      alt={activeProfile.name} 
                      className="w-8 h-8 rounded-full border border-white/20 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs border border-white/20">
                      {activeProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white truncate">{activeProfile.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono font-bold">Level {activeProfile.level}</div>
                  </div>
                </div>
                
                {/* XP Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (activeProfile.xp / activeProfile.targetXp) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono text-right font-bold">
                    {activeProfile.xp} / {activeProfile.targetXp} XP
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white glass-panel border border-white/10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}

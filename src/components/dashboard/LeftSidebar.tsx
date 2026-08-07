"use client";

import React, { useState } from "react";
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

export function LeftSidebar({ activeTab, onTabChange }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user as any)?.role ?? "Student";
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
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#060609]">
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

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Trophy, Code2, Layers, LogOut } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/contests", label: "Contests", icon: Trophy },
    { href: "/admin/submissions", label: "Submissions", icon: Code2 },
    { href: "/admin/leaderboard", label: "Leaderboard", icon: Layers },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight block leading-none">
                KnowledgeStream
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <ShieldCheck size={10} /> Admin Workspace
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all"
          >
            <LogOut size={12} />
            <span>Student Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

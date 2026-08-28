"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { ProjectWorkspace } from "@/components/projects/ProjectWorkspace";
import { AIMentorDrawer } from "@/components/mentor/AIMentorDrawer";
import {
  Code,
  FolderGit2,
  Sparkles,
  Layers,
  ArrowRight,
  Bot,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ProjectDefinition, ProjectKnowledgeGapAnalysis } from "@/lib/projects/types";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "student@ksai.edu";

  const [activeCourse, setActiveCourse] = useState("python");
  const [projects, setProjects] = useState<
    Array<ProjectDefinition & { gapAnalysis: ProjectKnowledgeGapAnalysis }>
  >([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mentorOpen, setMentorOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/projects?userEmail=${encodeURIComponent(userEmail)}&course=${encodeURIComponent(activeCourse)}`
        );
        const json = await res.json();
        if (json.success && isMounted) {
          setProjects(json.data);
          if (json.data.length > 0 && !selectedProjectId) {
            setSelectedProjectId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [activeCourse, userEmail]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FolderGit2 className="text-blue-600" size={32} />
            Real-World Project AI Coach
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Build production-grade software step-by-step guided by Knowledge Graph insights.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMentorOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
        >
          <Bot size={16} />
          <span>Ask AI Mentor</span>
        </button>
      </div>

      {/* Course Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {[
          { id: "python", label: "Python AI & Backend" },
          { id: "c", label: "C Systems Programming" },
          { id: "cpp", label: "C++ OOP & Architecture" },
          { id: "java", label: "Java Enterprise Systems" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setActiveCourse(c.id);
              setSelectedProjectId(null);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeCourse === c.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Projects List or Active Workspace */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
          <Sparkles className="animate-spin text-blue-600" size={24} />
          <span className="text-sm">Loading Project Blueprints...</span>
        </div>
      ) : selectedProject ? (
        <div className="space-y-6">
          {/* Project Switcher */}
          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Select Project:</span>
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedProject.id === p.id
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          <ProjectWorkspace project={selectedProject} userEmail={userEmail} />
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No projects available for this course.
        </div>
      )}

      {/* AI Mentor Drawer */}
      <AIMentorDrawer
        isOpen={mentorOpen}
        onClose={() => setMentorOpen(false)}
        userEmail={userEmail}
        initialCourse={activeCourse}
      />
    </div>
  );
}

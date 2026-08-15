"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import EditorNavbar from "@/components/editor/EditorNavbar";
import ExplorerSidebar from "@/components/editor/ExplorerSidebar";
import MonacoEditorPanel from "@/components/editor/MonacoEditor";

import AIChatPanel from "@/components/editor/AIChatPanel";
import AIResultPanel from "@/components/editor/AIResultPanel";
import BottomDock from "@/components/editor/BottomDock";
import StatusBar from "@/components/editor/StatusBar";

import { TabProvider } from "@/components/editor/tabs/TabContext";
import TabBar from "@/components/editor/tabs/TabBar";
import { TerminalProvider } from "@/components/editor/terminal/TerminalContext";
import TerminalPanel from "@/components/editor/terminal/TerminalPanel";

import { LanguageProvider } from "@/components/editor/languages/LanguageContext";
import { ExplorerProvider } from "@/components/editor/explorer/ExplorerContext";
import { EditorThemeProvider, useEditorTheme } from "@/components/editor/EditorTheme";
import { EditorSettingsProvider } from "@/components/editor/EditorSettingsContext";
import { EditorProvider } from "@/components/editor/EditorContext";
import { AIResultProvider } from "@/components/editor/AIResultContext";
import { AIChatProvider } from "@/components/editor/AIChatContext";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { Sparkles, MessageSquare, Bot, BookOpen } from "lucide-react";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#09090B] text-white flex items-center justify-center font-mono text-xs">Loading Cursor IDE Workspace...</div>}>
      <EditorThemeProvider>
        <EditorSettingsProvider>
          <LanguageProvider>
            <ExplorerProvider>
              <TabProvider>
                <EditorProvider>
                  <AIResultProvider>
                    <AIChatProvider>
                      <EditorLayout />
                    </AIChatProvider>
                  </AIResultProvider>
                </EditorProvider>
              </TabProvider>
            </ExplorerProvider>
          </LanguageProvider>
        </EditorSettingsProvider>
      </EditorThemeProvider>
    </Suspense>
  );
}

function EditorLayout() {
  const router = useRouter();
  const { darkMode } = useEditorTheme();
  const [showTerminal, setShowTerminal] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<"chat" | "explanation">("explanation");

  return (
    <div className={`h-screen flex overflow-hidden font-sans antialiased ${darkMode ? "bg-[#09090B] text-white" : "bg-slate-100 text-slate-900"}`}>
      {/* Unified Left Sidebar */}
      <LeftSidebar
        activeTab="Editor"
        onTabChange={(tab) => {
          if (tab === "Dashboard") router.push("/dashboard");
          else if (tab === "Explore Courses") router.push("/courses/catalog");
          else if (tab === "Courses") router.push("/courses");
          else if (tab === "Leaderboard") router.push("/leaderboard");
          else if (tab === "AI Quiz Generator") router.push("/quiz-generator");
          else if (tab === "Editor" || tab === "Workspace") router.push("/editor");
          else if (tab === "Certificates") router.push("/certificates");
          else if (tab === "Interview Prep") router.push("/interview");
          else if (tab === "Settings") router.push("/settings");
        }}
        fullHeight={true}
      />

      {/* Main IDE Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <EditorNavbar />

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* File Tree Explorer */}
          <ExplorerSidebar />

          {/* Code Editor Workspace */}
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <TerminalProvider>
              {/* File Tabs */}
              <TabBar />

              {/* Monaco Editor Panel */}
              <div className="flex-1 h-full overflow-hidden relative">
                <MonacoEditorPanel />
              </div>

              {/* Terminal Panel */}
              {showTerminal && (
                <TerminalPanel onClose={() => setShowTerminal(false)} />
              )}

              {/* Bottom Dock Action Bar */}
              <BottomDock />
            </TerminalProvider>
          </div>

          {/* Right AI Copilot & Explanation Panel */}
          <div className={`w-[400px] min-h-0 flex flex-col overflow-hidden border-l shrink-0 transition-all ${
            darkMode ? "bg-[#0D0F17] border-white/10" : "bg-white border-slate-200"
          }`}>
            {/* Right Panel Tab Controls */}
            <div className={`flex items-center p-2 border-b gap-1.5 shrink-0 ${
              darkMode ? "bg-[#11131E] border-white/10" : "bg-slate-50 border-slate-200"
            }`}>
              <button
                onClick={() => setRightPanelTab("explanation")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  rightPanelTab === "explanation"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : darkMode
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen size={14} /> Code Explanation
              </button>
              <button
                onClick={() => setRightPanelTab("chat")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  rightPanelTab === "chat"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : darkMode
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare size={14} /> Codenthra AI
              </button>
            </div>

            {/* Panel Views */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {rightPanelTab === "explanation" ? (
                <AIResultPanel />
              ) : (
                <AIChatPanel />
              )}
            </div>
          </div>
        </div>

        <StatusBar />
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";

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

import {
  LanguageProvider,
} from "@/components/editor/languages/LanguageContext";


import {
  ExplorerProvider,
} from "@/components/editor/explorer/ExplorerContext";

import {
  EditorThemeProvider,
  useEditorTheme,
} from "@/components/editor/EditorTheme";

import {
  EditorSettingsProvider,
} from "@/components/editor/EditorSettingsContext";

import {
  EditorProvider,
} from "@/components/editor/EditorContext";

import {
    AIResultProvider,
} from "@/components/editor/AIResultContext";

import {
    AIChatProvider,
} from "@/components/editor/AIChatContext";

import AIGuidePanel from "@/components/editor/AIGuidePanel";

export default function EditorPage() {

  return (

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

  );

}

function EditorLayout() {

  const { darkMode } = useEditorTheme();

  const [showTerminal, setShowTerminal] = useState(true);

  const [showGuide, setShowGuide] =
    useState(false);
    
return (
  <div
    className={`h-screen flex flex-col overflow-hidden transition-all duration-300 ${
      darkMode
        ? "bg-[#09090B] text-white"
        : "bg-gray-100 text-gray-900"
    }`}
  >
    <EditorNavbar />

    <div className="flex flex-1 overflow-hidden">
      <ExplorerSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Everything related to Terminal goes inside TerminalProvider */}
        <TerminalProvider>

          {/* File Tabs */}
          <TabBar />

          {/* Monaco Editor */}
          <div className="flex-1 h-full overflow-hidden">
            <MonacoEditorPanel />
          </div>

          {/* Terminal */}
          {showTerminal && (
            <TerminalPanel
              onClose={() => setShowTerminal(false)}
            />
          )}

          {/* Bottom Dock (Run Button needs TerminalContext) */}
          <BottomDock />

        </TerminalProvider>

      </div>

      {/* Right Panel */}
      {/* Right Panel */}
<div
  className={`w-[380px] min-h-0 flex flex-col overflow-hidden border-l transition-all ${
    darkMode
      ? "bg-[#11131B] border-white/10"
      : "bg-white border-gray-300"
  }`}
>
  <AIResultPanel />

  <div className="flex-1 min-h-0 overflow-hidden">
    <AIChatPanel />
  </div>
</div>
    </div>

    <StatusBar />
  </div>
);
}
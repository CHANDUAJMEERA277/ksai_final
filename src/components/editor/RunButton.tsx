"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

import { useTabs } from "./tabs/TabContext";
import { useTerminal } from "./terminal/TerminalContext";

import { useEditor } from "./EditorContext";
import { useLanguage } from "./languages/LanguageContext";
import { parseJavaCompilerError } from "./monaco/ErrorParser";

export default function RunButton() {
  const { activeTab } = useTabs();
  const { language } = useLanguage();
  const { setDiagnostics } = useEditor();

  const {
    appendOutput,
    setActivePanel,
  } = useTerminal();

  const [running, setRunning] = useState(false);

  async function runCode() {
    if (running) return;

    setRunning(true);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: activeTab?.content,
          language: activeTab?.language || language?.id || "java",
        }),
      });

      const result = await response.json();

      if (result.success) {

    setDiagnostics([]);

    setActivePanel("output");

    appendOutput(
`========================================
KnowledgeStream AI Execution
========================================

${result.output}

Execution Time : ${result.executionTime} ms
Exit Code      : ${result.exitCode}

========================================`
    );

} else {

    const errors =
        parseJavaCompilerError(result.output);

    setDiagnostics(errors);

    setActivePanel("problems");

    appendOutput(result.output);

}
    } catch (error) {
      setActivePanel("problems");
      appendOutput("Unable to connect to the execution server.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <button
      onClick={runCode}
      disabled={running}
      className={`group flex items-center gap-3 px-5 py-3 rounded-2xl
      bg-gradient-to-r from-green-500 to-emerald-600
      text-white shadow-lg transition-all duration-300
      ${
        running
          ? "opacity-70 cursor-not-allowed"
          : "hover:scale-105 hover:shadow-xl"
      }`}
    >
      {running ? (
        <Loader2
          size={20}
          className="animate-spin"
        />
      ) : (
        <Play
          size={20}
          className="group-hover:scale-110 transition-transform"
        />
      )}

      <span className="font-semibold text-sm">
        {running ? "Running..." : "Run"}
      </span>
    </button>
  );
}
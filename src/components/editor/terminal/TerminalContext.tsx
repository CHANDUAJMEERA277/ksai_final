"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";

import { TerminalTab } from "./TerminalTypes";

interface TerminalContextType {
  tabs: TerminalTab[];
  activeTab: string;
  activePanel: "terminal" | "output" | "problems";
  clearSignal: number;

  output: string;
  setOutput: (text: string) => void;
  clearOutput: () => void;

  problemsText: string;
  setProblemsText: (text: string) => void;
  clearProblemsText: () => void;

  appendOutput: (text: string) => void;

  showTerminal: boolean;
  setShowTerminal: (value: boolean) => void;

  setActivePanel: (value: "terminal" | "output" | "problems") => void;

  clearTerminal: () => void;
  createTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;

  // Interactive Execution Support
  isRunning: boolean;
  activeSessionId: string | null;
  sendInput: (input: string) => Promise<boolean>;
  stopExecution: () => void;
  startExecution: (params: {
    code: string;
    language: string;
    fileName?: string;
    onValidationError?: (err: { message: string; diagnostics?: any[] }) => void;
  }) => Promise<void>;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [showTerminal, setShowTerminal] = useState(true);

  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: crypto.randomUUID(),
      name: "Terminal 1",
    },
  ]);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const [activePanel, setActivePanel] = useState<"terminal" | "output" | "problems">("terminal");

  const [clearSignal, setClearSignal] = useState(0);
  const [output, setOutput] = useState("");
  const [problemsText, setProblemsText] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  const clearTerminal = () => {
    setClearSignal((prev) => prev + 1);
  };

  const clearOutput = () => {
    setOutput("");
  };

  const clearProblemsText = () => {
    setProblemsText("");
  };

  const appendOutput = (text: string) => {
    setOutput((prev) => prev + text);
  };

  const createTab = () => {
    const newTab = {
      id: crypto.randomUUID(),
      name: `Terminal ${tabs.length + 1}`,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (id: string) => {
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (remaining.length > 0) {
      setActiveTab(remaining[0].id);
    } else {
      setShowTerminal(false);
    }
  };

  const stopExecution = () => {
    const currentId = activeSessionIdRef.current;
    if (currentId) {
      fetch("/api/run/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentId }),
      }).catch(() => {});
    }
    setIsRunning(false);
    setActiveSessionId(null);
    activeSessionIdRef.current = null;
  };

  const sendInput = async (input: string): Promise<boolean> => {
    const currentId = activeSessionIdRef.current;
    if (!currentId) return false;

    // Echo input locally into terminal output stream
    setOutput((prev) => prev + input + "\n");

    try {
      const res = await fetch("/api/run/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentId, input: input + "\n" }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const startExecution = async ({
    code,
    language,
    fileName = "",
    onValidationError,
  }: {
    code: string;
    language: string;
    fileName?: string;
    onValidationError?: (err: { message: string; diagnostics?: any[] }) => void;
  }) => {
    if (isRunning) {
      stopExecution();
    }

    setIsRunning(true);
    setActivePanel("output");
    setShowTerminal(true);
    setOutput(
`========================================
KnowledgeStream AI Execution
========================================

`
    );

    try {
      const response = await fetch("/api/run/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, fileName }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || contentType.includes("application/json")) {
        const errorData = await response.json().catch(() => ({}));
        setIsRunning(false);

        if (errorData.diagnostics || errorData.output) {
          if (onValidationError) {
            onValidationError({
              message: errorData.output || "Execution Error",
              diagnostics: errorData.diagnostics,
            });
          } else {
            setProblemsText(errorData.output || "Execution Error");
            setActivePanel("problems");
          }
          return;
        }

        setOutput((prev) =>
          prev +
          `\nExecution Error: ${errorData.message || errorData.output || "Failed to start execution."}\n` +
          `\n========================================\n`
        );
        return;
      }

      if (!response.body) {
        throw new Error("No response stream body available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let hasReceivedOutput = false;
      let rawStreamText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const jsonStr = trimmed.replace(/^data:\s*/, "");
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "start") {
                setActiveSessionId(event.sessionId);
                activeSessionIdRef.current = event.sessionId;
              } else if (event.type === "stdout") {
                hasReceivedOutput = true;
                rawStreamText += event.text;
                setOutput((prev) => prev + event.text);
              } else if (event.type === "stderr") {
                hasReceivedOutput = true;
                rawStreamText += event.text;
                setOutput((prev) => prev + event.text);
              } else if (event.type === "exit") {
                setIsRunning(false);
                setActiveSessionId(null);
                activeSessionIdRef.current = null;

                const codeVal = event.exitCode ?? 0;
                const duration = event.executionTime ?? 0;

                setOutput((prev) => {
                  let finalMsg = prev;
                  if (!rawStreamText.trim() && codeVal === 0) {
                    finalMsg += "Program finished successfully with no console output.\n\n";
                  } else if (!finalMsg.endsWith("\n")) {
                    finalMsg += "\n\n";
                  } else {
                    finalMsg += "\n";
                  }
                  finalMsg += `Execution Time : ${duration} ms\n`;
                  finalMsg += `Exit Code      : ${codeVal}\n\n`;
                  finalMsg += `========================================`;
                  return finalMsg;
                });
              } else if (event.type === "error") {
                setIsRunning(false);
                setActiveSessionId(null);
                activeSessionIdRef.current = null;

                setOutput((prev) =>
                  prev +
                  `\nRuntime Error: ${event.text || "Execution failed."}\n\n` +
                  `Execution Time : ${event.executionTime ?? 0} ms\n` +
                  `Exit Code      : ${event.exitCode ?? 1}\n\n` +
                  `========================================`
                );
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setIsRunning(false);
      setActiveSessionId(null);
      activeSessionIdRef.current = null;

      setOutput((prev) =>
        prev +
        `\nExecution Failed: ${err?.message || "Connection to execution server lost."}\n\n` +
        `========================================`
      );
    }
  };

  return (
    <TerminalContext.Provider
      value={{
        tabs,
        activeTab,
        createTab,
        closeTab,
        setActiveTab,
        activePanel,
        setActivePanel,
        clearSignal,
        clearTerminal,
        output,
        setOutput,
        clearOutput,
        problemsText,
        setProblemsText,
        clearProblemsText,
        appendOutput,
        showTerminal,
        setShowTerminal,
        isRunning,
        activeSessionId,
        sendInput,
        stopExecution,
        startExecution,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("TerminalProvider missing.");
  }
  return context;
}
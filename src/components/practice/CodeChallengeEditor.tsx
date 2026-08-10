"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { ArrowRight, Play } from "lucide-react";

interface CodeChallengeEditorProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  onRun: () => Promise<void>;
  runOutput?: string | null;
  loading?: boolean;
  readonly?: boolean;
}

export function CodeChallengeEditor({
  language,
  code,
  onChange,
  onRun,
  runOutput,
  loading = false,
  readonly = false,
}: CodeChallengeEditorProps) {
  const [lastPasteAttempt, setLastPasteAttempt] = useState(false);

  const handleBeforePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    setLastPasteAttempt(true);
    console.log("Paste is disabled for proctored coding tasks.");
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Code Challenge
        </h2>

        <button
          onClick={onRun}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Play size={16} />
          {loading ? "Running..." : "Run"}
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Write a complete {language.toUpperCase()} solution for the prompt.
      </p>

      <div className="mt-4 rounded-3xl overflow-hidden border border-white/10">
        <Editor
          height="320px"
          defaultLanguage={language}
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: readonly,
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
          onChange={(value) => onChange(value ?? "")}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme("customDark", {
              base: "vs-dark",
              inherit: true,
              rules: [],
              colors: {
                "editor.background": "#2a335f",
              },
            });
          }}
          onMount={(editor) => {
            editor.onDidPaste(handleBeforePaste as any);
          }}
        />
      </div>

      {lastPasteAttempt && (
        <p className="mt-3 text-xs text-rose-300">
          Paste attempts are blocked in proctored mode.
        </p>
      )}

      {runOutput != null && (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span>Execution output</span>
            <span className="text-xs text-slate-400">
              {loading ? "Running…" : "Results"}
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-xs leading-5">
            {runOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
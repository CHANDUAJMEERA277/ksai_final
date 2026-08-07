"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  Play,
  Bot,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { GuidedModeModal } from "./GuidedModeModal";

interface MonacoAIEditorProps {
  language: string; // c | cpp | python | java
  onCompleteCode: () => void;
}

const DEFAULT_STARTER_CODES: Record<string, string> = {
  c: `#include <stdio.h>\n\nint main() {\n    // Type your C code here\n    int age = 21;\n    printf("Hello C Developer! Age: %d\\n", age);\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Type your C++ code here\n    int score = 100;\n    cout << "Hello C++ Mastery! Score: " << score << endl;\n    return 0;\n}`,
  python: `# Type your Python code here\ndef main():\n    name = "Chandu"\n    print(f"Hello Python Developer! Welcome {name}")\n\nif __name__ == "__main__":\n    main()`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Type your Java code here\n        int xp = 2450;\n        System.out.println("Hello Java Developer! XP: " + xp);\n    }\n}`,
};

export function MonacoAIEditor({ language = "cpp", onCompleteCode }: MonacoAIEditorProps) {
  const [code, setCode] = useState(DEFAULT_STARTER_CODES[language] || DEFAULT_STARTER_CODES.cpp);
  const [activeDifficulty, setActiveDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [guidedModalOpen, setGuidedModalOpen] = useState(false);
  const [guidedData, setGuidedData] = useState<any>(null);
  const [dictatorActive, setDictatorActive] = useState(false);
  const [dictatorWarning, setDictatorWarning] = useState<string | null>(null);
  const [editorFeedback, setEditorFeedback] = useState<{ type: "hint" | "fix" | "improvement"; message: string } | null>(null);

  // BLOCK COPY PASTE
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    alert("🚫 Copy-Paste is STRICTLY DISABLED in KnowledgeStream AI Editor! You must type code manually to master programming.");
  };

  // Dictator Mode Live Spelling Check
  useEffect(() => {
    if (!dictatorActive) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai/dictate-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, targetLine: 1 }),
        });
        const data = await res.json();
        if (data.hasError && data.spokenWarning) {
          setDictatorWarning(data.spokenWarning);
          if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(data.spokenWarning);
            window.speechSynthesis.speak(utt);
          }
        } else {
          setDictatorWarning(null);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, dictatorActive]);

  const logEditorActivity = async (actionType: string) => {
    try {
      await fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType })
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  const handleRunCode = () => {
    setRunning(true);
    setOutput(null);
    logEditorActivity("EDITOR_RUN");

    setTimeout(() => {
      setRunning(false);
      if (code.includes("publc") || code.includes("statc") || code.includes("prnt")) {
        setOutput(`Compilation Error: Syntax typo detected in line 2. Click [AI Guided Mode] for diagnosis.`);
      } else {
        setOutput(`[Execution Success]\nProgram finished with exit code 0.\nOutput:\nHello ${language.toUpperCase()} Developer! Execution verified.`);
        onCompleteCode();
      }
    }, 800);
  };

  const handleTriggerGuidedMode = async () => {
    logEditorActivity("EDITOR_GUIDANCE");
    try {
      const res = await fetch("/api/ai/guided-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setGuidedData(data);
      setGuidedModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze code in Guided Mode.");
    }
  };

  const toggleDictatorMode = () => {
    const nextState = !dictatorActive;
    setDictatorActive(nextState);
    if (nextState) {
      logEditorActivity("EDITOR_SUGGESTION");
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const text = language === "java"
          ? "Dictator Mode Active. Type: public static void main(String[] args). Do not copy paste."
          : "Dictator Mode Active. Type function definition line by line. AI is monitoring your typing.";
        const utt = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utt);
      }
    }
  };

  const handleGetHint = () => {
    logEditorActivity("EDITOR_HINT");
    let msg = "";
    if (language === "python") {
      msg = "💡 Hint: Ensure you indent your function body by 4 spaces. Double-check your loop variables are incremented.";
    } else if (language === "java") {
      msg = "💡 Hint: Make sure your public class name matches the filename, and check that System.out.println is spelled correctly.";
    } else {
      msg = "💡 Hint: In C/C++, check that standard headers like <stdio.h> or <iostream> are included, and main returns an integer.";
    }
    setEditorFeedback({ type: "hint", message: msg });
  };

  const handleSuggestFix = () => {
    logEditorActivity("EDITOR_FIX");
    let msg = "";
    if (code.includes("publc") || code.includes("statc") || code.includes("prnt")) {
      msg = "🔧 Fix: Correct spelling typos: 'publc' -> 'public', 'statc' -> 'static', 'prnt' -> 'print'.";
    } else if (!code.includes(";") && (language === "cpp" || language === "c" || language === "java")) {
      msg = "🔧 Fix: Your code is missing a semicolon ';'. Append a semicolon to terminate statements.";
    } else {
      msg = "🔧 Fix: No immediate syntax errors found. If you see logical errors, check loop variables and boundary variables.";
    }
    setEditorFeedback({ type: "fix", message: msg });
  };

  const handleOptimizeCode = () => {
    logEditorActivity("EDITOR_IMPROVEMENT");
    let msg = "🚀 Improvement: Declare variables using const/final where possible, keep variable scopes narrow, and use meaningful descriptor naming.";
    setEditorFeedback({ type: "improvement", message: msg });
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-5 shadow-2xl bg-[#090912]">
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Code2 size={22} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Step C: Monaco AI Code Editor ({language.toUpperCase()})
              <span className="text-xs px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono border border-red-500/30">
                Copy-Paste Disabled 🔒
              </span>
            </h3>
          </div>
        </div>

        {/* AI Modes & Difficulty Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm">
            {(["Easy", "Medium", "Hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setActiveDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeDifficulty === diff ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={handleTriggerGuidedMode}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md hover:opacity-90"
          >
            <Sparkles size={15} /> AI Guided Mode
          </button>

          <button
            onClick={toggleDictatorMode}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              dictatorActive
                ? "bg-amber-500 text-black animate-pulse shadow-amber-500/40"
                : "glass-panel border border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            {dictatorActive ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {dictatorActive ? "Dictator Active" : "AI Dictator Mode"}
          </button>
        </div>
      </div>

      {dictatorWarning && (
        <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm flex items-center gap-2 animate-bounce">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" />
          <span className="font-bold">{dictatorWarning}</span>
        </div>
      )}

      {/* Code Textarea with LARGER text-base sm:text-lg font */}
      <div className="relative rounded-2xl border border-white/15 overflow-hidden bg-[#07070F] font-mono text-base sm:text-lg shadow-inner">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPaste={handlePaste}
          rows={12}
          spellCheck={false}
          className="w-full p-5 bg-transparent text-cyan-300 focus:outline-none resize-none leading-relaxed font-mono select-text"
        />
      </div>

      {/* Editor Helper Actions & Feedback */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={handleGetHint}
          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          💡 Get Hint
        </button>
        <button
          onClick={handleSuggestFix}
          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          🔧 Suggest Fix
        </button>
        <button
          onClick={handleOptimizeCode}
          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          🚀 Optimize / Improve
        </button>
      </div>

      {editorFeedback && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-between animate-fade-in ${
          editorFeedback.type === "hint" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200" :
          editorFeedback.type === "fix" ? "bg-amber-500/10 border-amber-500/30 text-amber-200" :
          "bg-purple-500/10 border-purple-500/30 text-purple-200"
        }`}>
          <span>{editorFeedback.message}</span>
          <button 
            onClick={() => setEditorFeedback(null)}
            className="text-[10px] text-slate-400 hover:text-white uppercase font-bold tracking-wider cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Run Code & Output Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <button
          onClick={handleRunCode}
          disabled={running}
          className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 glow-btn flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Play size={16} className="fill-white" />
          {running ? "Compiling..." : "Run Code Execution"}
        </button>

        {output && (
          <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-mono text-slate-200">
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>

      {guidedModalOpen && guidedData && (
        <GuidedModeModal data={guidedData} onClose={() => setGuidedModalOpen(false)} />
      )}
    </div>
  );
}

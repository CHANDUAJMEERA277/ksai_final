"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  Code2,
  ArrowLeft,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Terminal,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface TestCase {
  input: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testCases: string;
}

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node.js v18)" },
  { id: "python", label: "Python (v3.10)" },
  { id: "cpp", label: "C++ (GCC v10.2)" },
  { id: "c", label: "C (GCC v10.2)" },
  { id: "java", label: "Java (v15)" },
  { id: "typescript", label: "TypeScript (v5.0)" },
];

const STARTER_CODE: Record<string, string> = {
  javascript: `// Write your JavaScript solution below\n// Input is passed via stdin\nconst fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nconsole.log(input);`,
  python: `# Write your Python solution below\nimport sys\ninput_data = sys.stdin.read().trim()\nprint(input_data)`,
  cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string input;\n    while (cin >> input) {\n        cout << input << endl;\n    }\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    char buffer[256];\n    if (fgets(buffer, sizeof(buffer), stdin)) {\n        printf("%s", buffer);\n    }\n    return 0;\n}`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(sc.nextLine());\n        }\n    }\n}`,
  typescript: `// Write your TypeScript solution below\nimport * as fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);`,
};

export default function StudentChallengeSolvePage({
  params,
}: {
  params: Promise<{ contestId: string; challengeId: string }>;
}) {
  const { contestId, challengeId } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState("Contests");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Solving State
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Run Results State
  const [runResults, setRunResults] = useState<any[] | null>(null);

  // Submit Result Modal/Banner State
  const [submitResponse, setSubmitResponse] = useState<any | null>(null);

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        fetch("/api/contests")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.contests)) {
              const contest = data.contests.find((c: any) => c.id === contestId);
              if (contest && Array.isArray(contest.challenges)) {
                const target = contest.challenges.find((ch: any) => ch.id === challengeId);
                if (target) {
                  setChallenge(target);
                }
              }
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } else {
        router.push("/auth");
      }
    }
  }, [session, isPending, contestId, challengeId, router]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang] || STARTER_CODE.javascript);
    setRunResults(null);
    setSubmitResponse(null);
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setRunResults(null);
    setSubmitResponse(null);

    try {
      const res = await fetch(`/api/contests/${contestId}/challenges/${challengeId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRunResults(data.testResults || []);
      } else {
        alert(data.error || "Execution failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error executing code");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setSubmitResponse(null);
    setRunResults(null);

    try {
      const res = await fetch(`/api/contests/${contestId}/challenges/${challengeId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitResponse(data);
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting code");
    } finally {
      setSubmitting(false);
    }
  };

  // Parse public test cases (showing ONLY input, NO expectedOutput)
  let parsedTestCases: TestCase[] = [];
  if (challenge?.testCases) {
    try {
      parsedTestCases = JSON.parse(challenge.testCases);
    } catch {
      parsedTestCases = [];
    }
  }

  return (
    <div className="h-screen bg-[#090912] text-slate-100 flex flex-col font-sans overflow-hidden">
      <TopNavbar
        userName={session?.user?.name || "Student"}
        userRole={(session?.user as any)?.role || "Student"}
      />

      <div className="flex-1 flex w-full overflow-hidden">
        <LeftSidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

        <main className="flex-1 overflow-hidden h-full flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="py-20 text-center mx-auto space-y-3">
              <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Loading challenge problem statement...</p>
            </div>
          ) : !challenge ? (
            <div className="p-8 rounded-2xl bg-rose-950/30 text-rose-300 text-xs font-bold text-center border border-rose-500/30 mx-auto my-auto">
              Challenge not found or unavailable.
            </div>
          ) : (
            <>
              {/* Left Panel: Problem Statement & Test Case Inputs (NO expectedOutput) */}
              <div className="lg:w-5/12 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/contests/${contestId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Contest
                  </Link>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      challenge.difficulty === "HARD"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : challenge.difficulty === "MEDIUM"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>

                {/* Problem Description Card */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0E0E1B] space-y-4 shadow-xl">
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Code2 className="text-cyan-400" size={20} /> {challenge.title}
                  </h1>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {challenge.description}
                  </div>
                </div>

                {/* Test Cases List (Inputs Only) */}
                <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#0E0E1B] space-y-3">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Terminal size={14} className="text-cyan-400" /> Challenge Test Case Inputs ({parsedTestCases.length})
                  </h3>

                  {parsedTestCases.length === 0 ? (
                    <p className="text-xs text-slate-500">No input cases specified.</p>
                  ) : (
                    <div className="space-y-2">
                      {parsedTestCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#07070F] border border-white/5 font-mono text-xs space-y-1"
                        >
                          <div className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">
                            Testcase #{idx + 1} Input:
                          </div>
                          <div className="text-emerald-300 bg-slate-900/60 p-2 rounded-lg break-all">
                            {tc.input || "(No stdin input required)"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Code Editor, Language Picker, Run & Submit Actions */}
              <div className="lg:w-7/12 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
                <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 bg-[#090912] space-y-4 shadow-2xl flex-1 flex flex-col">
                  {/* Top Bar: Language Dropdown */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Code2 size={18} className="text-cyan-400" />
                      <span className="text-xs font-bold text-white">Select Language:</span>
                    </div>

                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#141424] border border-white/15 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Code Editor Area */}
                  <div className="relative rounded-2xl border border-white/15 overflow-hidden bg-[#06060E] font-mono text-sm flex-1 min-h-[300px]">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-full p-4 bg-transparent text-cyan-300 focus:outline-none resize-none leading-relaxed font-mono select-text"
                    />
                  </div>

                  {/* Actions Bar: Run & Submit */}
                  <div className="flex items-center justify-between pt-2 gap-3">
                    <button
                      onClick={handleRunCode}
                      disabled={running || submitting}
                      className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {running ? (
                        <Loader2 size={14} className="animate-spin text-cyan-400" />
                      ) : (
                        <Play size={14} className="text-emerald-400 fill-emerald-400" />
                      )}
                      <span>{running ? "Running Output..." : "Run Test Output"}</span>
                    </button>

                    <button
                      onClick={handleSubmitCode}
                      disabled={running || submitting}
                      className="px-8 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin text-white" />
                      ) : (
                        <Send size={14} />
                      )}
                      <span>{submitting ? "Evaluating..." : "Submit Solution"}</span>
                    </button>
                  </div>
                </div>

                {/* Run Output Display (Preview sandbox output per test case) */}
                {runResults && (
                  <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 bg-[#0E0E1B] space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Terminal size={14} /> Code Execution Output (Sandbox Test)
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {runResults.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#06060E] border border-white/5 font-mono text-xs space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold">
                            Testcase #{r.testCaseIndex} Output:
                          </div>
                          {r.error ? (
                            <div className="text-rose-400 font-semibold">{r.error}</div>
                          ) : (
                            <pre className="text-cyan-300 whitespace-pre-wrap break-all">{r.actualOutput || "(No stdout returned)"}</pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Verdict Banner / Results */}
                {submitResponse && (
                  <div
                    className={`glass-panel p-6 rounded-3xl border space-y-3 animate-in fade-in zoom-in-95 ${
                      submitResponse.submission?.status === "PASSED"
                        ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                        : "border-rose-500/40 bg-rose-950/20 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {submitResponse.submission?.status === "PASSED" ? (
                          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle size={24} className="text-rose-400 shrink-0" />
                        )}
                        <div>
                          <h3 className="text-base font-black uppercase tracking-wide">
                            Verdict: {submitResponse.submission?.status || "EVALUATED"}
                          </h3>
                          {submitResponse.submission?.alreadySolved && (
                            <p className="text-[11px] text-amber-300 font-bold">
                              Challenge previously solved. No additional XP awarded.
                            </p>
                          )}
                        </div>
                      </div>

                      {submitResponse.submission?.xpAwarded > 0 && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                          <Zap size={14} className="fill-amber-400" /> +{submitResponse.submission.xpAwarded} XP
                        </span>
                      )}
                    </div>

                    {submitResponse.submission?.errorDetail && (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-rose-300">
                        {submitResponse.submission.errorDetail}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

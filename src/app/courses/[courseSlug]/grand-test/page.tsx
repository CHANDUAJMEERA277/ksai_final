"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const grandTestQuestionsMap: Record<string, Question[]> = {
  python: [
    { id: 1, question: "Which of the following data structures in Python is immutable?", options: ["List", "Dictionary", "Tuple", "Set"], correct: 2 },
    { id: 2, question: "What is the time complexity of looking up a key in a Python dictionary on average?", options: ["O(n)", "O(O(1))", "O(log n)", "O(n^2)"], correct: 1 },
    { id: 3, question: "How does Python handle memory management?", options: ["Manual memory allocation", "Reference counting & Garbage Collector", "Stack allocation only", "Pointers"], correct: 1 },
    { id: 4, question: "What decorator is used to define a class method that operates on the class state?", options: ["@staticmethod", "@classmethod", "@property", "@abstractmethod"], correct: 1 },
    { id: 5, question: "What keyword is used to yield values lazily from a function?", options: ["return", "yield", "emit", "send"], correct: 1 },
    { id: 6, question: "What will `bool([])` evaluate to in Python?", options: ["True", "False", "None", "TypeError"], correct: 1 },
    { id: 7, question: "Which module provides high-performance container datatypes like deque and Counter?", options: ["math", "sys", "collections", "os"], correct: 2 },
    { id: 8, question: "What is the GIL in Python?", options: ["Global Interface Language", "Global Interpreter Lock", "General Input Loop", "Graph Execution Library"], correct: 1 },
    { id: 9, question: "Which algorithm does Python's `sort()` method use internally?", options: ["Quicksort", "Mergesort", "Timsort", "Heapsort"], correct: 2 },
    { id: 10, question: "What does `*args` unpack in a function signature?", options: ["Keyword arguments dictionary", "Positional arguments tuple", "Class attributes", "Global variables"], correct: 1 },
  ],
  java: [
    { id: 1, question: "Which Java memory area stores objects created via `new`?", options: ["Stack", "Heap", "Metaspace", "Program Counter"], correct: 1 },
    { id: 2, question: "What is the key difference between String and StringBuilder?", options: ["StringBuilder is immutable", "String is immutable", "StringBuilder is thread-safe", "String uses double storage"], correct: 1 },
    { id: 3, question: "Which collection interface allows duplicate elements and maintains insertion order?", options: ["Set", "List", "Map", "Queue"], correct: 1 },
    { id: 4, question: "What does the `volatile` keyword ensure in Java multithreading?", options: ["Atomicity", "Visibility across threads", "Mutual exclusion lock", "Deadlock prevention"], correct: 1 },
    { id: 5, question: "Which JVM component compiles bytecode into native machine code at runtime?", options: ["ClassLoader", "JIT Compiler", "Garbage Collector", "Interpreter"], correct: 1 },
    { id: 6, question: "Can an interface in Java 8 contain concrete method implementations?", options: ["No, interfaces are 100% abstract", "Yes, using default or static methods", "Only static private methods", "Only final methods"], correct: 1 },
    { id: 7, question: "What exception is thrown when accessing a null object reference?", options: ["ClassNotFoundException", "NullPointerException", "IllegalArgumentException", "IndexOutOfBoundsException"], correct: 1 },
    { id: 8, question: "What is the default initial capacity of an ArrayList in Java?", options: ["5", "10", "16", "32"], correct: 1 },
    { id: 9, question: "Which design pattern is implemented by `java.lang.Runtime`?", options: ["Factory", "Singleton", "Observer", "Builder"], correct: 1 },
    { id: 10, question: "What keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], correct: 1 },
  ],
  cpp: [
    { id: 1, question: "Which smart pointer in C++11 provides exclusive ownership of a dynamically allocated object?", options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"], correct: 1 },
    { id: 2, question: "What is the Virtual Method Table (vtable) used for in C++?", options: ["Compile-time template instantiation", "Dynamic dispatch for virtual functions", "Memory allocation", "Garbage collection"], correct: 1 },
    { id: 3, question: "What does RAII stand for in C++ software engineering?", options: ["Resource Acquisition Is Initialization", "Random Allocation In Memory", "Runtime Assembly Interface Instruction", "Refined Access Pointer Vector"], correct: 0 },
    { id: 4, question: "What is the worst-case time complexity of `std::sort` in C++11?", options: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"], correct: 1 },
    { id: 5, question: "Which operator is used for explicit type conversion between unrelated pointer types in C++?", options: ["static_cast", "dynamic_cast", "reinterpret_cast", "const_cast"], correct: 2 },
    { id: 6, question: "What happens when a C++ function throws an exception that is not caught?", options: ["Returns 0", "std::terminate is called", "Memory is auto-cleared", "Function retries"], correct: 1 },
    { id: 7, question: "What keyword prevents a class from being inherited in C++11?", options: ["sealed", "final", "const", "static"], correct: 1 },
    { id: 8, question: "Which STL container guarantees constant time insertion and deletion at both ends?", options: ["std::vector", "std::deque", "std::set", "std::stack"], correct: 1 },
    { id: 9, question: "What is a move constructor introduced in C++11?", options: ["Copies member variables", "Transfers ownership of resources using rvalue references", "Moves thread stack", "Swaps arrays"], correct: 1 },
    { id: 10, question: "What is `constexpr` used for in modern C++?", options: ["Declaring constant runtime pointers", "Evaluating expressions at compile time", "Restricting variable scope", "Preventing multi-threading"], correct: 1 },
  ],
};

export default function GrandTestPage() {
  const router = useRouter();
  const params = useParams();
  const courseSlug = params?.courseSlug ? String(params.courseSlug).toLowerCase() : "python";

  const { data: session } = useSession();
  const questions = grandTestQuestionsMap[courseSlug] || grandTestQuestionsMap["python"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  // Timer countdown
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const handleSelectOption = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: optionIdx,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    const pct = Math.round((correctCount / questions.length) * 100);
    setScorePercent(pct);
    setSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const currentQ = questions[currentIndex];
  const isSelected = selectedAnswers[currentQ.id] !== undefined;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      <LeftSidebar
        activeTab="Courses"
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

      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 max-w-5xl mx-auto w-full gap-6">
        {/* Top Header */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black border border-purple-200">
              <Trophy size={14} /> Comprehensive Final Exam
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1 capitalize">
              {courseSlug.toUpperCase()} Grand Certification Test 🏆
            </h1>
          </div>

          {!submitted && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white font-mono font-black text-sm shadow-sm">
              <Clock size={16} className="text-amber-400" /> {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Content Body */}
        {!submitted ? (
          <div className="flex-1 flex flex-col bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-0 justify-between overflow-hidden">
            {/* Progress Header */}
            <div className="space-y-3 shrink-0">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-blue-600 uppercase tracking-widest">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-slate-400">
                  {Object.keys(selectedAnswers).length} of {questions.length} Answered
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text & Options */}
            <div className="flex-1 flex flex-col justify-center space-y-6 my-4 overflow-y-auto pr-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {currentQ.question}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, optIdx) => {
                  const selected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                        selected
                          ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-mono flex items-center justify-center text-slate-600 text-xs shrink-0">
                          {["A", "B", "C", "D"][optIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {selected && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center shrink-0 border-t border-slate-100 pt-4">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={!isSelected}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition shadow-sm"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                  className="px-6 py-2.5 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition shadow-sm"
                >
                  Submit Grand Test ✨
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result Screen */
          <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
              scorePercent >= 80 ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-red-50 border-red-500 text-red-600"
            }`}>
              {scorePercent >= 80 ? <ShieldCheck size={44} /> : <XCircle size={44} />}
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {scorePercent >= 80 ? "🎉 Grand Test Passed!" : "❌ Test Attempt Failed"}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {scorePercent >= 80
                  ? `You achieved an outstanding score of ${scorePercent}%! You have officially mastered ${courseSlug.toUpperCase()} and unlocked your verified certificate.`
                  : `You scored ${scorePercent}%. The passing threshold is 80%. Review the curriculum and try again!`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex gap-6 text-center font-mono">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Final Score</p>
                <p className="text-2xl font-black text-slate-900">{scorePercent}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <p className={`text-2xl font-black ${scorePercent >= 80 ? "text-emerald-600" : "text-red-600"}`}>
                  {scorePercent >= 80 ? "PASSED" : "FAILED"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/certificates")}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition"
              >
                View Verified Certificates →
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

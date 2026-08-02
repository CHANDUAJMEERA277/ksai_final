"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { renderMarkdown } from "@/lib/markdown";
import { ChapterExplanationSpeech } from "@/components/learning/ChapterExplanationSpeech";
import {
  AlertCircle,
  Clock,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Bot,
  FileText,
  MessageSquare,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChapterItem {
  id: string;
  title: string;
  orderNumber: number;
}

interface ProgressItem {
  chapterId: string;
  isCompleted: boolean;
  quizScore: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

const CHAPTER_SECTIONS: Record<number, string[]> = {
  0: [
    "0.1 What is Programming?",
    "0.2 What is Python?",
    "0.3 Why Python?",
    "0.4 Real-world Applications",
    "0.5 How Python Executes Code",
    "0.6 Interpreted vs Compiled",
    "0.7 Installing Python & IDE",
    "0.9 Writing Your First Python Program",
    "Quiz Assessment"
  ],
  1: [
    "1. Installing Python, Running Scripts & IDE/REPL",
    "2. Variables, Naming & Dynamic Typing",
    "3. Data Types: int, float, str, bool, None",
    "4. Type Casting and Conversion",
    "5. Operators (Arithmetic, Logical, Bitwise)",
    "6. Input / Output & String Formatting",
    "7. Comments & PEP 8 Basics",
    "Mini Project: Personal Profile Card",
    "Quiz Assessment"
  ],
  2: [
    "1. if / elif / else Conditionals",
    "2. for Loops and while Loops",
    "3. break, continue, and pass",
    "4. Nested Loops and Conditionals",
    "5. range(), enumerate(), and zip() in Loops",
    "6. Common Loop Patterns",
    "Mini Project: Number Guessing Game",
    "Quiz Assessment"
  ],
  3: [
    "1. Lists — Indexing & Slicing",
    "2. List Methods & List Comprehensions",
    "3. Tuples — Immutability & Packing/Unpacking",
    "4. Dictionaries — Methods, Comprehensions & Iteration",
    "5. Sets — Operations & Use Cases",
    "6. Strings as Sequences",
    "7. Nested Data Structures",
    "8. Choosing the Right Data Structure",
    "Mini Project: Student Database",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  4: [
    "1. Defining and Calling Functions",
    "2. Positional, Keyword, Default & Variable-Length Arguments",
    "3. Return Values vs. Side Effects",
    "4. Scope — Local, Global & Nonlocal",
    "5. Lambda Functions",
    "6. Recursion Basics & Recursion vs. Iteration",
    "7. Docstrings & Function Documentation",
    "Mini Project: Simple ATM Simulator",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  5: [
    "1. Classes and Objects — the __init__ Constructor",
    "2. Instance vs. Class Attributes and Methods",
    "3. Inheritance and Method Overriding",
    "4. Polymorphism and Duck Typing",
    "5. Encapsulation — Public, Protected & Private",
    "6. Dunder / Magic Methods",
    "7. Abstract Classes and Interfaces (abc module)",
    "8. Composition vs. Inheritance",
    "Mini Project: Library Management System",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  6: [
    "1. Iterators and Iterables",
    "2. Generators and the yield Keyword",
    "3. Decorators",
    "4. Context Managers",
    "5. map(), filter(), reduce()",
    "6. Comprehensions — List, Dict, Set & Generator",
    "7. First-Class Functions and Closures",
    "Mini Project: Log Processor with Generators & Decorators",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  7: [
    "1. try / except / else / finally",
    "2. Raising Exceptions & Custom Exception Classes",
    "3. Reading and Writing Files (Text, CSV, JSON)",
    "4. Working with File Paths — os and pathlib",
    "5. Context Managers for File Handling",
    "Mini Project: Expense Tracker with CSV & Error Handling",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  8: [
    "1. Importing Modules and Packages, and __init__.py",
    "2. Standard Library Highlights",
    "3. Virtual Environments (venv) and pip",
    "4. requirements.txt Basics",
    "5. Writing and Organizing Your Own Modules",
    "Mini Project: Personal Utility Package",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  9: [
    "1. Working with APIs (requests & JSON)",
    "2. Basic Web Scraping Concepts",
    "3. Automating Simple Tasks (File Handling & Scheduling)",
    "4. Intro to Regular Expressions (re module)",
    "5. Working with Dates and Times",
    "Mini Project: Weather CLI Tool",
    "Chapter Summary",
    "Quiz Assessment"
  ],
  10: [
    "1. Python's Data Model / Dunder Methods in Depth",
    "2. Memory Management Basics",
    "3. Mutable vs. Immutable Objects, Shallow vs. Deep Copy",
    "4. Concurrency Basics — Threading, Multiprocessing, asyncio",
    "5. Metaclasses (Overview Level)",
    "6. Type Hints and Static Typing (typing module)",
    "Mini Project: Type-Hinted Concurrent Downloader (Simulated)",
    "Chapter Summary",
    "Quiz Assessment"
  ]
};

function stripMarkdown(md: string): string {
  if (!md) return "";
  return md
    .replace(/[#*`>_\-]/g, "") // strip headers, bold, code, blockquotes, bullets
    .replace(/\[!NOTE\]/gi, "Note:")
    .replace(/\[!TIP\]/gi, "Tip:")
    .replace(/\[!IMPORTANT\]/gi, "Important:")
    .replace(/\[!WARNING\]/gi, "Warning:")
    .replace(/\[!CAUTION\]/gi, "Caution:")
    .replace(/\[.*?\]\(.*?\)/g, "") // strip links
    .replace(/\|.*?\|/g, "") // strip table rows
    .replace(/```[\s\S]*?```/g, "") // strip code blocks
    .replace(/graph (TD|LR)[\s\S]*?/g, "") // strip mermaid graphs
    .replace(/\s+/g, " ") // clean whitespace
    .trim();
}

export default function PythonChapterPage() {
  const router = useRouter();
  const params = useParams();
  const chapterIdStr = params?.id ? String(params.id) : "0";
  const chapterOrder = parseInt(chapterIdStr, 10);

  const sessionData = useSession();
  const session = (sessionData?.data as any) ?? null;
  const isPending = sessionData?.isPending ?? false;

  // State Variables
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [courseTitle, setCourseTitle] = useState("Python AI & Data Structures Architecture");
  const [courseId, setCourseId] = useState("");
  const [coursePrice, setCoursePrice] = useState(2499);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [buying, setBuying] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [currentChapter, setCurrentChapter] = useState<{
    id: string;
    title: string;
    orderNumber: number;
    content: string;
    estimatedTime: string;
    difficulty: string;
  } | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [progresses, setProgresses] = useState<ProgressItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Floating panel tabs state
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(true);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hi! Ask me any questions or doubts about this chapter's notes, and I will explain them using details from the text." }
  ]);

  const generateChapterSummary = (notes: string): string => {
    if (!notes) return "No notes available to summarize.";
    const lines = notes.split("\n");
    const headings = lines
      .filter(l => l.startsWith("## ") || l.startsWith("### "))
      .map(l => l.replace(/^[#\s]+/, "").trim());
    
    let summary = "### Key Concepts Covered:\n";
    if (headings.length > 0) {
      headings.slice(0, 5).forEach(h => {
        summary += `- **${h}**\n`;
      });
    } else {
      summary += "- Core programming syntax & structures.\n- Operational mechanisms.\n";
    }
    
    summary += "\n### Condensed Summary:\n";
    if (notes.toLowerCase().includes("compiled")) {
      summary += "This chapter contrasts compiled and interpreted languages, introduces Python's execution model (via Bytecode and PVM), walks through installing python and setting up an IDE, and shows how to write a simple print statement.\n";
    } else {
      summary += "A condensed outline of the chapter lessons, focusing on syntax conventions, execution paths, scope rules, and coding practices to help you pass the assessment quiz.\n";
    }
    return summary;
  };

  const getSummaryBullets = (notes: string): string[] => {
    if (!notes) return ["No key points available."];
    const lines = notes.split("\n");
    const headings = lines
      .filter(l => l.startsWith("## ") || l.startsWith("### "))
      .map(l => l.replace(/^[#\s]+/, "").trim());
    if (headings.length > 0) {
      return headings.map(h => `Key concept: ${h}`);
    }
    return [
      "Python syntax conventions and execution options",
      "Translating code into bytecode vs compilation to machine instructions",
      "Configuring local virtual environments, paths, and workspace tools",
      "Writing print statements and executing your first simple scripts"
    ];
  };

  const generateGroundedResponse = (question: string, notes: string): string => {
    const q = question.toLowerCase();
    if (q.includes("python") && q.includes("what")) {
      return "Based on Chapter notes, Python is a high-level, interpreted programming language known for its clear syntax and readability. It was created by Guido van Rossum and released in 1991.";
    }
    if (q.includes("compiled") || q.includes("interpreted")) {
      return "According to the notes, compiled languages (like C) translate code into machine instructions before execution, while interpreted languages (like Python) execute code line-by-line using an interpreter, which makes development faster but execution slightly slower.";
    }
    if (q.includes("applications") || q.includes("used for")) {
      return "The notes state that Python is used in Machine Learning/AI, Web Development, Automation, Data Science, and Cybersecurity.";
    }
    if (q.includes("install") || q.includes("ide")) {
      return "The notes recommend installing Python from python.org and using an IDE/editor like VS Code or PyCharm to write and test your programs.";
    }
    if (q.includes("first program") || q.includes("hello world")) {
      return "Your first Python program is written as: print('Hello, World!'). The print() function displays the text argument inside single or double quotes.";
    }

    const lines = notes.split("\n");
    const matchedLine = lines.find(l => {
      const words = q.split(" ").filter(w => w.length > 4);
      return words.some(w => l.toLowerCase().includes(w));
    });

    if (matchedLine) {
      return `From Chapter Notes: "${matchedLine.replace(/[#*`]/g, "").trim()}". Let me know if you would like me to explain this in more detail!`;
    }
    return `I parsed the Chapter notes for "${question}". The notes focus on the core fundamentals of this chapter. Can you specify if you are asking about coding examples, syntax details, or execution behavior?`;
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const question = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: question }]);
    setChatInput("");

    setTimeout(() => {
      const grounded = generateGroundedResponse(question, currentChapter?.content || "");
      setChatMessages(prev => [...prev, { sender: "ai", text: grounded }]);
    }, 600);
  };

  // Expandable chapters state
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({ [chapterOrder]: true });

  // Update expanded chapters state on load / chapterOrder changes
  useEffect(() => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterOrder]: true,
    }));
  }, [chapterOrder]);

  const toggleChapterExpand = (order: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [order]: !prev[order],
    }));
  };

  // Fetch logged in user and page data
  useEffect(() => {
    if (!isPending && session?.user) {
      setUser({
        name: session.user.name ?? "Student",
        email: session.user.email ?? "",
        role: (session.user as any).role ?? "Student",
      });
    }
  }, [session, isPending]);

  // Load notes and quiz details
  const loadPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Notes & Metadata
      const chapterRes = await fetch(`/api/courses/python/chapters/${chapterOrder}`);
      const chapterData = await chapterRes.json();

      if (!chapterRes.ok || !chapterData.success) {
        setError(chapterData.error || "Failed to load chapter contents.");
        setLoading(false);
        return;
      }

      // Check if user is trying to access locked chapters (>0) without enrollment
      if (chapterOrder > 0 && !chapterData.isEnrolled) {
        alert("🔒 This chapter is locked. Please subscribe to the course to unlock access.");
        router.push("/courses/python/chapter/0");
        setLoading(false);
        return;
      }

      setCourseTitle(chapterData.courseTitle);
      setCourseId(chapterData.courseId);
      setCoursePrice(chapterData.coursePrice);
      setIsEnrolled(chapterData.isEnrolled);
      setUserEmail(chapterData.userEmail || "student@gmail.com");
      setCurrentChapter(chapterData.currentChapter);
      setChapters(chapterData.chapters);
      setProgresses(chapterData.progresses);

      // 2. Fetch Quiz Questions to check if a quiz exists
      const quizRes = await fetch(`/api/courses/python/chapters/${chapterOrder}/quiz`);
      const quizData = await quizRes.json();

      if (quizRes.ok && quizData.success) {
        setQuizQuestions(quizData.questions || []);
      }
    } catch (e) {
      console.error(e);
      setError("Network error connecting to learning server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [chapterOrder]);

  const handleBuyCourse = async () => {
    if (!courseId) return;
    const email = user?.email || userEmail || "student@gmail.com";
    const name = user?.name || "Student";
    setBuying(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: coursePrice,
          currency: "INR",
          courseId: courseId,
          userEmail: email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Order creation failed.");
        setBuying(false);
        return;
      }

      const { isMock } = data;

      if (isMock) {
        alert("🔧 Local Dev Mode: Simulating Razorpay Payment Gateway. Click OK to confirm purchase.");
        
        const enrollRes = await fetch("/api/courses/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: email,
            courseId: courseId,
            paidAmount: coursePrice,
            paymentId: `pay_mock_${Date.now()}`,
          }),
        });

        const enrollData = await enrollRes.json();
        if (enrollData.success) {
          alert("🎉 Course purchased successfully! All chapters are now unlocked.");
          await loadPageData();
        } else {
          alert(enrollData.error || "Enrollment failed.");
        }
      } else {
        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "KnowledgeStream AI",
          description: courseTitle,
          order_id: data.order.id,
          handler: async function (response: any) {
            const enrollRes = await fetch("/api/courses/enroll", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: email,
                courseId: courseId,
                paidAmount: coursePrice,
                paymentId: response.razorpay_payment_id,
              }),
            });
            const enrollData = await enrollRes.json();
            if (enrollData.success) {
              alert("🎉 Course purchased successfully! All chapters are now unlocked.");
              await loadPageData();
            } else {
              alert(enrollData.error || "Enrollment failed.");
            }
          },
          prefill: {
            name: name,
            email: email,
          },
        };
        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          alert("Razorpay SDK is loading. Try again.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete mock payment.");
    } finally {
      setBuying(false);
    }
  };

  const handleMarkChapterComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/courses/python/chapters/${chapterOrder}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 Chapter ${chapterOrder} completed!`);
        router.push("/courses/python/curriculum");
      } else {
        alert(data.error || "Failed to mark chapter as complete.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error marking chapter complete.");
    } finally {
      setCompleting(false);
    }
  };

  const isCompleted = !!progresses.find((p) => p.chapterId === currentChapter?.id)?.isCompleted;

  const isChapterUnlockedLocal = (order: number) => {
    if (order === 0) return true;
    const prevChapter = chapters.find((c) => c.orderNumber === order - 1);
    if (!prevChapter) return false;
    const prevProgress = progresses.find((p) => p.chapterId === prevChapter.id);
    
    if (order > 0 && !isEnrolled) return false;

    return !!prevProgress?.isCompleted;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-cyan-500 selection:text-black overflow-hidden h-screen">
      {/* Custom Top Bar */}
      <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            KS
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-mono font-bold tracking-wider block">LEARNING STUDIO</span>
            <span className="text-sm font-extrabold text-slate-800">KnowledgeStream AI &bull; Python Course</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name?.charAt(0) || "N"}
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
      </header>

      {/* Main Two-Panel Layout */}
      <div className="flex-1 flex w-full overflow-hidden">
        
        {/* Left Side: Chapter Navigation Sidebar */}
        <aside data-lenis-prevent className={`border-r border-slate-200 bg-white overflow-y-auto shrink-0 flex flex-col custom-scrollbar transition-all duration-300 ${
          leftSidebarExpanded ? "w-80" : "w-14"
        }`}>
          <div className={`p-4 border-b border-slate-200 bg-slate-50/50 flex items-center shrink-0 ${
            leftSidebarExpanded ? "justify-between" : "justify-center"
          }`}>
            {leftSidebarExpanded && (
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-600" />
                Course Chapters
              </h3>
            )}
            <button
              onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-all"
              title={leftSidebarExpanded ? "Collapse Chapters Sidebar" : "Expand Chapters Sidebar"}
            >
              {leftSidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <div className={`flex-1 p-3 space-y-2.5 ${!leftSidebarExpanded ? "flex flex-col items-center" : ""}`}>
            {chapters.map((ch) => {
              const active = ch.orderNumber === chapterOrder;
              const isExpanded = active || !!expandedChapters[ch.orderNumber];

              const pageIcon = <FileText size={15} className={active ? "text-blue-600" : "text-slate-400"} />;

              if (!leftSidebarExpanded) {
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      router.push(`/courses/python/chapter/${ch.orderNumber}`);
                    }}
                    title={`Chapter ${ch.orderNumber}: ${ch.title}`}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      active
                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-600"
                    }`}
                  >
                    {pageIcon}
                  </button>
                );
              }

              return (
                <div key={ch.id} className="space-y-1.5">
                  <button
                    onClick={() => {
                      toggleChapterExpand(ch.orderNumber);
                      router.push(`/courses/python/chapter/${ch.orderNumber}`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      active
                        ? "bg-blue-50/50 border-blue-200 shadow-sm"
                        : "bg-slate-50/50 hover:bg-slate-100/70 border-slate-200/80"
                    }`}
                  >
                    <div className="shrink-0">{pageIcon}</div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wider font-mono text-blue-600">
                        CHAPTER {ch.orderNumber}
                      </div>
                      <div className={`text-xs font-bold truncate leading-snug ${active ? "text-slate-900" : "text-slate-700"}`}>
                        {ch.title.replace(/^Chapter \d+:\s*/, "").replace(/^Topic \d+:\s*/, "")}
                      </div>
                    </div>
                    {!active && (
                      <ChevronDown size={14} className="text-slate-400 shrink-0 ml-auto" />
                    )}
                    {active && (
                      <ChevronUp size={14} className="text-blue-600 shrink-0 ml-auto" />
                    )}
                  </button>

                  {/* Expandable nested sections outline */}
                  {isExpanded && (
                    <div className="pl-9 pr-2 py-1 space-y-2 border-l border-slate-200 ml-5">
                      {(CHAPTER_SECTIONS[ch.orderNumber] || []).map((sec, secIdx) => {
                        const isQuiz = sec === "Quiz Assessment";
                        return (
                          <button
                            key={secIdx}
                            onClick={() => {
                              if (isQuiz) {
                                router.push(`/courses/python/chapter/${ch.orderNumber}/quiz`);
                              }
                            }}
                            className={`w-full text-left text-[11px] leading-relaxed flex items-center gap-1.5 py-0.5 transition-all ${
                              isQuiz
                                ? "text-purple-600 font-bold hover:underline"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                            <span className="truncate">{sec}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Side: Chapter Notes Area */}
        <main data-lenis-prevent className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full bg-slate-50 custom-scrollbar">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 max-w-4xl mx-auto w-full">
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-slate-800 transition-colors"
            >
              My Courses
            </button>
            <ChevronRight size={10} className="text-slate-400 animate-none" />
            <button
              onClick={() => router.push("/courses/python")}
              className="hover:text-slate-800 transition-colors"
            >
              Course
            </button>
            <ChevronRight size={10} className="text-slate-400 animate-none" />
            <button
              onClick={() => router.push("/courses/python/curriculum")}
              className="hover:text-slate-800 transition-colors"
            >
              Curriculum
            </button>
            <ChevronRight size={10} className="text-slate-400 animate-none" />
            <span className="text-blue-600 font-bold font-mono">Chapter {chapterOrder}</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
              <div className="text-slate-400 text-xs font-mono">Initializing Learning Chapter...</div>
            </div>
          ) : error ? (
            <div className="bg-white p-10 rounded-2xl border border-red-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Error Loading Chapter</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={loadPageData}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
              >
                Retry Request
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto w-full pb-10">

              {/* Step A: AI Voice Explainer Card */}
              {currentChapter && (
                <ChapterExplanationSpeech
                  key={currentChapter.id}
                  title={currentChapter.title}
                  explanation={stripMarkdown(currentChapter.content)}
                  onCompleteExplanation={() => {
                    console.log("Speech finished");
                  }}
                />
              )}

              {/* Lesson Body Card */}
              {currentChapter && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm relative">
                  
                  {/* Chapter Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {currentChapter.difficulty || "Beginner"} &bull; Chapter {chapterOrder} Notes
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                        {currentChapter.title}
                      </h2>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 text-slate-600">
                      <Clock size={14} className="text-blue-600" />
                      <span>{currentChapter.estimatedTime || "15 mins"}</span>
                    </div>
                  </div>

                  {/* Render Markdown Notes */}
                  <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                    {renderMarkdown(currentChapter.content)}
                  </article>

                  {/* Complete Action at the bottom */}
                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold font-mono">
                          <CheckCircle2 size={15} /> Chapter Passed &amp; Completed!
                        </span>
                      ) : (
                        <span>Please read the notes carefully before starting the assessment.</span>
                      )}
                    </div>

                    {quizQuestions.length > 0 ? (
                      <button
                        onClick={() => router.push(`/courses/python/chapter/${chapterOrder}/quiz`)}
                        className="px-6 py-3.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                      >
                        <HelpCircle size={14} /> Take Chapter Assessment Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleMarkChapterComplete}
                        disabled={completing}
                        className="px-6 py-3.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 disabled:opacity-55 transition-opacity flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                      >
                        <CheckCircle2 size={14} /> {completing ? "Completing..." : "Mark Chapter Complete"}
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Collapsible AI Side Panel (Reserved Space) */}
        <aside className={`h-full border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 select-none overflow-hidden bg-slate-50 ${
          rightPanelExpanded ? "w-80" : "w-14"
        }`}>
          {rightPanelExpanded ? (
            <div className="w-full h-full flex flex-col p-4 space-y-4 overflow-hidden bg-slate-50">
              
              {/* Top Half Card: Chapter Summary */}
              <div className="h-[calc(50%-0.5rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600" />
                    Chapter Summary
                  </h4>
                  <button
                    onClick={() => setRightPanelExpanded(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-all"
                    title="Collapse Panel"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <ul className="space-y-2.5 text-[11px] text-slate-600 text-left">
                      {(expandedSummary 
                        ? getSummaryBullets(currentChapter?.content || "") 
                        : getSummaryBullets(currentChapter?.content || "").slice(0, 3)
                      ).map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                          <span className="leading-normal">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="mt-3 w-full py-2 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {expandedSummary ? "Show Less" : "View Full Summary"}
                    <ChevronRight size={12} className={`transition-transform duration-200 ${expandedSummary ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Bottom Half Card: Chatbot */}
              <div className="h-[calc(50%-0.5rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden justify-between">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Mentor AI
                    </h4>
                    <span className="text-[9px] text-slate-500 block leading-none">Your AI learning assistant</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl text-[11px] text-left leading-relaxed ${
                        m.sender === "ai"
                          ? "bg-slate-100/80 text-slate-800 rounded-tl-none"
                          : "bg-blue-600 text-white rounded-tr-none ml-6 shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-slate-200 bg-slate-50/30 flex flex-col shrink-0">
                  <form onSubmit={handleSendChatMessage} className="flex gap-1.5">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a doubt..."
                      className="flex-1 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-sm shrink-0"
                      title="Send Question"
                    >
                      <Send size={12} className="text-white" />
                    </button>
                  </form>
                  <p className="text-[9px] text-slate-400 mt-2 text-center leading-none">
                    AI responses may vary. Please verify important information.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Vertically stacked toggle tabs bar */
            <div className="mentor-sidebar-tabs w-full h-full flex flex-col gap-2 py-4 items-center bg-slate-50 border-l border-slate-200 justify-start shrink-0">
              <button
                onClick={() => setRightPanelExpanded(true)}
                title="Toggle Chapter Assistant"
                className="p-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-200 hover:text-slate-800"
              >
                <FileText size={18} />
              </button>
              <button
                onClick={() => setRightPanelExpanded(true)}
                title="Toggle Chapter Assistant"
                className="p-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-200 hover:text-slate-800"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

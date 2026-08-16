"use client";

import React, {
  useState,
  useEffect,
  useRef
} from "react";

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

type LearningStatus =
  | "NOT_STARTED"
  | "LEARNING"
  | "PRACTICED"
  | "NEEDS_REVIEW"
  | "MASTERED";

interface LessonProgress {
  lesson: string;
  status: LearningStatus;
  score: number;
  attempts: number;
  questionsAsked: number;
  correctAnswers: number;
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
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

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

  

  

  const [chatLoading, setChatLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
const [completedLessons, setCompletedLessons] = useState<string[]>([]);
const [lessonProgress, setLessonProgress] =
  useState<Record<string, LessonProgress>>({});
const [currentLessonIndex, setCurrentLessonIndex] = useState(0);


const handleTeachingRequest = async (
  question: string,
  mode: string = "chat"
) => {
  if (!question.trim() || chatLoading) return;

if (!currentChapter) return;

markLessonLearning();

  // Show student's message immediately
  setChatMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: question,
    },
  ]);

  setChatInput("");
  setChatLoading(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/ai/teach/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: "Python",
          chapter: currentChapter.title,
          topic: currentLesson || currentChapter.title,
          content: getLessonContent(),

          question: `
Student request:
${question}

Learning progress:
Completed lessons:
${
  completedLessons.length > 0
    ? completedLessons.join("\n")
    : "None"
}

Current lesson:
${currentLesson || "Not selected"}

Remaining lessons:
${getLessons()
  .filter(
    (lesson) => !completedLessons.includes(lesson)
  )
  .join("\n")}
`,

          mode: mode,
          history: chatMessages,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Teaching request failed."
      );
    }

    const aiResponse =
      data.data?.response ??
      data.response ??
      "";

    if (!aiResponse) {
      throw new Error(
        "CodeXAI returned an empty response."
      );
    }

    // Display AI response
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: aiResponse,
      },
    ]);

    // 🔊 Speak AI response
    speakMentor(aiResponse);

  } catch (error) {

    console.error(
      "CodeXAI Teaching Error:",
      error
    );

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text:
          "⚠️ I couldn't connect to the teaching engine right now. Please try again.",
      },
    ]);

  } finally {
    setChatLoading(false);
  }
};

const initializeLessonProgress = () => {
  const lessons = getLessons();

  setLessonProgress((prev) => {
    const next = { ...prev };

    lessons.forEach((lesson) => {
      if (!next[lesson]) {
        next[lesson] = {
          lesson,
          status: "NOT_STARTED",
          score: 0,
          attempts: 0,
          questionsAsked: 0,
          correctAnswers: 0,
        };
      }
    });

    return next;
  });
};


const getLessons = () => {
  return (CHAPTER_SECTIONS[chapterOrder] || []).filter(
    (section) => section !== "Quiz Assessment"
  );
};

const totalLessons = getLessons().length;

const masteredLessons = Object.values(lessonProgress).filter(
  (item) => item.status === "MASTERED"
).length;

const learningPercentage =
  totalLessons > 0
    ? Math.round((masteredLessons / totalLessons) * 100)
    : 0;

const getLessonContent = () => {
  if (!currentChapter?.content) return "";

  const lesson = currentLesson;

  if (!lesson) {
    return currentChapter.content;
  }

  const content = currentChapter.content;

  // Try to find the selected lesson heading in the chapter content.
  const startIndex = content.toLowerCase().indexOf(lesson.toLowerCase());

  if (startIndex === -1) {
    return content;
  }

  const lessons = getLessons();

  const lessonIndex = lessons.indexOf(lesson);

  if (lessonIndex === -1 || lessonIndex === lessons.length - 1) {
    return content.slice(startIndex);
  }

  const nextLesson = lessons[lessonIndex + 1];

  const endIndex = content
    .toLowerCase()
    .indexOf(nextLesson.toLowerCase(), startIndex + lesson.length);

  if (endIndex === -1) {
    return content.slice(startIndex);
  }

  return content.slice(startIndex, endIndex);
};

  // Expandable chapters state
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({ [chapterOrder]: true });


  useEffect(() => {
  if (!chatScrollRef.current) return;

  chatScrollRef.current.scrollTo({
    top: chatScrollRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [chatMessages, chatLoading]);


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

useEffect(() => {
  const sections = getLessons();

  initializeLessonProgress();

  if (sections.length > 0 && !currentLesson) {
    setCurrentLesson(sections[0]);
    setCurrentLessonIndex(0);
  }
}, [chapterOrder, currentLesson]);

const markLessonLearning = () => {
  if (!currentLesson) return;

  setLessonProgress((prev) => ({
    ...prev,
    [currentLesson]: {
      ...(prev[currentLesson] || {
        lesson: currentLesson,
        score: 0,
        attempts: 0,
        questionsAsked: 0,
        correctAnswers: 0,
      }),
      status: "LEARNING",
    },
  }));
};


const markLessonCompleted = () => {
  if (!currentLesson) return;

  setCompletedLessons((prev) => {
    if (prev.includes(currentLesson)) {
      return prev;
    }

    return [...prev, currentLesson];
  });
};

const getLessonStatus = (
  lesson: string
): LearningStatus => {
  return (
    lessonProgress[lesson]?.status ||
    "NOT_STARTED"
  );
};

const getLessonStatusLabel = (
  lesson: string
): string => {
  const status = getLessonStatus(lesson);

  switch (status) {
    case "LEARNING":
      return "Learning";

    case "PRACTICED":
      return "Practiced";

    case "NEEDS_REVIEW":
      return "Needs Review";

    case "MASTERED":
      return "Mastered";

    default:
      return "Not Started";
  }
};

const markLessonMastered = () => {
  if (!currentLesson) return;

  setLessonProgress((prev) => ({
    ...prev,
    [currentLesson]: {
      ...(prev[currentLesson] || {
        lesson: currentLesson,
        score: 0,
        attempts: 0,
        questionsAsked: 0,
        correctAnswers: 0,
      }),
      status: "MASTERED",
      score: 100,
    },
  }));
};

const [isMentorSpeaking, setIsMentorSpeaking] =
  useState(false);

const speakMentor = (text: string) => {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/```[\s\S]*?```/g, "code example")
    .replace(/[*#_>`]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (!cleanText) return;

  const utterance =
    new SpeechSynthesisUtterance(cleanText);

  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    setIsMentorSpeaking(true);
  };

  utterance.onend = () => {
    setIsMentorSpeaking(false);
  };

  utterance.onerror = () => {
    setIsMentorSpeaking(false);
  };

  window.speechSynthesis.speak(utterance);
};

const stopMentorSpeaking = () => {
  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }

  setIsMentorSpeaking(false);
};


const [isListening, setIsListening] =
  useState(false);

const startMentorListening = () => {
  if (typeof window === "undefined") return;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Voice input is not supported in this browser."
    );
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event: any) => {
    let transcript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      transcript +=
        event.results[i][0].transcript;
    }

    setChatInput(transcript);
  };

  recognition.onerror = () => {
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};

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
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
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
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                      <div className={`text-sm font-bold truncate leading-snug ${active ? "text-slate-900" : "text-slate-700"}`}>
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
                        const status = isQuiz
                          ? "NOT_STARTED"
                          : getLessonStatus(sec);
                        return (
                          <button
                            key={secIdx}
                            onClick={() => {
  if (isQuiz) {
    router.push(`/courses/python/chapter/${ch.orderNumber}/quiz`);
    return;
  }

  setCurrentLesson(sec);
setCurrentLessonIndex(secIdx);
}}
                            className={`w-full text-left text-[11px] leading-relaxed flex items-center gap-1.5 py-0.5 transition-all ${
                              isQuiz
                                ? "text-purple-600 font-bold hover:underline"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <span
  className={`w-2 h-2 rounded-full shrink-0 ${
    status === "MASTERED"
      ? "bg-emerald-500"
      : status === "PRACTICED"
      ? "bg-blue-500"
      : status === "LEARNING"
      ? "bg-amber-500"
      : status === "NEEDS_REVIEW"
      ? "bg-red-500"
      : "bg-slate-300"
  }`}
/>
                            <span className="truncate flex-1">
                              {sec}
                            </span>

                            {!isQuiz && (
                              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                {getLessonStatusLabel(sec)}
                              </span>
                            )}
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
          <div className="flex items-center gap-1.5 text-sm text-slate-500 max-w-6xl mx-auto w-full">
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
              <div className="text-slate-400 text-sm font-mono">Initializing Learning Chapter...</div>
            </div>
          ) : error ? (
            <div className="bg-white p-10 rounded-2xl border border-red-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Error Loading Chapter</h3>
              <p className="text-sm text-slate-500">{error}</p>
              <button
                onClick={loadPageData}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
              >
                Retry Request
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto w-full pb-10">

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

                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold flex items-center gap-1.5 text-slate-600">
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
                    <div className="text-sm text-slate-500">
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
                        className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                      >
                        <HelpCircle size={14} /> Take Chapter Assessment Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleMarkChapterComplete}
                        disabled={completing}
                        className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 disabled:opacity-55 transition-opacity flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
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

        {/* Right Learning Assistant Panel */}
<aside
  className={`h-full border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 select-none overflow-hidden bg-slate-50 ${
    rightPanelExpanded ? "w-[460px]" : "w-14"
  }`}
>
  {rightPanelExpanded ? (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden bg-slate-50">

      {/* ========================================= */}
      {/* MY LEARNING NOTES */}
      {/* ========================================= */}
      <button
        type="button"
        onClick={() => router.push("/notes")}
        className="w-full text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
            <BookOpen size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold text-slate-800">
              My Learning Notes
            </h3>

            <p className="text-[10px] text-slate-500 mt-0.5">
              Open your notes
            </p>
          </div>

          <ChevronRight
            size={16}
            className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
          />

        </div>
      </button>


      {/* ========================================= */}
      {/* CODEXAI MENTOR */}
      {/* ========================================= */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Mentor Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 shrink-0">



          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Bot size={19} />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800">
                CodeXAI Mentor
              </h3>

              <p className="text-[10px] text-slate-500">
                Personal learning guide
              </p>
            </div>

          </div>

          {isMentorSpeaking && (
  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600">
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      CodeXAI is speaking...
    </div>

    <button
      type="button"
      onClick={stopMentorSpeaking}
      className="text-[10px] font-bold text-slate-500 hover:text-red-500"
    >
      Stop
    </button>
  </div>
)}

          

        </div>

        {/* ========================================= */}
{/* CODEXAI MENTOR SCROLL AREA */}
{/* ========================================= */}

<div
  ref={chatScrollRef}
  className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
>

  {/* Teaching Conversation */}
  <div className="p-4 space-y-3">

    {chatMessages.map((message, index) => (
      <div
        key={index}
        className={`flex ${
          message.sender === "user"
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            message.sender === "user"
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-slate-100 text-slate-700 border border-slate-200 rounded-bl-md"
          }`}
        >
          {message.text}
        </div>
      </div>
    ))}

    {chatLoading && (
      <div className="flex justify-start">
        <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-500">
          CodeXAI is teaching...
        </div>
      </div>
    )}

  </div>


  {/* Learning Actions */}
  <div className="p-4">

    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
      How can I help you?
    </p>

    <div className="space-y-2">

      {/* Explain */}
      <button
        type="button"
        onClick={() =>
          handleTeachingRequest(
            "Explain this topic in a simple way.",
            "explain"
          )
        }
        disabled={chatLoading}
        className="w-full text-left px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        💡 Explain this topic
      </button>


      {/* Example */}
      <button
        type="button"
        onClick={() =>
          handleTeachingRequest(
            "Give me a simple example of this topic.",
            "example"
          )
        }
        disabled={chatLoading}
        className="w-full text-left px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        📝 Give me an example
      </button>


      {/* Visual */}
      <button
        type="button"
        onClick={() =>
          handleTeachingRequest(
            "Show me this concept visually. Use a simple flow, diagram, or structured explanation if appropriate.",
            "visual"
          )
        }
        disabled={chatLoading}
        className="w-full text-left px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        🎨 Show me visually
      </button>


      {/* Question */}
      <button
        type="button"
        onClick={() =>
          handleTeachingRequest(
            "Ask me one question about this topic to check my understanding. Do not give me the answer immediately.",
            "question"
          )
        }
        disabled={chatLoading}
        className="w-full text-left px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        ❓ Ask me a question
      </button>


      {/* Confused */}
      <button
        type="button"
        onClick={() =>
          handleTeachingRequest(
            "I'm confused about this topic. Explain it differently using simpler intuition and a small example.",
            "confused"
          )
        }
        disabled={chatLoading}
        className="w-full text-left px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        🤔 I'm confused
      </button>

    </div>


    {/* Current Learning Context */}
    <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-100">

      <div className="flex items-center gap-2 mb-1.5">

        <Sparkles
          size={13}
          className="text-blue-600"
        />

        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
          Currently Learning
        </span>

      </div>


      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
        {currentLesson ||
          currentChapter?.title ||
          `Chapter ${chapterOrder}`}
      </p>

      {currentLesson && (
  <div className="mt-2 flex items-center gap-2">
    <span
      className={`w-2 h-2 rounded-full ${
        getLessonStatus(currentLesson) === "MASTERED"
          ? "bg-emerald-500"
          : getLessonStatus(currentLesson) === "LEARNING"
          ? "bg-amber-500"
          : getLessonStatus(currentLesson) === "PRACTICED"
          ? "bg-blue-500"
          : getLessonStatus(currentLesson) === "NEEDS_REVIEW"
          ? "bg-red-500"
          : "bg-slate-300"
      }`}
    />

    <span className="text-[10px] font-semibold text-slate-500">
      {getLessonStatusLabel(currentLesson)}
    </span>
  </div>
)}


      <div className="mt-3 flex items-center justify-between text-[10px]">

        <span className="text-slate-500">
          Lesson progress
        </span>

        <span className="font-bold text-blue-600">
          {completedLessons.length}/
          {(CHAPTER_SECTIONS[chapterOrder] || []).filter(
            (section) => section !== "Quiz Assessment"
          ).length}
        </span>

      </div>

    </div>

  </div>

</div>


     


        {/* Ask Mentor */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 shrink-0">

          <form
  onSubmit={(e) => {
    e.preventDefault();
    handleTeachingRequest(chatInput, "chat");
  }}
  className="flex items-center gap-2"
>
  <input
    type="text"
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    placeholder="Ask about this lesson..."
    className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
  />

  <button
    type="submit"
    disabled={!chatInput.trim() || chatLoading}
    className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-sm shrink-0 disabled:opacity-50"
    title="Ask CodeXAI"
  >
    <Send size={13} />
  </button>
</form>

          <p className="text-[9px] text-slate-400 mt-2 text-center">
            CodeXAI uses this lesson as context.
          </p>

        </div>

      </div>


      {/* ========================================= */}
      {/* COLLAPSE BUTTON */}
      {/* ========================================= */}
      <button
        type="button"
        onClick={() => setRightPanelExpanded(false)}
        className="absolute"
        aria-label="Collapse learning assistant"
      />

    </div>
  ) : (
    <div className="w-full h-full flex flex-col gap-2 py-4 items-center bg-slate-50">

      <button
        onClick={() => setRightPanelExpanded(true)}
        title="Open Learning Assistant"
        className="p-2.5 rounded-xl transition-all text-slate-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <Sparkles size={18} />
      </button>

      <button
        onClick={() => setRightPanelExpanded(true)}
        title="Open My Learning Notes"
        className="p-2.5 rounded-xl transition-all text-slate-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <BookOpen size={18} />
      </button>

    </div>
  )}
</aside>

      </div>
    </div>
  );
}

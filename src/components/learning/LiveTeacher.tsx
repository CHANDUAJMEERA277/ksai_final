"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface LiveTeacherProps {
  contentRef: React.RefObject<HTMLElement | null>;

  chapterTitle: string;
  chapterContent: string;

  course: string;
  courseId: string;
  chapterId: string;
  userEmail: string;

  activeTopic?: string;
activeTopicContent?: string;

  onExplain: (
  content: string,
  title: string,
  learningMemory?: string
) => Promise<string>;

  onResumeRecap?: (
    resumeTitle: string
  ) => Promise<{
    recap: string;
    questions: string[];
  }>;

    onEvaluateResumeAnswer?: (
    question: string,
    answer: string
  ) => Promise<string>;

  onEvaluateCheckpoint?: (
    question: string,
    answer: string
  ) => Promise<{
    result: "CORRECT" | "PARTIAL" | "INCORRECT";
    feedback: string;
  }>;

  onEvaluateChapter?: (
    answers: Array<{
      question: string;
      answer: string;
    }>
  ) => Promise<string>;

  onLessonStart?: (title: string) => void;
  onLessonComplete?: (title: string) => void;

  onChapterComplete?: () => void;
}


export interface LiveTeacherHandle {
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

type TeacherState =
  | "IDLE"
  | "READING"
  | "THINKING"
  | "EXPLAINING"
  | "WAITING"
  | "PAUSED"
  | "COMPLETED";

const LiveTeacher = forwardRef<
  LiveTeacherHandle,
  LiveTeacherProps
>( ({
  contentRef,
chapterTitle,
chapterContent,
course,
courseId,
chapterId,
userEmail,
onExplain,
    onResumeRecap,
      activeTopic,
  onEvaluateResumeAnswer,
  onEvaluateCheckpoint,
  onEvaluateChapter,
  onLessonStart,
  onLessonComplete,
  onChapterComplete,
}, ref) => {
  const [state, setState] = useState<TeacherState>("IDLE");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [teacherText, setTeacherText] = useState("");
  const [visibleText, setVisibleText] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [checkpointQuestion, setCheckpointQuestion] =
  useState("");

const [checkpointAnswer, setCheckpointAnswer] =
  useState("");

const [showCheckpoint, setShowCheckpoint] =
  useState(false);

const [checkpointFeedback, setCheckpointFeedback] =
  useState("");

  const [completedUnits, setCompletedUnits] = useState(0);
const [completedCheckpoints, setCompletedCheckpoints] = useState(0);

const [hasSavedProgress, setHasSavedProgress] = useState(false);
const [showResumePrompt, setShowResumePrompt] = useState(false);
const [resumeIndex, setResumeIndex] = useState(0);
const [resumeTitle, setResumeTitle] = useState("");
const [resumeRecap, setResumeRecap] = useState("");
const [resumeQuestions, setResumeQuestions] = useState<string[]>([]);
const [resumeInstantRecap, setResumeInstantRecap] = useState("");
const [resumeQuestionIndex, setResumeQuestionIndex] = useState(0);
const [resumeAnswer, setResumeAnswer] = useState("");
const [resumeFeedback, setResumeFeedback] = useState("");
const [resumeLoading, setResumeLoading] = useState(false);
const [resumeAnswers, setResumeAnswers] = useState<
  Array<{ question: string; answer: string }>
>([]);
const [chapterEvaluation, setChapterEvaluation] = useState("");
const [chapterEvaluationLoading, setChapterEvaluationLoading] =
  useState(false);
const [resumeListening, setResumeListening] = useState(false);
const [showResumeCheck, setShowResumeCheck] = useState(false);


  const [pointerPosition, setPointerPosition] = useState<{
  top: number;
  left: number;
  visible: boolean;
}>({
  top: 0,
  left: 0,
  visible: false,
});

  // 🔊 Voice is ON by default
const [voiceEnabled, setVoiceEnabled] = useState(true);
const voiceEnabledRef = useRef(true);

  type TeachingUnitType =
  | "heading"
  | "paragraph"
  | "code"
  | "list"
  | "quote"
  | "table"
  | "example";

interface TeachingUnit {
  anchor: HTMLElement;
  elements: HTMLElement[];
  title: string;
  content: string;
  type: TeachingUnitType;
}

const unitsRef = useRef<TeachingUnit[]>([]);
const progressStorageKey =
  `ksai-live-teacher-progress-${course}-${chapterTitle}`;
const stopRef = useRef(false);
const pauseRef = useRef(false);
const checkpointContinueRef =
  useRef(false);
const nextRequestedRef = useRef(false);

useImperativeHandle(ref, () => ({
  pause: () => {
    pauseRef.current = true;

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.pause();
    }

    setState("PAUSED");
  },

  resume: () => {
    pauseRef.current = false;

    if (
      voiceEnabledRef.current &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.resume();
    }

    setState("READING");
  },

  stop: () => {
    stopRef.current = true;
    pauseRef.current = false;

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setState("IDLE");
  },
}));

const saveTeachingProgress = (
  index: number,
  title: string,
  completedCount: number,
  lastExplanation = ""
) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        currentIndex: index,
        currentTitle: title,
        completedUnits: completedCount,
        totalUnits: unitsRef.current.length,
        completedCheckpoints,
        lastExplanation: lastExplanation.trim(),
        savedAt: new Date().toISOString(),
        completed: false,
      })
    );
  } catch (error) {
    console.error(
      "Failed to save Live Teacher progress:",
      error
    );
  }
};

useEffect(() => {
  if (typeof window === "undefined") return;

  try {
    const saved = localStorage.getItem(
      progressStorageKey
    );

    if (!saved) return;

    const data = JSON.parse(saved);

    if (
      typeof data.currentIndex !== "number" ||
      !data.currentTitle
    ) {
      return;
    }

    if (data.completed) {
      return;
    }

    setHasSavedProgress(true);
    setResumeIndex(data.currentIndex);
    setResumeTitle(data.currentTitle);
    setResumeInstantRecap(
      typeof data.lastExplanation === "string"
        ? data.lastExplanation.trim()
        : ""
    );
  } catch (error) {
    console.error(
      "Failed to restore Live Teacher progress:",
      error
    );
  }
}, [progressStorageKey]);

  // --------------------------------------------------
  // Collect actual chapter elements
  // --------------------------------------------------

  const extractSourceSection = (
  title: string
): string => {
  if (!chapterContent?.trim()) {
    return "";
  }

  const source = chapterContent.trim();

  const normalizedTitle = title
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const normalizedSource = source
    .replace(/\s+/g, " ")
    .toLowerCase();

  const titleIndex =
    normalizedSource.indexOf(normalizedTitle);

  if (titleIndex === -1) {
    return "";
  }

  const sourceStart = titleIndex;

  const afterTitle =
    source.slice(
      sourceStart + title.length
    );

  /*
   * Find the next Markdown heading.
   *
   * Example:
   *
   * ## Introduction
   *
   * content...
   *
   * ## Variables
   *
   * content...
   */
  const nextHeadingMatch =
    afterTitle.match(
      /\n#{1,6}\s+.+/m
    );

  if (!nextHeadingMatch?.index) {
    return source.slice(sourceStart).trim();
  }

  const endIndex =
    sourceStart +
    title.length +
    nextHeadingMatch.index;

  return source
    .slice(sourceStart, endIndex)
    .trim();
};


  const collectUnits = (): TeachingUnit[] => {
  const root = contentRef.current;

  if (!root) {
    console.error(
      "❌ LiveTeacher: contentRef is NULL"
    );

    return [];
  }

  console.log(
    "🔎 LiveTeacher DOM text:",
    root.innerText
  );

  const elements = Array.from(
    root.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, blockquote, pre, ul, ol, table"
    )
  ) as HTMLElement[];

  console.log(
    "🔎 LiveTeacher elements found:",
    elements.length
  );

  const filtered = elements.filter(
    (element) => {
      const text =
        element.innerText?.trim();

      if (!text) return false;

      if (text.length < 2) return false;

      /*
       * Ignore paragraphs inside list items.
       */
      if (
        element.tagName === "P" &&
        element.closest("li")
      ) {
        return false;
      }

      return true;
    }
  );

  const units: TeachingUnit[] = [];

let currentUnit: TeachingUnit | null = null;


  /*
   * --------------------------------------------------
   * OPTIONAL ACTIVE TOPIC FILTER
   * --------------------------------------------------
   */

  const topicHeading = activeTopic
    ? Array.from(
        root.querySelectorAll(
          "h1, h2, h3, h4, h5, h6"
        )
      ).find(
        (heading) =>
          heading.textContent
            ?.trim()
            .toLowerCase() ===
          activeTopic
            .trim()
            .toLowerCase()
      ) as HTMLElement | undefined
    : undefined;

  if (activeTopic && !topicHeading) {
    console.warn(
      "⚠️ LiveTeacher: active topic heading not found:",
      activeTopic
    );
  }

  let insideActiveTopic =
    !activeTopic;

  const activeHeadingLevel =
    topicHeading
      ? Number(
          topicHeading.tagName.substring(1)
        )
      : null;

  filtered.forEach((element) => {
    const isHeading =
      /^H[1-6]$/.test(
        element.tagName
      );

    /*
     * --------------------------------------------------
     * ACTIVE TOPIC SCOPING
     * --------------------------------------------------
     */

    if (activeTopic) {
      if (element === topicHeading) {
        insideActiveTopic = true;
      } else if (
        insideActiveTopic &&
        isHeading &&
        activeHeadingLevel !== null &&
        Number(
          element.tagName.substring(1)
        ) <= activeHeadingLevel
      ) {
        insideActiveTopic = false;
      }

      if (!insideActiveTopic) {
        return;
      }
    }

    const text =
      element.innerText.trim();

    let type: TeachingUnitType =
      "paragraph";

    if (isHeading) {
      type = "heading";
    } else if (
      element.tagName === "PRE"
    ) {
      type = "code";
    } else if (
      element.tagName === "BLOCKQUOTE"
    ) {
      type = "quote";
    } else if (
      element.tagName === "UL" ||
      element.tagName === "OL"
    ) {
      type = "list";
    } else if (
      element.tagName === "TABLE"
    ) {
      type = "table";
    }

    /*
     * --------------------------------------------------
     * NEW SECTION
     * --------------------------------------------------
     */

    if (isHeading) {
      if (currentUnit) {
        if (
          currentUnit.content.trim() ===
          currentUnit.title.trim()
        ) {
          const sourceContent =
            extractSourceSection(
              currentUnit.title
            );

          if (sourceContent) {
            currentUnit.content =
              sourceContent;
          }
        }

        units.push(currentUnit);
      }

      currentUnit = {
        anchor: element,
        elements: [element],
        title: text,
        content: text,
        type,
      };

      return;
    }

    /*
     * --------------------------------------------------
     * CONTENT BELONGS TO CURRENT SECTION
     * --------------------------------------------------
     */

    if (currentUnit) {
      currentUnit.elements.push(
        element
      );

      currentUnit.content +=
        `\n\n${text}`;

      return;
    }

    /*
     * --------------------------------------------------
     * CONTENT BEFORE FIRST HEADING
     * --------------------------------------------------
     */

    currentUnit = {
      anchor: element,
      elements: [element],
      title: "Introduction",
      content: text,
      type,
    };
  });

  /*
   * --------------------------------------------------
   * FINAL SECTION
   * --------------------------------------------------
   */
// --------------------------------------------------
// FINAL SECTION
// --------------------------------------------------

const finalUnit = currentUnit as TeachingUnit | null;

if (finalUnit) {
  if (
    finalUnit.content.trim() ===
    finalUnit.title.trim()
  ) {
    const sourceContent =
      extractSourceSection(finalUnit.title);

    if (sourceContent) {
      finalUnit.content = sourceContent;
    }
  }

  // Only add it if it has not already been added.
  const alreadyAdded = units.includes(finalUnit);

  if (!alreadyAdded) {
    units.push(finalUnit);
  }
}

  console.log(
    "📚 LiveTeacher teaching units:",
    units.map((unit) => ({
      title: unit.title,
      type: unit.type,
      contentLength:
        unit.content.length,
      contentPreview:
        unit.content.slice(0, 180),
    }))
  );

  return units;
};

  
  // --------------------------------------------------
  // Highlight current teaching element
  // --------------------------------------------------

  const clearHighlight = () => {
    document
      .querySelectorAll("[data-live-teacher-active='true']")
      .forEach((node) => {
        const el = node as HTMLElement;

        el.removeAttribute("data-live-teacher-active");

        el.style.removeProperty("outline");
        el.style.removeProperty("box-shadow");
        el.style.removeProperty("border-radius");
        el.style.removeProperty("transition");
        el.style.removeProperty("background-color");
      });
  };

  const moveTeacherPointer = (element: HTMLElement | undefined) => {
  if (!element) return;

  const rect = element.getBoundingClientRect();

  const pointerWidth = 34;

  // Prefer placing the teacher hand on the left side
  // of the current learning element.
  let left = rect.left - pointerWidth - 14;

  // If there is not enough room on the left,
  // place it on the right.
  if (left < 10) {
    left = rect.right + 14;
  }

  // Keep pointer inside the viewport.
  left = Math.max(
    10,
    Math.min(left, window.innerWidth - pointerWidth - 10)
  );

  const top = Math.max(
    10,
    Math.min(
      rect.top + rect.height / 2 - 17,
      window.innerHeight - 50
    )
  );

  setPointerPosition({
    top,
    left,
    visible: true,
  });
};

  const highlightElement = (element: HTMLElement | undefined) => {
    if (!element) return;

    clearHighlight();

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Move AI teacher pointer after smooth scrolling settles
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    moveTeacherPointer(element);
  });
});

    element.setAttribute(
      "data-live-teacher-active",
      "true"
    );

    element.style.transition =
      "all 0.4s ease";

    element.style.outline =
      "3px solid rgba(59,130,246,0.45)";

    element.style.boxShadow =
      "0 0 0 8px rgba(59,130,246,0.08)";

    element.style.borderRadius = "8px";

    // Very subtle background emphasis
    element.style.backgroundColor =
      "rgba(59,130,246,0.035)";
  };

  // --------------------------------------------------
  // Voice
  // --------------------------------------------------

  const speakText = (text: string) => {
  if (!voiceEnabledRef.current) return;

  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "code example")
      .replace(/[#*_>`]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance =
      new SpeechSynthesisUtterance(cleanText);

    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
  const next = !voiceEnabledRef.current;

  voiceEnabledRef.current = next;
  setVoiceEnabled(next);

  if (!next) {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    return;
  }

  // Speak a small confirmation immediately after
  // the student's click, helping the browser activate TTS.
  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    const utterance = new SpeechSynthesisUtterance(
      "Voice enabled."
    );

    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
};

  // --------------------------------------------------
  // Type teacher explanation
  // --------------------------------------------------

  const typeText = async (text: string) => {
  setVisibleText("");

  if (!text?.trim()) {
    return true;
  }

  let output = "";

  for (let i = 0; i < text.length; i++) {
  if (stopRef.current) {
    return false;
  }

  if (nextRequestedRef.current) {
    return false;
  }

  // Respect pause button while typing

    // Respect pause button while typing
    while (pauseRef.current && !stopRef.current) {
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );
    }

    if (stopRef.current) {
      return false;
    }

    const character = text[i];

    output += character;

    setVisibleText(output);

    // Natural typing speed
    let delay = 24;

    // Slight pause after commas
    if (character === ",") {
      delay = 140;
    }

    // Natural pause after sentence endings
    if (
      character === "." ||
      character === "!" ||
      character === "?"
    ) {
      delay = 420;
    }

    // Slight pause after colon
    if (character === ":") {
      delay = 260;
    }

    // Slightly longer pause after line breaks
    if (character === "\n") {
      delay = 300;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, delay)
    );
  }

  return true;
};

const startCheckpoint = async (
  title: string
) => {
  setCheckpointAnswer("");
  setCheckpointFeedback("");

  const question =
    `In your own words, what is ${title}?`;

  setCheckpointQuestion(question);

  await recordLearningEvent(
    "QUESTION",
    title,
    question,
    {
      source: "live-teacher-checkpoint",
    }
  );

  setShowCheckpoint(true);
};

const submitCheckpoint = async () => {
  const answer = checkpointAnswer.trim();

  if (!answer) {
    return;
  }

  let result:
    | "CORRECT"
    | "PARTIAL"
    | "INCORRECT" = "PARTIAL";

  let feedback =
    "Your answer has been recorded.";

  // -----------------------------------------
  // AI CHECKPOINT EVALUATION
  // -----------------------------------------

  if (onEvaluateCheckpoint) {
    try {
      const evaluation = await onEvaluateCheckpoint(
        checkpointQuestion,
        answer
      );

      result =
        evaluation?.result || "PARTIAL";

      feedback =
        evaluation?.feedback ||
        feedback;
    } catch (error) {
      console.error(
        "Checkpoint evaluation error:",
        error
      );
    }
  }

  const isCorrect = result === "CORRECT";

  // -----------------------------------------
  // SAVE ANSWER
  // -----------------------------------------

  await recordLearningEvent(
    "ANSWER",
    currentTitle || "Checkpoint",
    answer,
    {
      question: checkpointQuestion,
      source: "live-teacher-checkpoint",
      evaluation: result,
      isCorrect,
    }
  );

  // -----------------------------------------
  // SAVE MISTAKE
  // -----------------------------------------

  if (result === "INCORRECT") {
    await recordLearningEvent(
      "MISTAKE",
      currentTitle || "Checkpoint",
      answer,
      {
        question: checkpointQuestion,
        source: "live-teacher-checkpoint",
        evaluation: result,
      }
    );
  }

  // -----------------------------------------
  // SAVE CORRECTION
  // -----------------------------------------

  if (
    result === "CORRECT" ||
    result === "PARTIAL"
  ) {
    await recordLearningEvent(
      "CORRECTION",
      currentTitle || "Checkpoint",
      feedback,
      {
        question: checkpointQuestion,
        studentAnswer: answer,
        evaluation: result,
        source: "live-teacher-checkpoint",
      }
    );
  }

  setCheckpointFeedback(feedback);
};

const continueAfterCheckpoint = () => {
  checkpointContinueRef.current = true;

  setCompletedCheckpoints((previous) => previous + 1);

  setShowCheckpoint(false);
  setCheckpointAnswer("");
  setCheckpointFeedback("");
};

  // --------------------------------------------------
  // Start live class
  // --------------------------------------------------

  // --------------------------------------------------
  // Smart return-to-learning
  // --------------------------------------------------

  const beginResumeCheck = async () => {
    if (!hasSavedProgress || !resumeTitle) {
      startTeaching();
      return;
    }

    setResumeFeedback("");
    setResumeAnswer("");
    setResumeQuestionIndex(0);
    setResumeAnswers([]);
    setChapterEvaluation("");
    setChapterEvaluationLoading(false);
    setShowResumePrompt(false);
    setShowResumeCheck(true);

    // FAST PATH: show the saved recap immediately.
    const instantRecap =
      resumeInstantRecap ||
      `Welcome back! Last time we were learning "${resumeTitle}". Let's quickly check what you remember before we continue.`;

    setResumeRecap(instantRecap);
    setResumeQuestions([
      `What do you remember about ${resumeTitle}?`,
    ]);
    setResumeLoading(false);

    speakText(instantRecap);

    // BACKGROUND PATH: refine the recap with Gemini/DeepSeek
    // without blocking the student.
    if (onResumeRecap) {
      try {
        const result = await onResumeRecap(resumeTitle);

        if (result?.recap?.trim()) {
          setResumeRecap(result.recap.trim());
        }

        const questions = (result?.questions || [])
          .map((q) => q.trim())
          .filter(Boolean)
          .slice(0, 3);

        if (questions.length) {
          setResumeQuestions(questions);
        }
      } catch (error) {
        console.error("Background resume recap error:", error);
        // Keep the instant recap if AI is slow/unavailable.
      }
    }
  };

  const startResumeListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResumeFeedback("Voice input is not supported in this browser. You can type your answer instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setResumeListening(true);
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setResumeAnswer(transcript.trim());
    };
    recognition.onerror = () => setResumeListening(false);
    recognition.onend = () => setResumeListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error("Resume voice input error:", error);
      setResumeListening(false);
    }
  };

  const submitResumeAnswer = async () => {
    const answer = resumeAnswer.trim();
    const question = resumeQuestions[resumeQuestionIndex];

    if (!answer || !question || resumeLoading) return;

    // IMPORTANT:
    // Do NOT call Gemini/DeepSeek here.
    // Resume answers are collected instantly and evaluated once
    // after the chapter is completed.
    setResumeAnswers((previous) => {
      const withoutCurrent = previous.filter(
        (item) => item.question !== question
      );

      return [
        ...withoutCurrent,
        {
          question,
          answer,
        },
      ];
    });

    setResumeFeedback(
      "✓ Answer saved. We'll evaluate your overall understanding after you complete the chapter."
    );
    setResumeLoading(false);
  };

  const continueResumeCheck = () => {
    if (!resumeFeedback) return;

    if (resumeQuestionIndex < resumeQuestions.length - 1) {
      const nextIndex = resumeQuestionIndex + 1;
      setResumeQuestionIndex(nextIndex);
      setResumeAnswer("");
      setResumeFeedback("");
      speakText(resumeQuestions[nextIndex]);
      return;
    }

    setShowResumeCheck(false);
    setResumeAnswer("");
    setResumeFeedback("");
    startTeaching();
  };

  const loadLearningMemory = async () => {
  if (!userEmail) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/learning-memory?userEmail=${encodeURIComponent(
        userEmail
      )}&courseId=${encodeURIComponent(
        courseId
      )}&chapterId=${encodeURIComponent(
        chapterId
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to load learning memory:",
        await response.text()
      );
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data.memories)) {
      return data.memories;
    }

    return [];
  } catch (error) {
    console.error(
      "Learning memory loading error:",
      error
    );

    return [];
  }
};

const [learningMemory, setLearningMemory] = useState<
  Array<{
    topic: string;
    memoryType: string;
    key: string;
    content: string;
    confidence: number;
    priority: number;
    occurrences: number;
  }>
>([]);

type AdaptiveLevel =
  | "BEGINNER"
  | "DEVELOPING"
  | "CONFIDENT"
  | "MASTERED";

interface AdaptiveProfile {
  level: AdaptiveLevel;
  masteryScore: number;
  strengths: string[];
  weaknesses: string[];
  mistakes: number;
  reviewsNeeded: number;
  preferredStyle:
    | "SIMPLE"
    | "EXAMPLE_FIRST"
    | "DETAILED"
    | "CHALLENGE";
}

const [adaptiveProfile, setAdaptiveProfile] =
  useState<AdaptiveProfile>({
    level: "BEGINNER",
    masteryScore: 0,
    strengths: [],
    weaknesses: [],
    mistakes: 0,
    reviewsNeeded: 0,
    preferredStyle: "SIMPLE",
  });

  const buildAdaptiveProfile = (
  topic?: string
): AdaptiveProfile => {
  const normalizedTopic =
    topic?.trim().toLowerCase();

  const topicMemory = normalizedTopic
    ? learningMemory.filter(
        (item) =>
          item.topic.trim().toLowerCase() ===
          normalizedTopic
      )
    : learningMemory;

  const strengths = topicMemory.filter(
    (item) =>
      item.memoryType === "STRENGTH" ||
      item.memoryType === "MASTERY"
  );

  const weaknesses = topicMemory.filter(
    (item) =>
      item.memoryType === "STRUGGLE" ||
      item.memoryType === "MISTAKE" ||
      item.memoryType === "REVIEW"
  );

  const mistakes = topicMemory.filter(
    (item) =>
      item.memoryType === "MISTAKE"
  );

  const reviews = topicMemory.filter(
    (item) =>
      item.memoryType === "REVIEW"
  );

  const confidenceValues = topicMemory
    .map((item) => item.confidence)
    .filter(
      (value) =>
        typeof value === "number"
    );

  const masteryScore =
    confidenceValues.length > 0
      ? Math.round(
          confidenceValues.reduce(
            (sum, value) => sum + value,
            0
          ) / confidenceValues.length
        )
      : 0;

  let level: AdaptiveLevel = "BEGINNER";

  if (masteryScore >= 85) {
    level = "MASTERED";
  } else if (masteryScore >= 70) {
    level = "CONFIDENT";
  } else if (masteryScore >= 40) {
    level = "DEVELOPING";
  }

  let preferredStyle:
    | "SIMPLE"
    | "EXAMPLE_FIRST"
    | "DETAILED"
    | "CHALLENGE" =
    "SIMPLE";

  if (weaknesses.length >= 2) {
    preferredStyle = "EXAMPLE_FIRST";
  }

  if (reviews.length >= 2) {
    preferredStyle = "DETAILED";
  }

  if (
    masteryScore >= 80 &&
    weaknesses.length === 0
  ) {
    preferredStyle = "CHALLENGE";
  }

  return {
    level,
    masteryScore,
    strengths: strengths
      .slice(0, 5)
      .map((item) => item.content),

    weaknesses: weaknesses
      .slice(0, 5)
      .map((item) => item.content),

    mistakes: mistakes.length,
    reviewsNeeded: reviews.length,
    preferredStyle,
  };
};

useEffect(() => {
  const profile =
    buildAdaptiveProfile(
      activeTopic
    );

  setAdaptiveProfile(profile);

  console.log(
    "🧠 PHASE 14 Adaptive Profile:",
    profile
  );
}, [
  learningMemory,
  activeTopic,
]);

const saveLearningMemory = async ({
  topic,
  memoryType,
  key,
  content,
  confidence = 50,
  priority = 1,
}: {
  topic: string;
  memoryType:
    | "STRUGGLE"
    | "STRENGTH"
    | "PREFERENCE"
    | "MISTAKE"
    | "MASTERY"
    | "REVIEW";
  key: string;
  content: string;
  confidence?: number;
  priority?: number;
}) => {
  if (!courseId || !chapterId) {
    return;
  }

  try {
    const response = await fetch(
      "/api/learning-memory",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          chapterId,
          topic,
          memoryType,
          learningMemory,
          key,
          content,
          confidence,
          priority,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to save learning memory:",
        await response.text()
      );

      return;
    }

    const data = await response.json();

    if (data.memory) {
      setLearningMemory((previous) => {
        const withoutCurrent = previous.filter(
          (item) =>
            !(
              item.topic === data.memory.topic &&
              item.memoryType === data.memory.memoryType &&
              item.key === data.memory.key
            )
        );

        return [
          ...withoutCurrent,
          data.memory,
        ];
      });
    }
  } catch (error) {
    console.error(
      "Learning memory save error:",
      error
    );
  }
};

useEffect(() => {
  let cancelled = false;

  const refreshLearningMemory = async () => {
    const memories = await loadLearningMemory();

    if (!cancelled) {
      setLearningMemory(memories);
    }
  };

  void refreshLearningMemory();

  return () => {
    cancelled = true;
  };
}, [courseId, chapterId]);


const buildLearningMemoryContext = (
  topic?: string
) => {
  if (!learningMemory.length) {
    return "";
  }

  const topicMemory = topic
  ? learningMemory.filter(
      (item) =>
        item.topic.trim().toLowerCase() ===
        topic.trim().toLowerCase()
    )
  : learningMemory;

  const strengths = topicMemory.filter(
    (item) =>
      item.memoryType === "STRENGTH" ||
      item.memoryType === "MASTERY"
  );

  const struggles = topicMemory.filter(
    (item) =>
      item.memoryType === "STRUGGLE" ||
      item.memoryType === "MISTAKE" ||
      item.memoryType === "REVIEW"
  );

  return `
STUDENT LEARNING MEMORY:

STRENGTHS:
${
  strengths.length
    ? strengths
        .slice(0, 8)
        .map(
          (item) =>
            `- ${item.topic}: ${item.content}`
        )
        .join("\n")
    : "- No recorded strengths yet."
}

AREAS NEEDING IMPROVEMENT:
${
  struggles.length
    ? struggles
        .slice(0, 8)
        .map(
          (item) =>
            `- ${item.topic}: ${item.content}`
        )
        .join("\n")
    : "- No recorded difficulties yet."
}

TEACHING INSTRUCTIONS:

Use this information to personalize the teaching.

If the student is strong in a topic:
- avoid unnecessary repetition
- gradually increase difficulty

If the student struggles with a topic:
- slow down
- explain using another approach
- use a simpler example
- check understanding again

If the student repeatedly makes a mistake:
- address the underlying misunderstanding
- provide a targeted explanation

Never tell the student that you are using learning memory.

Do not say:
"According to your learning memory..."

Adapt naturally.
`;
};

  const recordLearningEvent = async (
  eventType: string,
  topic: string,
  content: string,
  metadata?: Record<string, unknown>
) => {
  if (
    !userEmail ||
    !courseId ||
    !chapterId ||
    !topic ||
    !content
  ) {
    return;
  }

  try {
    const response = await fetch("/api/learning-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail,
        courseId,
        chapterId,
        topic,
        eventType,
        content,
        metadata: {
          course,
          chapterTitle,
          ...metadata,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        "Learning event failed:",
        await response.text()
      );
    }
  } catch (error) {
    console.error(
      "Learning event recording error:",
      error
    );
  }
};

  const startTeaching = async () => {
    const units = collectUnits();

    if (!units.length) {
      setTeacherText(
        "I couldn't find any chapter content to teach."
      );
      return;
    }

    unitsRef.current = units;

    setTotalUnits(units.length);

    

    stopRef.current = false;
pauseRef.current = false;
nextRequestedRef.current = false;

checkpointContinueRef.current = false;

setShowCheckpoint(false);
setCheckpointAnswer("");
setCheckpointFeedback("");
setCheckpointQuestion("");

    const startIndex =
  hasSavedProgress && resumeIndex >= 0
    ? resumeIndex
    : 0;

setCurrentIndex(startIndex);
setTeacherText("");
setVisibleText("");
setCurrentTitle("");

setCompletedUnits(
  hasSavedProgress
    ? Math.min(resumeIndex, units.length)
    : 0
);

setCompletedCheckpoints(0);

setShowResumePrompt(false);

    setState("READING");

    for (
  let i = startIndex;
  i < units.length;
  i++
) {
      if (stopRef.current) break;

      while (
        pauseRef.current &&
        !stopRef.current
      ) {
        setState("PAUSED");

        await new Promise((resolve) =>
          setTimeout(resolve, 100)
        );
      }

      if (stopRef.current) break;

      setState("READING");

setCurrentIndex(i);

const unit = units[i];

const element = unit.anchor;

highlightElement(element);

const title = unit.title;

const text = unit.content;

setCurrentTitle(title);

onLessonStart?.(title);

      try {
  // Give the browser a moment to finish scrolling
  await new Promise((resolve) =>
    setTimeout(resolve, 700)
  );

  if (stopRef.current) break;

  // Teacher is preparing the explanation
  setState("THINKING");

  await new Promise((resolve) =>
    setTimeout(resolve, 700)
  );

  if (stopRef.current) {
    break;
  }

  const topic =
  activeTopic || unit.title;

const adaptive =
  buildAdaptiveProfile(topic);

const adaptiveContext = `
PHASE 14 — ADAPTIVE TEACHER PROFILE

CURRENT TOPIC:
${topic}

STUDENT LEVEL:
${adaptive.level}

MASTERY SCORE:
${adaptive.masteryScore}/100

STRENGTHS:
${
  adaptive.strengths.length
    ? adaptive.strengths
        .map((item) => `- ${item}`)
        .join("\n")
    : "- None recorded yet."
}

WEAKNESSES:
${
  adaptive.weaknesses.length
    ? adaptive.weaknesses
        .map((item) => `- ${item}`)
        .join("\n")
    : "- None recorded yet."
}

MISTAKES:
${adaptive.mistakes}

REVISION ITEMS:
${adaptive.reviewsNeeded}

TEACHING STYLE:
${adaptive.preferredStyle}

ADAPTIVE RULES:

If BEGINNER:
- explain slowly
- use very simple language
- introduce one idea at a time
- use a small example

If DEVELOPING:
- explain clearly
- connect the concept to the previous idea
- use one practical example
- ask for understanding when appropriate

If CONFIDENT:
- reduce repetition
- explain more efficiently
- introduce a slightly harder example

If MASTERED:
- do not repeat basic material unnecessarily
- use a challenging practical example
- connect this concept to real programming

If the student has weaknesses:
- slow down
- use another explanation
- use an easier example
- focus only on the current topic

If the student has repeated mistakes:
- identify the underlying misunderstanding
- explain that misunderstanding directly

IMPORTANT:
Never mention this adaptive profile to the student.
Never say "according to your learning memory".
Adapt naturally.
`;

const explanation =
  await onExplain(
    `${unit.content}

CONTENT TYPE: ${unit.type}`,
    unit.title,
    `
${buildLearningMemoryContext(topic)}

${adaptiveContext}
`
  );

  
if (stopRef.current) {
  break;
}

await recordLearningEvent(
  "PRACTICE",
  title,
  `Completed learning unit: ${title}`,
  {
    source: "live-teacher",
    unitIndex: i,
    totalUnits: units.length,
  }
);

onLessonComplete?.(title);

  // Teacher starts explaining
setState("EXPLAINING");

setTeacherText(explanation);

// 🔊 Speak automatically
speakText(explanation);

// Type the explanation naturally
const completed = await typeText(explanation);

if (nextRequestedRef.current) {
  nextRequestedRef.current = false;
  continue;
}

if (!completed) {
  break;
}

if (nextRequestedRef.current) {
  nextRequestedRef.current = false;
  continue;
}

if (!completed) {
  break;
}

setCompletedUnits((previous) => {
  const nextCompleted = previous + 1;

  saveTeachingProgress(
    i + 1,
    title,
    nextCompleted,
    explanation
  );

  return nextCompleted;
});

onLessonComplete?.(title);

// Teacher pauses so the student can absorb the explanation
setState("WAITING");

await new Promise((resolve) =>
  setTimeout(resolve, 1400)
);

// 🧠 Checkpoint after every 3 teaching units
const shouldCheckpoint =
  (i + 1) % 3 === 0 &&
  i < units.length - 1;

if (shouldCheckpoint) {
  checkpointContinueRef.current = false;

  await startCheckpoint(title);

  while (
    !checkpointContinueRef.current &&
    !stopRef.current
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, 200)
    );
  }

  if (stopRef.current) {
    break;
  }
}

      } catch (error) {
        console.error(
          "Live Teacher explanation error:",
          error
        );

        const fallback =
          "Let's understand this section step by step. Focus on the highlighted part first.";

        setTeacherText(fallback);

        speakText(fallback);

        await typeText(fallback);
      }
    }

    if (!stopRef.current) {
  clearHighlight();

  setPointerPosition({
    top: 0,
    left: 0,
    visible: false,
  });

  setState("COMPLETED");
  setCurrentTitle("Chapter completed");

  if (typeof window !== "undefined") {
  localStorage.removeItem(progressStorageKey);
}

setHasSavedProgress(false);
setResumeIndex(0);
setResumeTitle("");

  onChapterComplete?.();

    // Evaluate all resume answers once, AFTER teaching is complete.
    // This is intentionally non-blocking so chapter completion appears immediately.
    if (onEvaluateChapter && resumeAnswers.length > 0) {
      const answersForEvaluation = [...resumeAnswers];

      setChapterEvaluationLoading(true);

      void onEvaluateChapter(answersForEvaluation)
        .then((result) => {
          setChapterEvaluation(
            result?.trim() ||
              "Chapter evaluation completed. Your overall performance has been recorded."
          );
        })
        .catch((error) => {
          console.error("Chapter evaluation error:", error);
          setChapterEvaluation(
            "Your chapter is complete. Overall performance evaluation could not be generated right now."
          );
        })
        .finally(() => {
          setChapterEvaluationLoading(false);
        });
    }
}
  };

  // --------------------------------------------------
  // Stop
  // --------------------------------------------------

  const stopTeaching = () => {
    if (
  unitsRef.current.length > 0 &&
  currentIndex < unitsRef.current.length
) {
  saveTeachingProgress(
    currentIndex,
    currentTitle || unitsRef.current[currentIndex]?.title || "",
    completedUnits,
    teacherText || visibleText
  );
}


    stopRef.current = true;
    pauseRef.current = false;

    clearHighlight();

    setPointerPosition({
  top: 0,
  left: 0,
  visible: false,
});

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setState("IDLE");
    setVisibleText("");
    setTeacherText("");
    setCurrentIndex(0);
    setCurrentTitle("");
  };

  const nextTeachingUnit = () => {
  if (state === "IDLE" || state === "COMPLETED") {
    return;
  }

  nextRequestedRef.current = true;
  pauseRef.current = false;

  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }

  setState("READING");
};

  // --------------------------------------------------
  // Pause
  // --------------------------------------------------

  const togglePause = () => {
    pauseRef.current =
      !pauseRef.current;

    if (pauseRef.current) {
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.pause();
      }

      setState("PAUSED");
    } else {
      if (
  voiceEnabledRef.current &&
  typeof window !== "undefined" &&
  "speechSynthesis" in window
) {
  window.speechSynthesis.resume();
}

      setState("READING");
    }
  };

  useEffect(() => {
  const updatePointerOnScroll = () => {
    const unit =
      unitsRef.current[currentIndex];

    if (!unit || !pointerPosition.visible) {
      return;
    }

    moveTeacherPointer(unit.anchor);
  };

  window.addEventListener(
    "scroll",
    updatePointerOnScroll,
    true
  );

  window.addEventListener(
    "resize",
    updatePointerOnScroll
  );

  return () => {
    window.removeEventListener(
      "scroll",
      updatePointerOnScroll,
      true
    );

    window.removeEventListener(
      "resize",
      updatePointerOnScroll
    );
  };
}, [
  currentIndex,
  pointerPosition.visible
]);

  // --------------------------------------------------
  // Cleanup
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      stopRef.current = true;

      clearHighlight();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --------------------------------------------------
  // Progress
  // --------------------------------------------------

  const progress =
    totalUnits > 0
      ? Math.round(
          ((currentIndex + 1) /
            totalUnits) *
            100
        )
      : 0;

  const isRunning =
  state === "READING" ||
  state === "THINKING" ||
  state === "EXPLAINING" ||
  state === "WAITING" ||
  state === "PAUSED";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
  <>
    {/* ========================================= */}
    {/* AI TEACHER POINTER */}
    {/* ========================================= */}

    {pointerPosition.visible && (
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: pointerPosition.top,
          left: pointerPosition.left,
          transition:
            "top 0.45s cubic-bezier(0.22, 1, 0.36, 1), left 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="relative flex items-center justify-center">
          
          {/* soft glow */}
          <div className="absolute w-12 h-12 rounded-full bg-blue-400/20 animate-pulse" />

          {/* teacher hand */}
          <div className="relative w-9 h-9 rounded-full bg-white border border-blue-200 shadow-lg flex items-center justify-center text-xl">
            👆
          </div>

        </div>
      </div>
    )}

    
    <div className="sticky top-3 z-40 mb-5">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-md shadow-blue-500/10 overflow-visible">

        {/* ================= HEADER ================= */}

        <div className="relative px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles size={17} />
            </div>

            <div className="min-w-0">

              <div className="text-[9px] uppercase tracking-widest font-bold text-blue-100">
                Live Teacher
              </div>

              <div className="text-sm font-extrabold truncate">
                {chapterTitle}
              </div>

            </div>

          </div>

          {/* Controls */}

          <div className="flex items-center gap-1.5 shrink-0">

            {state === "IDLE" && hasSavedProgress && (
  <div className="absolute top-full right-0 mt-3 w-80 rounded-2xl border border-blue-200 bg-white shadow-xl p-4 z-50">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        🧠
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-extrabold text-slate-800">
          Welcome back!
        </div>

        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          You stopped while learning:
        </p>

        <p className="text-[11px] font-bold text-blue-600 mt-1 truncate">
          {resumeTitle}
        </p>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              void beginResumeCheck();
            }}
            className="flex-1 px-3 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700"
          >
            ▶ Resume
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                progressStorageKey
              );

              setHasSavedProgress(false);
              setResumeIndex(0);
              setResumeTitle("");
              setResumeInstantRecap("");
              setShowResumePrompt(false);
              setShowResumeCheck(false);
              startTeaching();
            }}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold hover:bg-slate-200"
          >
            ↻ Start Again
          </button>
        </div>
      </div>
    </div>
  </div>
)}

            {showResumeCheck && (
              <div className="absolute top-full right-0 mt-3 w-[min(92vw,420px)] rounded-2xl border border-blue-200 bg-white shadow-2xl p-4 z-50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">🧠</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-slate-800">Quick recap before we continue</div>
                    <div className="text-[10px] text-blue-600 font-bold mt-1 truncate">Resume point: {resumeTitle}</div>
                  </div>
                </div>

                {resumeLoading && !resumeFeedback ? (
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
                    AI Teacher is refining your recap in the background...
                  </div>
                ) : (
                  <>
                    <div className="mt-3 rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {resumeRecap}
                    </div>

                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <div className="text-[9px] uppercase tracking-wider font-black text-amber-700 mb-1">
                        Quick Question {resumeQuestionIndex + 1}/{resumeQuestions.length}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                        {resumeQuestions[resumeQuestionIndex]}
                      </div>

                      <textarea
                        value={resumeAnswer}
                        onChange={(e) => setResumeAnswer(e.target.value)}
                        placeholder="Type your answer or use the microphone..."
                        className="mt-2 w-full min-h-[72px] rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-amber-400 resize-none"
                      />

                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={startResumeListening}
                          disabled={resumeListening || resumeLoading}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border ${resumeListening ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                        >
                          {resumeListening ? "🎙 Listening..." : "🎤 Speak"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void submitResumeAnswer()}
                          disabled={!resumeAnswer.trim() || resumeLoading}
                          className="flex-1 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                          {resumeLoading ? "Checking..." : "Check Answer"}
                        </button>
                      </div>

                      {resumeFeedback && (
                        <div className="mt-3 rounded-xl bg-white border border-emerald-200 p-3">
                          <div className="text-xs text-emerald-700 font-semibold leading-relaxed whitespace-pre-wrap">
                            ✓ {resumeFeedback}
                          </div>
                          <button
                            type="button"
                            onClick={continueResumeCheck}
                            className="mt-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            {resumeQuestionIndex < resumeQuestions.length - 1 ? "Next Question →" : "Resume Live Teaching →"}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Start */}

            {state === "IDLE" && !hasSavedProgress && !showResumeCheck && (

              <button
                type="button"
                onClick={startTeaching}
                className="px-3.5 py-2 rounded-xl bg-white text-blue-700 text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-50 transition"
              >
                <Play
                  size={13}
                  fill="currentColor"
                />
                Start
              </button>
            )}

            {/* Running */}

            {isRunning && (
              <>

              {/* Next */}

<button
  type="button"
  onClick={nextTeachingUnit}
  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
  title="Next section"
>
  <ChevronRight size={14} />
</button>


                {/* Pause */}

                <button
                  type="button"
                  onClick={togglePause}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                  title={
                    state === "PAUSED"
                      ? "Resume"
                      : "Pause"
                  }
                >
                  {state === "PAUSED" ? (
                    <Play
                      size={14}
                      fill="currentColor"
                    />
                  ) : (
                    <Pause size={14} />
                  )}
                </button>

                {/* Voice */}

                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                    voiceEnabled
                      ? "bg-white text-blue-700"
                      : "bg-white/15 hover:bg-white/25"
                  }`}
                  title={
                    voiceEnabled
                      ? "Turn voice off"
                      : "Turn voice on"
                  }
                >
                  {voiceEnabled ? (
                    <Volume2 size={14} />
                  ) : (
                    <VolumeX size={14} />
                  )}
                </button>

                {/* Stop */}

                <button
                  type="button"
                  onClick={stopTeaching}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-red-500/30 flex items-center justify-center transition"
                  title="Stop"
                >
                  <Square
                    size={13}
                    fill="currentColor"
                  />
                </button>
              </>
            )}

            {/* Replay */}

            {state === "COMPLETED" && (
              <>
                <button
                  type="button"
                  onClick={startTeaching}
                  className="px-3.5 py-2 rounded-xl bg-white text-blue-700 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Play
                    size={13}
                    fill="currentColor"
                  />
                  Replay
                </button>

                <button
                  type="button"
                  onClick={toggleVoice}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center"
                  title={
                    voiceEnabled
                      ? "Turn voice off"
                      : "Turn voice on"
                  }
                >
                  {voiceEnabled ? (
                    <Volume2 size={14} />
                  ) : (
                    <VolumeX size={14} />
                  )}
                </button>
              </>
            )}

          </div>
        </div>

        {/* ================= PROGRESS ================= */}

        {state !== "IDLE" && (
          <div className="h-1 bg-blue-100">

            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>
        )}

        {/* ================= TEACHER AREA ================= */}

        {state !== "IDLE" && (
          <div className="px-4 py-3">

            <div className="flex items-start gap-3">

              {/* Teacher */}

              <div className="relative shrink-0">

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm shadow-sm">
                  👨‍🏫
                </div>

                {(state === "READING" ||
  state === "THINKING" ||
  state === "EXPLAINING" ||
  state === "WAITING") && (
                  <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                )}

              </div>

              {/* Text */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2 mb-0.5">

                  <span className="text-[11px] font-extrabold text-slate-800">
                    AI Teacher
                  </span>

                  {state === "READING" && (
  <span className="text-[9px] text-blue-600 font-semibold">
    Reading this section...
  </span>
)}

                    {state === "THINKING" && (
  <span className="text-[9px] text-amber-600 font-semibold">
    Preparing an explanation...
  </span>
)}

                  {state === "EXPLAINING" && (
  <span className="text-[9px] text-purple-600 font-semibold">
    Teaching this section...
  </span>
)}

                    {state === "WAITING" && (
  <span className="text-[9px] text-emerald-600 font-semibold">
    Letting you absorb this...
  </span>
)}
                    

                  {state === "PAUSED" && (
                    <span className="text-[9px] text-amber-600 font-semibold">
                      Paused
                    </span>
                  )}

                  {state === "COMPLETED" && (
                    <span className="text-[9px] text-emerald-600 font-semibold">
                      Completed
                    </span>
                  )}

                </div>

                {currentTitle && (
                  <div className="text-[10px] font-bold text-blue-600 mb-1.5 flex items-center gap-1">

                    <ChevronRight size={11} />

                    <span className="truncate">
                      {currentTitle}
                    </span>

                    <span className="text-slate-400 font-normal ml-auto">
                      {currentIndex + 1}/{totalUnits}
                    </span>

                  </div>
                )}

                <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/40 overflow-hidden">

  {/* Explanation Header */}
  <div className="px-3 py-2 border-b border-blue-100 bg-white/70 flex items-center gap-2">

    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
      <Sparkles
        size={12}
        className="text-blue-600"
      />
    </div>

    <div>
      <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">
        AI Explanation
      </div>

      <div className="text-[9px] text-slate-400">
        Teaching the current section
      </div>
    </div>

  </div>


  {/* Explanation Content */}
  <div className="px-3 py-3">

    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
      {visibleText ||
        teacherText ||
        "Let's learn this together."}
    </div>

  </div>

  {showCheckpoint && (
  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
        🧠
      </div>

      <div>
        <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
          Quick Checkpoint
        </div>

        <div className="text-[9px] text-amber-600">
          Let's check your understanding
        </div>
      </div>
    </div>

    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
      {checkpointQuestion}
    </p>

    <textarea
      value={checkpointAnswer}
      onChange={(e) =>
        setCheckpointAnswer(e.target.value)
      }
      placeholder="Write your answer..."
      className="mt-3 w-full min-h-[80px] rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 resize-none"
    />

    {!checkpointFeedback ? (
      <button
        type="button"
        onClick={submitCheckpoint}
        disabled={!checkpointAnswer.trim()}
        className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold disabled:opacity-50"
      >
        Check My Answer
      </button>
    ) : (
      <div className="mt-3 space-y-2">
        <div className="text-xs text-emerald-700 font-semibold">
          ✓ {checkpointFeedback}
        </div>

        <button
          type="button"
          onClick={continueAfterCheckpoint}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
        >
          Continue Teaching →
        </button>
      </div>
    )}

  </div>
)}

</div>

              </div>

              {state === "COMPLETED" && (
  <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-4">

    <div className="flex items-start gap-3">

      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">
        🎓
      </div>

      <div className="min-w-0 flex-1">

        <div className="text-sm font-black text-slate-900">
          Chapter Complete
        </div>

        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
          Excellent work! You completed the live teaching session
          for this chapter.
        </p>

      </div>

    </div>

    <div className="mt-4 grid grid-cols-2 gap-2">

      <div className="rounded-xl bg-white border border-emerald-100 p-3">
        <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
          Sections Taught
        </div>

        <div className="text-lg font-black text-emerald-600 mt-1">
          {completedUnits}/{totalUnits}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-blue-100 p-3">
        <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
          Checkpoints
        </div>

        <div className="text-lg font-black text-blue-600 mt-1">
          {completedCheckpoints}
        </div>
      </div>

    </div>

    {(chapterEvaluationLoading || chapterEvaluation) && (
      <div className="mt-3 rounded-xl bg-white/90 border border-blue-100 px-3 py-3">
        <div className="text-[9px] uppercase tracking-wider font-black text-blue-600">
          Overall AI Evaluation
        </div>

        {chapterEvaluationLoading ? (
          <p className="text-[10px] text-slate-500 mt-1">
            Reviewing your answers in the background...
          </p>
        ) : (
          <p className="text-[10px] text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
            {chapterEvaluation}
          </p>
        )}
      </div>
    )}

    <div className="mt-3 rounded-xl bg-white/80 border border-slate-200 px-3 py-2">

      <div className="flex items-center gap-2">

        <span className="w-2 h-2 rounded-full bg-emerald-500" />

        <span className="text-[10px] font-bold text-slate-600">
          Live teaching coverage: 100%
        </span>

      </div>

      <p className="text-[9px] text-slate-400 mt-1">
        Mastery will be calculated from your learning performance
        and assessments.
      </p>

    </div>

  </div>
)}

              {/* Voice status */}

              <div className="shrink-0 pt-1">

                {voiceEnabled ? (
                  <Volume2
                    size={14}
                    className="text-blue-500"
                  />
                ) : (
                  <VolumeX
                    size={14}
                    className="text-slate-300"
                  />
                )}

              </div>

            </div>

          </div>
        )}

            </div>
    </div>
  </>
  );
});

export default LiveTeacher;
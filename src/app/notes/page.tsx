"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VisualNoteRenderer from "@/components/notes/VisualNoteRenderer";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Lightbulb,
  MessageCircleQuestion,
  Search,
  Sparkles,
  Target,
  AlertTriangle,
  Code2,
  Layers3,
  Palette,
  Brain,
  Dumbbell,
  Pin,
  Trash2,
  RefreshCw,
  Loader2,
    Bot,
} from "lucide-react";

type Note = {
  id: string;
  courseId: string;
  chapterId: string;
  topic: string;
  title: string;
  type: string;
  content: string;
  metadata?: string | null;
  importance: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;

  course?: {
    id: string;
    title: string;
    language: string;
  };

  chapter?: {
    id: string;
    title: string;
    orderNumber: number;
  };
};

const NOTE_TYPES = [
  "EXPLANATION",
  "EXAMPLE",
  "QUESTION",
  "CORRECTION",
  "CODE",
  "VISUAL",
  "TIP",
  "MISTAKE",
  "PRACTICE",
];

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [explainingNote, setExplainingNote] = useState<string | null>(null);
const [explainedNote, setExplainedNote] = useState<string | null>(null);
const [explanation, setExplanation] = useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notes", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load notes.");
      }

      setNotes(data.notes || []);
    } catch (err) {
      console.error("Notes loading error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load your notes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const chapters = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
        orderNumber: number;
        courseTitle: string;
        language: string;
        notes: Note[];
      }
    >();

    for (const note of notes) {
      if (!note.chapterId) continue;

      const existing = map.get(note.chapterId);

      if (existing) {
        existing.notes.push(note);
      } else {
        map.set(note.chapterId, {
          id: note.chapterId,
          title: note.chapter?.title || "Untitled Chapter",
          orderNumber: note.chapter?.orderNumber ?? 0,
          courseTitle: note.course?.title || "Course",
          language: note.course?.language || "unknown",
          notes: [note],
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => a.orderNumber - b.orderNumber
    );
  }, [notes]);

  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return chapters;
    }

    return chapters.filter((chapter) => {
      if (chapter.title.toLowerCase().includes(query)) {
        return true;
      }

      return chapter.notes.some(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.topic.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    });
  }, [chapters, searchQuery]);

  useEffect(() => {
    if (!selectedChapter && chapters.length > 0) {
      setSelectedChapter(chapters[0].id);
    }

    if (
      selectedChapter &&
      chapters.length > 0 &&
      !chapters.some((chapter) => chapter.id === selectedChapter)
    ) {
      setSelectedChapter(chapters[0].id);
    }
  }, [chapters, selectedChapter]);

  const selected = chapters.find(
    (chapter) => chapter.id === selectedChapter
  );

  const completedChapterIds = new Set(
    notes
      .filter((note) => {
        const text = `${note.title} ${note.content}`.toLowerCase();

        return (
          note.type === "CORRECTION" ||
          note.type === "PRACTICE" ||
          text.includes("mastered")
        );
      })
      .map((note) => note.chapterId)
  );

  const completedChapters = completedChapterIds.size;

  const totalQuestions = notes.filter(
    (note) =>
      note.type === "QUESTION" ||
      note.type === "CORRECTION"
  ).length;

  const totalConcepts = notes.filter(
    (note) =>
      note.type === "EXPLANATION" ||
      note.type === "TIP"
  ).length;

  const learningProgress =
    chapters.length > 0
      ? Math.round((completedChapters / chapters.length) * 100)
      : 0;


  
  async function explainNote(note: Note) {
  try {
    setExplainingNote(note.id);
    setExplainedNote(null);
    setExplanation("");

    const response = await fetch("/api/notes/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        noteId: note.id,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Failed to explain this note."
      );
    }

    setExplainedNote(note.id);
    setExplanation(data.explanation || "");
  } catch (err) {
    console.error("Explain note error:", err);

    alert(
      err instanceof Error
        ? err.message
        : "Failed to explain this note."
    );
  } finally {
    setExplainingNote(null);
  }
}    

  async function deleteNote(id: string) {
    const confirmed = window.confirm(
      "Delete this learning note? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete note.");
      }

      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Delete note error:", err);
      alert(
        err instanceof Error ? err.message : "Failed to delete note."
      );
    } finally {
      setDeleting(null);
    }
  }

  const language =
    selected?.language ||
    notes[0]?.course?.language ||
    "python";

  const languageLabel =
    language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-900">
      {/* HEADER */}
      <header className="h-[76px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen size={21} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600">
                KnowledgeStream AI
              </p>

              <h1 className="text-lg font-black tracking-tight">
                My Learning Notes
              </h1>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center w-[300px] h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 gap-2">
          <Search size={16} className="text-slate-400 shrink-0" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your notes..."
            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto p-5 lg:p-8">
        {/* TITLE */}
        <section className="mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold mb-3">
                <Sparkles size={13} />
                YOUR PERSONAL KNOWLEDGE BOOK
              </div>

              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
                Everything you learn,
                <span className="text-blue-600"> remembered.</span>
              </h2>

              <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-6">
                Your explanations, questions, examples, mistakes and important
                learning moments are stored here automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadNotes}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={() =>
                  router.push(
                    `/courses/${language}/chapter/${selected?.orderNumber ?? 0}`
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-sm"
              >
                Continue Learning
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-bold">Unable to load notes</div>
            <div className="mt-1">{error}</div>
          </div>
        )}

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard
            icon={<BookOpen size={18} />}
            label="Chapters With Notes"
            value={`${chapters.length}`}
            description="Chapters you've started"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<FileText size={18} />}
            label="Notes Collected"
            value={notes.length.toString()}
            description="Learning moments saved"
            iconClass="bg-purple-50 text-purple-600"
          />

          <StatCard
            icon={<MessageCircleQuestion size={18} />}
            label="Questions"
            value={totalQuestions.toString()}
            description="Things you explored"
            iconClass="bg-red-50 text-red-600"
          />

          <StatCard
            icon={<Target size={18} />}
            label="Learning Progress"
            value={`${learningProgress}%`}
            description={`${totalConcepts} concepts captured`}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* LOADING */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Loader2
              size={30}
              className="animate-spin mx-auto text-blue-600"
            />

            <p className="font-bold mt-4">
              Loading your learning notes...
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Fetching your personal knowledge book.
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && notes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <BookOpen size={28} />
            </div>

            <h3 className="text-xl font-black mt-5">
              Your knowledge book is empty
            </h3>

            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-6">
              Start learning with CodeXAI Mentor. Important explanations,
              examples, questions and corrections will appear here as your
              learning journey grows.
            </p>

            <button
              onClick={() => router.push("/courses/python/chapter/0")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              Start Learning
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && notes.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6">
            {/* COURSE NAVIGATION */}
            <aside className="bg-white border border-slate-200 rounded-2xl p-4 h-fit shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                    My Course
                  </p>

                  <h3 className="text-sm font-black mt-1">
                    {chapters[0]?.courseTitle || "Learning Course"}
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Code2 size={17} />
                </div>
              </div>

              <div className="space-y-2">
                {filteredChapters.map((chapter) => {
                  const active = selectedChapter === chapter.id;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        active
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            completedChapterIds.has(chapter.id)
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {completedChapterIds.has(chapter.id) ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Layers3 size={16} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                            Chapter {chapter.orderNumber}
                          </p>

                          <p
                            className={`text-xs font-bold leading-5 mt-0.5 ${
                              active
                                ? "text-blue-800"
                                : "text-slate-700"
                            }`}
                          >
                            {chapter.title}
                          </p>

                          <div className="mt-2">
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  completedChapterIds.has(chapter.id)
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                                }`}
                                style={{
                                  width: completedChapterIds.has(
                                    chapter.id
                                  )
                                    ? "100%"
                                    : "35%",
                                }}
                              />
                            </div>

                            <p className="text-[9px] text-slate-400 mt-1">
                              {chapter.notes.length} note
                              {chapter.notes.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredChapters.length === 0 && (
                  <div className="text-center py-6">
                    <Search
                      size={20}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-xs text-slate-400 mt-2">
                      No matching chapters
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* CHAPTER */}
            <section className="min-w-0">
              {selected && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* HEADER */}
                  <div className="p-6 lg:p-8 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                            {languageLabel}
                          </span>

                          <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold">
                            Chapter {selected.orderNumber}
                          </span>
                        </div>

                        <h3 className="text-2xl lg:text-3xl font-black tracking-tight">
                          {selected.title}
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                          Your real learning record for this chapter.
                        </p>
                      </div>

                      <div
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${
                          completedChapterIds.has(selected.id)
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {completedChapterIds.has(selected.id) ? (
                          <>
                            <CheckCircle2 size={15} />
                            Learning Complete
                          </>
                        ) : (
                          <>
                            <Brain size={15} />
                            Learning
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY */}
                  <div className="p-6 lg:p-8 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-100">
                    <MiniStat
                      icon={<FileText size={16} />}
                      value={selected.notes.length}
                      label="Notes"
                      className="text-purple-600 bg-purple-50"
                    />

                    <MiniStat
                      icon={<MessageCircleQuestion size={16} />}
                      value={
                        selected.notes.filter(
                          (note) => note.type === "QUESTION"
                        ).length
                      }
                      label="Questions"
                      className="text-red-600 bg-red-50"
                    />

                    <MiniStat
                      icon={<Lightbulb size={16} />}
                      value={
                        selected.notes.filter(
                          (note) =>
                            note.type === "EXPLANATION" ||
                            note.type === "TIP"
                        ).length
                      }
                      label="Concepts"
                      className="text-amber-600 bg-amber-50"
                    />

                    <MiniStat
                      icon={<Dumbbell size={16} />}
                      value={
                        selected.notes.filter(
                          (note) => note.type === "PRACTICE"
                        ).length
                      }
                      label="Practice"
                      className="text-blue-600 bg-blue-50"
                    />
                  </div>

                  {/* NOTES */}
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                          Personal Notes
                        </p>

                        <h4 className="text-lg font-black mt-1">
                          What you learned
                        </h4>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/courses/${selected.language}/chapter/${selected.orderNumber}`
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                      >
                        Open Chapter
                        <ChevronRight size={15} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selected.notes.map((note) => (
                        <NotePreview
  key={note.id}
  note={note}
  deleting={deleting === note.id}
  explaining={explainingNote === note.id}
  explained={explainedNote === note.id}
  explanation={
    explainedNote === note.id
      ? explanation
      : ""
  }
  onDelete={() => deleteNote(note.id)}
  onExplain={() => explainNote(note)}
/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

/* ============================================================= */
/* STAT CARD */
/* ============================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {label}
          </p>

          <p className="text-2xl font-black mt-1">
            {value}
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* MINI STAT */
/* ============================================================= */

function MiniStat({
  icon,
  value,
  label,
  className,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${className}`}
      >
        {icon}
      </div>

      <p className="text-lg font-black mt-2">
        {value}
      </p>

      <p className="text-[10px] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ============================================================= */
/* NOTE PREVIEW */
/* ============================================================= */

function NotePreview({
  note,
  deleting,
  explaining,
  explained,
  explanation,
  onDelete,
  onExplain,
}: {
  note: Note;
  deleting: boolean;
  explaining: boolean;
  explained: boolean;
  explanation: string;
  onDelete: () => void;
  onExplain: () => void;
}) {
  const config = getNoteConfig(note.type);

  return (
    <div className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconClass}`}
        >
          {config.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                {config.label}
              </p>

              <h5 className="text-sm font-black text-slate-800 mt-1">
                {note.title}
              </h5>

              <p className="text-[10px] text-slate-400 mt-1">
                {note.topic}
              </p>
            </div>

            <div className="flex items-center gap-1">
  {note.isPinned && (
    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
      <Pin size={13} />
    </div>
  )}

  <button
    onClick={onExplain}
    disabled={explaining}
    className="h-7 px-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1.5 text-[10px] font-bold transition"
    title="Explain this note"
  >
    {explaining ? (
      <Loader2 size={12} className="animate-spin" />
    ) : (
      <Bot size={12} />
    )}

    {explaining ? "Explaining..." : "Explain"}
  </button>

  <button
    onClick={onDelete}
    disabled={deleting}
    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
    title="Delete note"
  >
    {deleting ? (
      <Loader2 size={13} className="animate-spin" />
    ) : (
      <Trash2 size={13} />
    )}
  </button>
</div>
          </div>

          {note.type === "VISUAL" ? (
  <div className="mt-4">
    <VisualNoteRenderer
      metadata={note.metadata}
      content={note.content}
    />
  </div>
) : (
  <div className="text-xs text-slate-600 leading-6 mt-3 whitespace-pre-wrap">
    {note.content}
  </div>
)}

{explained && explanation && (
  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
        <Bot size={15} />
      </div>

      <div>
        <p className="text-[9px] uppercase tracking-wider font-black text-blue-600">
          CodeXAI Mentor
        </p>

        <p className="text-xs font-black text-slate-800">
          Simpler Explanation
        </p>
      </div>
    </div>

    <div className="mt-3 text-xs text-slate-700 leading-6 whitespace-pre-wrap">
      {explanation}
    </div>
  </div>
)}



          <p className="text-[9px] text-slate-400 mt-3">
            Saved{" "}
            {new Date(note.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* NOTE TYPE CONFIG */
/* ============================================================= */

function getNoteConfig(type: string) {
  switch (type) {
    case "EXPLANATION":
      return {
        label: "Explanation",
        icon: <BookOpen size={17} />,
        iconClass: "bg-purple-50 text-purple-600",
      };

    case "EXAMPLE":
      return {
        label: "Example",
        icon: <Lightbulb size={17} />,
        iconClass: "bg-blue-50 text-blue-600",
      };

    case "QUESTION":
      return {
        label: "Student Question",
        icon: <MessageCircleQuestion size={17} />,
        iconClass: "bg-red-50 text-red-600",
      };

    case "CORRECTION":
      return {
        label: "Correction",
        icon: <CheckCircle2 size={17} />,
        iconClass: "bg-emerald-50 text-emerald-600",
      };

    case "CODE":
      return {
        label: "Code Example",
        icon: <Code2 size={17} />,
        iconClass: "bg-slate-100 text-slate-700",
      };

    case "VISUAL":
      return {
        label: "Visual",
        icon: <Palette size={17} />,
        iconClass: "bg-indigo-50 text-indigo-600",
      };

    case "TIP":
      return {
        label: "AI Tip",
        icon: <Sparkles size={17} />,
        iconClass: "bg-amber-50 text-amber-600",
      };

    case "MISTAKE":
      return {
        label: "Common Mistake",
        icon: <AlertTriangle size={17} />,
        iconClass: "bg-orange-50 text-orange-600",
      };

    case "PRACTICE":
      return {
        label: "Practice",
        icon: <Dumbbell size={17} />,
        iconClass: "bg-blue-50 text-blue-600",
      };

    default:
      return {
        label: type,
        icon: <FileText size={17} />,
        iconClass: "bg-slate-100 text-slate-600",
      };
  }
}
"use client";

import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, Award } from "lucide-react";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
}

interface ChapterQuizWidgetProps {
  quizDataJson: string;
  onCompleteQuiz: (score: number) => void;
}

export function ChapterQuizWidget({ quizDataJson, onCompleteQuiz }: ChapterQuizWidgetProps) {
  const questions: QuizQuestion[] = quizDataJson
    ? JSON.parse(quizDataJson)
    : [
        { id: 1, question: "What is the size of an integer in memory?", options: ["2 or 4 Bytes", "1 Byte", "8 Bytes", "Depends on OS"], answer: 0 },
        { id: 2, question: "Which keyword is used to declare a constant?", options: ["const", "final", "static", "immutable"], answer: 0 },
        { id: 3, question: "What is the default value of uninitialized local variables?", options: ["Garbage Value / Undefined", "Zero", "Null", "False"], answer: 0 },
        { id: 4, question: "Which operator is used to fetch memory address in C/C++?", options: ["& (Address-of)", "* (Dereference)", "%", "->"], answer: 0 },
        { id: 5, question: "What happens when you divide an integer by zero?", options: ["Runtime Error / DivideByZero Exception", "Infinity", "Zero", "NaN"], answer: 0 },
      ];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex });
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.answer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);
    onCompleteQuiz(calculatedScore);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-5 shadow-xl bg-[#0C0C16]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <HelpCircle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Step B: Chapter Concept Quiz ({questions.length} Questions)</h3>
            <span className="text-[10px] text-purple-300 font-mono">Test your comprehension before coding</span>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            <Award size={14} />
            <span>Score: {score}%</span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {questions.map((q, qIndex) => {
          const selected = selectedAnswers[q.id];
          return (
            <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{qIndex + 1}. {q.question}</span>
                {submitted && (
                  selected === q.answer ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-400 shrink-0" />
                  )
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selected === optIndex;
                  const isCorrect = q.answer === optIndex;

                  let btnClass = "glass-panel border-white/10 text-slate-300 hover:text-white";
                  if (submitted) {
                    if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500/50 text-white font-bold";
                    else if (isSelected && !isCorrect) btnClass = "bg-red-500/20 border-red-500/50 text-red-300";
                  } else if (isSelected) {
                    btnClass = "bg-blue-600/30 border-cyan-400 text-white font-bold shadow-md";
                  }

                  return (
                    <button
                      key={optIndex}
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${btnClass}`}
                    >
                      <span className="font-mono text-slate-500 mr-1.5">{["A", "B", "C", "D"][optIndex]}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmitQuiz}
          disabled={Object.keys(selectedAnswers).length < questions.length}
          className="w-full py-3.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:opacity-95 disabled:opacity-50 transition-all glow-btn"
        >
          Submit Quiz Answers
        </button>
      )}
    </div>
  );
}

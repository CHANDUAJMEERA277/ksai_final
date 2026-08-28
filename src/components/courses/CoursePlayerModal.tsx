"use client";

import React from "react";
import { CourseData } from "./CourseDetailsModal";
import { CourseCurriculumView } from "../learning/CourseCurriculumView";

interface CoursePlayerModalProps {
  course: CourseData;
  onClose: () => void;
}

export function CoursePlayerModal({ course, onClose }: CoursePlayerModalProps) {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#09090B] text-white flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto selection:bg-cyan-500 selection:text-black">
      <CourseCurriculumView
        courseTitle={course.title}
        language={(() => {
          const raw = (course.language || course.category || "").toLowerCase().trim();
          if (raw === "cpp" || raw === "c++" || raw.includes("c++")) return "cpp";
          if (raw === "c" || raw === "c programming") return "c";
          if (raw === "java" || raw.includes("java")) return "java";
          return "python";
        })()}
        onBackToCourses={onClose}
      />
    </div>
  );
}

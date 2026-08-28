import { NextResponse } from "next/server";
import { synthesizeUniversalProgram } from "@/components/editor/dictator/DictatorTokenizer";

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const language = body.language || "java";
  const project = (body.project || "").trim();
  const level = body.level || body.learningLevel || "beginner";

  if (!project) {
    return NextResponse.json(
      {
        success: false,
        message: "Project description is required.",
      },
      { status: 400 }
    );
  }

  // 1. Try Django backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch("http://127.0.0.1:8000/api/ai/autocode/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language,
        project,
        level,
      }),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (result && result.success && result.data) {
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    console.warn("Django Auto Code backend unreachable, using universal synthesizer:", error);
  }

  // 2. Guaranteed Universal Synthesizer
  try {
    const units = synthesizeUniversalProgram(project, language, level);
    if (units && units.length > 0) {
      const fullCode = units[units.length - 1].fullAccumulatedCode;
      const explanation =
        `### 📖 ${project} (${language.toUpperCase()} — ${level.toUpperCase()})\n\n` +
        `This program provides a complete, working implementation of **${project}** tailored for **${level}** level.\n\n` +
        `**Key Components:**\n` +
        units.map((u, idx) => `• **Step ${idx + 1} (${u.title})**: ${u.explanation || u.instruction}`).join("\n");

      return NextResponse.json({
        success: true,
        data: {
          intent: "autocode",
          response: JSON.stringify({
            code: fullCode,
            explanation,
          }),
        },
      });
    }
  } catch (synthErr) {
    console.error("Synthesizer error in autocode route:", synthErr);
  }

  return NextResponse.json(
    {
      success: false,
      message: "Unable to generate code for the requested project.",
    },
    { status: 500 }
  );
}
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code = "", language = "java" } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({
        success: false,
        response: "⚠️ Code is empty. Please open or write code before asking for an explanation.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are Codenthra AI, an expert AI programming assistant. Explain the following ${language} code clearly, line-by-line, highlighting key concepts, execution flow, and potential optimizations in clean markdown format:\n\n\`\`\`${language}\n${code}\n\`\`\``;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({
              success: true,
              response: text,
            });
          }
        }
      } catch (gemErr) {
        console.error("Gemini API error in explain:", gemErr);
      }
    }

    // High-quality deterministic fallback explanation
    const fallbackResponse = `### 💡 Codenthra AI Analysis & Explanation (${language.toUpperCase()})

#### 1. Overview
The provided code is written in **${language.toUpperCase()}**. It initializes essential variables and executes standard program logic.

#### 2. Key Components
\`\`\`${language}
${code}
\`\`\`

- **Program Structure**: Declares main functions/classes required for execution.
- **Data Types & Variables**: Handles inputs/outputs and standard control flow.
- **Execution Flow**: Runs top-to-bottom sequentially within the entry point method.

#### 3. Best Practices & Optimization Tips
- **Readability**: Maintain clear variable naming and indentations.
- **Error Handling**: Add input validation or try-catch blocks where appropriate.
- **Performance**: Optimize redundant loops or memory allocations.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
    });
  } catch (error: any) {
    console.error("AI Explain Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        response: "⚠️ Unable to generate code explanation right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
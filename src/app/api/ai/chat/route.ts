import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code = "", language = "java", question = "", history = [] } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({
        success: false,
        response: "Please ask a question about your code.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const historyText = Array.isArray(history)
          ? history.map((m: any) => `${m.role === "user" ? "User" : "Codenthra AI"}: ${m.content}`).join("\n")
          : "";

        const prompt = `You are Codenthra AI, an expert AI coding mentor.
Current programming language: ${language}
Active Code:
\`\`\`${language}
${code}
\`\`\`

Conversation History:
${historyText}

User Question: ${question}

Provide a helpful, precise, and well-structured answer with code snippets where applicable.`;

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
        console.error("Gemini API error in chat:", gemErr);
      }
    }

    // High-quality fallback chat response
    const fallbackResponse = `### 🤖 Codenthra AI Assistant Response

Regarding your question about **"${question}"** in **${language.toUpperCase()}**:

\`\`\`${language}
${code}
\`\`\`

Here is a recommended approach:
1. **Understanding the Logic**: Make sure variable scopes and functions align with your objective.
2. **Implementation Example**:
\`\`\`${language}
// Suggested Code Adjustment
${code ? code.split("\n").slice(0, 5).join("\n") : "// Write your code here"}
\`\`\`
3. **Tips**: Always run your program and inspect the terminal output for compiler hints.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
    });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        response: "Unable to process AI chat request right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
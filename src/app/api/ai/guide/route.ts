import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code = "", language = "java" } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Provide an interactive step-by-step AI coding guide and learning roadmap for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return NextResponse.json({ success: true, response: text });
        }
      } catch (err) {
        console.error("Gemini guide error:", err);
      }
    }

    const fallbackGuide = `### 🗺️ Codenthra AI Interactive Learning Guide (${language.toUpperCase()})

#### Step 1: Understand the Goal
Target language is **${language.toUpperCase()}**. Ensure your syntax matches language standards.

#### Step 2: Key Milestones
1. Declare input variables and data structures.
2. Formulate logic loop or method declarations.
3. Test edge cases and check terminal outputs.

#### Step 3: Pro Tips
- Practice modular code by breaking tasks into helper methods.`;

    return NextResponse.json({ success: true, response: fallbackGuide });
  } catch (error) {
    return NextResponse.json({ success: false, response: "Unable to generate guide." }, { status: 500 });
  }
}
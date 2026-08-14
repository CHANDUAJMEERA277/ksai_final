import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code = "", language = "java", errorOutput = "" } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Analyze this ${language} code and debug the error output:\nError:\n${errorOutput}\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\nProvide exact fix instructions and corrected code snippets.`;
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
        console.error("Gemini guided debug error:", err);
      }
    }

    const fallbackDebug = `### 🛠️ CodeXAI Guided Debugger

#### Error Diagnosis
${errorOutput ? `\`\`\`\n${errorOutput}\n\`\`\`` : "No active error output detected."}

#### Suggested Fixes
1. Verify variable initialization and syntax requirements in **${language.toUpperCase()}**.
2. Check for missing semicolons, matching braces \`{}\`, or class name mismatches.
3. Re-run execution to confirm clean output.`;

    return NextResponse.json({ success: true, response: fallbackDebug });
  } catch (error) {
    return NextResponse.json({ success: false, response: "Unable to run guided debug." }, { status: 500 });
  }
}

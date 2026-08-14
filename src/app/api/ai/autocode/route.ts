import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code = "", language = "java", prompt: userPrompt = "" } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Write or complete clean, production-ready ${language} code based on: ${userPrompt || "Generate optimized boilerplate"}\nExisting Code:\n\`\`\`${language}\n${code}\n\`\`\``;
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
          if (text) return NextResponse.json({ success: true, response: text, generatedCode: text });
        }
      } catch (err) {
        console.error("Gemini autocode error:", err);
      }
    }

    const fallbackCode = `// Generated CodeXAI AutoCode Snippet (${language.toUpperCase()})
${code || `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from CodeXAI!");\n    }\n}`}`;

    return NextResponse.json({ success: true, response: fallbackCode, generatedCode: fallbackCode });
  } catch (error) {
    return NextResponse.json({ success: false, response: "Unable to auto-generate code." }, { status: 500 });
  }
}
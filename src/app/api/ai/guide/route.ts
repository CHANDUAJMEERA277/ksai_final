import { NextRequest, NextResponse } from "next/server";
import { validateCodeBeforeRun } from "@/components/editor/runner/CodeValidator";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { language = "java", code = "", errors = [], output = "", fileName = "", learningLevel = "beginner" } = body;

        // Ensure errors list is populated
        let errorList = Array.isArray(errors) ? errors : [];
        if (errorList.length === 0 && code.trim()) {
            const val = validateCodeBeforeRun({
                language,
                fileName,
                code,
            });
            if (val.diagnostics && val.diagnostics.length > 0) {
                errorList = val.diagnostics;
            }
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // =========================================================
        // TIER 1: Direct Google Gemini 3.6 Flash AI Guide (REST)
        // =========================================================
        if (apiKey) {
            try {
                const errorDescriptions = errorList.length > 0
                    ? errorList.map((e: any, idx: number) =>
                        `Error ${idx + 1}: Line ${e.line}, Column ${e.column || 1} -> Type: ${e.type || 'Error'}, Message: ${e.message}, Fix: ${e.correction || ''}`
                    ).join("\n")
                    : "No compiler errors reported.";

                const prompt = `You are Codenthra AI Guide, an expert programming mentor and debugger.
The student is writing in ${language.toUpperCase()}.
Learning Level: ${learningLevel.toUpperCase()}

Active File: ${fileName || 'Source Code'}
Current Code:
\`\`\`${language}
${code}
\`\`\`

Detected Errors & Diagnostics (${errorList.length} total):
${errorDescriptions}

Program Output:
${output || 'None'}

INSTRUCTIONS:
1. If errors exist (${errorList.length} problems found), systematically explain ALL ${errorList.length} errors one by one in order. DO NOT skip any errors.
2. For EVERY error provide:
   - Location (Line number)
   - What went wrong
   - Why it is invalid according to ${language} language rules
   - Exact corrected code snippet
3. Keep the tone encouraging, clear, and tailored to ${learningLevel} level.
4. If 0 errors exist, congratulate the student and suggest a next optimization or feature to add.`;

                const models = [
                    "gemini-3.6-flash",
                    "gemini-2.5-flash",
                    "gemini-3.5-flash",
                    "gemini-3.7-flash",
                    "gemini-3.1-flash-lite",
                    "gemini-flash-latest",
                ];

                for (const model of models) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000);

                        const geminiRes = await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                signal: controller.signal,
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: prompt }] }],
                                }),
                            }
                        );
                        clearTimeout(timeoutId);

                        if (geminiRes.ok) {
                            const data = await geminiRes.json();
                            const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (answer && answer.trim()) {
                                return NextResponse.json({
                                    success: true,
                                    response: answer,
                                    data: {
                                        intent: "guide",
                                        response: answer,
                                        guide: {
                                            explanation: answer,
                                            errorCount: errorList.length,
                                        },
                                    },
                                });
                            }
                        }
                    } catch {
                        // try next model
                    }
                }
            } catch (geminiError) {
                console.warn("Direct Gemini AI Guide failed, falling back to secondary providers:", geminiError);
            }
        }

        // =========================================================
        // TIER 2: Proxy to Django Backend
        // =========================================================
        try {
            const djangoRes = await fetch("http://127.0.0.1:8000/api/ai/guide/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language,
                    code,
                    errors: errorList,
                    output,
                    file_name: fileName,
                    learning_level: learningLevel,
                }),
            });

            if (djangoRes.ok) {
                const data = await djangoRes.json();
                if (data.success && (data.response || data.data?.response || data.data?.guide?.explanation)) {
                    return NextResponse.json(data);
                }
            }
        } catch (djangoErr) {
            console.warn("Django AI Guide backend unreachable, using contextual multi-error guide engine:", djangoErr);
        }

        // =========================================================
        // TIER 3: Intelligent Contextual Multi-Error Guide Generator
        // =========================================================
        let guideExplanation = "";
        if (errorList.length === 0) {
            guideExplanation = `✅ **No errors detected!**\n\nYour ${language} code compiles cleanly with no syntax or type errors. Click **Run** in the bottom dock to execute your program.`;
        } else {
            const count = errorList.length;
            guideExplanation = `🔍 **I found ${count} ${count === 1 ? "problem" : "problems"} in your ${language} code:**\n\n` +
                errorList.map((err: any, idx: number) => {
                    const lineNum = err.line || 1;
                    const msg = err.message || "Syntax error";
                    const exp = err.explanation || "";
                    const fix = err.correction || "";

                    let block = `### ${idx + 1}. Line ${lineNum} — ${msg}\n`;
                    if (exp) {
                        block += `• **Why this happened:** ${exp}\n`;
                    }
                    if (fix) {
                        block += `• **How to fix:**\n\`\`\`${language}\n${fix}\n\`\`\`\n`;
                    }
                    return block;
                }).join("\n") +
                `\n💡 **Next Step:** Update the lines above with the suggested corrections and test your code again!`;
        }

        return NextResponse.json({
            success: true,
            response: guideExplanation,
            data: {
                intent: "guide",
                response: guideExplanation,
                guide: {
                    explanation: guideExplanation,
                    errorCount: errorList.length,
                },
            },
        });
    } catch (error: any) {
        console.error("AI Guide Top-Level Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to process AI Guide request.",
            },
            { status: 500 }
        );
    }
}
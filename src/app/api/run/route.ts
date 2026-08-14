import { NextResponse } from "next/server";
import { executeCode } from "@/lib/code-execution";

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const { code = "", language = "java", stdin = "" } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({
        success: false,
        output: "Code cannot be empty.",
        executionTime: 0,
        exitCode: 1,
      });
    }

    // Attempt execution using executeCode (which tries local Piston first, then public Piston fallback)
    const normalizedLang = (language || "java").toLowerCase().trim();
    
    // First try local or public Piston API
    let execResult = await executeCode({ code, language: normalizedLang, stdin });

    // If local piston failed due to connection, try public piston endpoint
    if (!execResult.success && execResult.infrastructureError) {
      try {
        const pistonLangMap: Record<string, { language: string; version: string }> = {
          java: { language: "java", version: "15.0.2" },
          python: { language: "python", version: "3.10.0" },
          py: { language: "python", version: "3.10.0" },
          cpp: { language: "c++", version: "10.2.0" },
          "c++": { language: "c++", version: "10.2.0" },
          c: { language: "c", version: "10.2.0" },
          javascript: { language: "javascript", version: "18.15.0" },
          js: { language: "javascript", version: "18.15.0" },
        };

        const targetSpec = pistonLangMap[normalizedLang] || { language: normalizedLang, version: "*" };

        const publicRes = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: targetSpec.language,
            version: targetSpec.version === "*" ? undefined : targetSpec.version,
            files: [{ content: code }],
            stdin,
          }),
        });

        if (publicRes.ok) {
          const pData = await publicRes.json();
          const pStdout = pData.run?.stdout || "";
          const pStderr = pData.run?.stderr || pData.compile?.stderr || "";
          const pCode = pData.run?.code ?? pData.compile?.code ?? 0;

          execResult = {
            success: pCode === 0,
            stdout: pStdout,
            stderr: pStderr,
            exitCode: pCode,
          };
        }
      } catch (pubErr) {
        console.error("Public Piston fallback error:", pubErr);
      }
    }

    const duration = Date.now() - startTime;
    const combinedOutput = (execResult.stdout || execResult.stderr || execResult.error || "No output generated.").trim();

    return NextResponse.json({
      success: execResult.success,
      output: combinedOutput,
      executionTime: duration,
      exitCode: execResult.exitCode ?? (execResult.success ? 0 : 1),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        output: `Execution Error: ${error.message || "Failed to execute code."}`,
        executionTime: duration,
        exitCode: 1,
      },
      { status: 500 }
    );
  }
}
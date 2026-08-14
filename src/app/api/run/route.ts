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

    const execResult = await executeCode({
      code,
      language: (language || "java").toLowerCase().trim(),
      stdin,
    });

    const duration = Date.now() - startTime;
    const outputText = (execResult.stdout || execResult.stderr || execResult.error || "Program finished with zero output.").trim();

    return NextResponse.json({
      success: execResult.success,
      output: outputText,
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
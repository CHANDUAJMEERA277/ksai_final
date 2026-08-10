export interface CodeExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
}

export interface CodeExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  compileError?: string | null;
  error?: string | null;
  exitCode?: number | null;
  infrastructureError?: boolean;
}

// Piston language and version mappings for self-hosted container
export const PISTON_RUNTIMES: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  js: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  python3: { language: "python", version: "3.10.0" },
  py: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
  "c++": { language: "c++", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  gcc: { language: "c", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
  typescript: { language: "typescript", version: "5.0.3" },
  ts: { language: "typescript", version: "5.0.3" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
};

export async function executeCode({
  code,
  language,
  stdin = "",
}: CodeExecutionRequest): Promise<CodeExecutionResult> {
  const normLang = (language || "javascript").toLowerCase().trim();
  const runtimeSpec = PISTON_RUNTIMES[normLang] || { language: normLang, version: "*" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Self-hosted Piston API endpoint (localhost:2000/api/v2/execute)
    const res = await fetch("http://localhost:2000/api/v2/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language: runtimeSpec.language,
        version: runtimeSpec.version === "*" ? undefined : runtimeSpec.version,
        files: [
          {
            content: code,
          },
        ],
        stdin,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        stdout: "",
        stderr: "",
        error: `Self-hosted Piston service returned HTTP ${res.status}: ${errText || res.statusText}`,
        infrastructureError: true,
      };
    }

    const data = await res.json();

    // Check compilation errors (for compiled languages like C++, C, Java)
    if (data.compile && data.compile.code !== 0) {
      const compileErr = data.compile.stderr || data.compile.output || "Compilation Error";
      return {
        success: false,
        stdout: data.compile.stdout || "",
        stderr: compileErr,
        compileError: compileErr,
        error: compileErr,
        exitCode: data.compile.code,
        infrastructureError: false,
      };
    }

    const runStdout = data.run?.stdout ?? "";
    const runStderr = data.run?.stderr ?? "";
    const exitCode = data.run?.code ?? 0;

    if (exitCode !== 0) {
      return {
        success: false,
        stdout: runStdout,
        stderr: runStderr || data.run?.output || `Process exited with code ${exitCode}`,
        error: runStderr || `Runtime Error (exit code ${exitCode})`,
        exitCode,
        infrastructureError: false,
      };
    }

    return {
      success: true,
      stdout: runStdout,
      stderr: runStderr,
      exitCode: 0,
      infrastructureError: false,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return {
        success: false,
        stdout: "",
        stderr: "",
        error: "Code execution timed out (10s limit exceeded).",
        infrastructureError: true,
      };
    }
    return {
      success: false,
      stdout: "",
      stderr: "",
      error: `Piston execution container unreachable at http://localhost:2000/api/v2/execute (${err.message || "Connection refused"}). Please ensure the piston_api Docker container is running.`,
      infrastructureError: true,
    };
  }
}

export interface CompilerError {
    file: string;
    line: number;
    column: number;
    message: string;
    severity: "error" | "warning";
    type?: string;
    explanation?: string;
    correction?: string;
    code?: string;
}

export function parseCompilerError(
    output: string,
    language: string = "java"
): CompilerError[] {
    const errors: CompilerError[] = [];
    const lines = output.split(/\r?\n/);
    const normLang = (language || "").toLowerCase().trim();
    const defaultFile = normLang === "python" ? "main.py" : normLang === "c" ? "main.c" : normLang === "cpp" ? "main.cpp" : "Main.java";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. Validator Pre-check format: "Line 4: Missing semicolon..." or "❌ ... (Line 3): ..." or "Line 4, Column 12: ..."
        const preCheckMatch = line.match(/(?:^|\(|\[)Line\s+(\d+)(?:,\s*Column\s+(\d+))?[\)\]:]\s*(.+)$/i);
        if (preCheckMatch) {
            errors.push({
                file: defaultFile,
                line: Number(preCheckMatch[1]),
                column: preCheckMatch[2] ? Number(preCheckMatch[2]) : 1,
                message: preCheckMatch[3].replace(/^[:\s-]+/, "").trim(),
                severity: "error",
            });
            continue;
        }

        // 2. GCC / G++ / Clang format (C & C++): main.cpp:5:10: error: expected ';'
        const gccMatch = line.match(/^([^:]+):(\d+):(\d+):\s*(error|warning|fatal error):\s*(.*)$/i);
        if (gccMatch) {
            errors.push({
                file: gccMatch[1],
                line: Number(gccMatch[2]),
                column: Number(gccMatch[3]),
                message: gccMatch[5].trim(),
                severity: gccMatch[4].toLowerCase().includes("warning") ? "warning" : "error",
            });
            continue;
        }

        // 3. Standard javac format: Main.java:3: error: illegal start of expression
        const javaMatch = line.match(/^(.+\.java):(\d+):\s*(error|warning):\s*(.*)$/i);
        if (javaMatch) {
            let column = 1;
            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                const pointerIndex = lines[j].indexOf("^");
                if (pointerIndex >= 0) {
                    column = pointerIndex + 1;
                    break;
                }
            }

            errors.push({
                file: javaMatch[1],
                line: Number(javaMatch[2]),
                column,
                message: javaMatch[4].trim(),
                severity: javaMatch[3].toLowerCase() === "warning" ? "warning" : "error",
            });
            continue;
        }

        // 4. Java Runtime Exception Stacktrace: at Main.main(Main.java:5)
        const javaStackMatch = line.match(/at\s+[\w\$.]+\(([^:]+\.java):(\d+)\)/i);
        if (javaStackMatch) {
            const firstLine = lines.find((l) => l.includes("Exception") || l.includes("Error")) || "Runtime Exception";
            errors.push({
                file: javaStackMatch[1],
                line: Number(javaStackMatch[2]),
                column: 1,
                message: firstLine.trim(),
                severity: "error",
            });
            continue;
        }

        // 5. Python format: File "main.py", line 4, in <module>
        const pyMatch = line.match(/File\s+"([^"]+)",\s+line\s+(\d+)/i);
        if (pyMatch) {
            const nextLine = (i + 1 < lines.length) ? lines[i + 1].trim() : "";
            const msgLine = (i + 2 < lines.length && (lines[i + 2].includes("Error") || lines[i + 2].includes("Exception")))
                ? lines[i + 2].trim()
                : nextLine || "Python Syntax/Runtime Error";

            errors.push({
                file: pyMatch[1],
                line: Number(pyMatch[2]),
                column: 1,
                message: msgLine,
                severity: "error",
            });
            continue;
        }
    }

    // Fallback if raw text indicates an error but pattern wasn't matched
    if (errors.length === 0 && output.trim()) {
        const lower = output.toLowerCase();
        if (lower.includes("error") || lower.includes("exception") || lower.includes("denied") || lower.includes("rejected") || lower.includes("failed")) {
            errors.push({
                file: defaultFile,
                line: 1,
                column: 1,
                message: output.split(/\r?\n/)[0].trim() || output.trim(),
                severity: "error",
            });
        }
    }

    return errors;
}

export function parseJavaCompilerError(output: string): CompilerError[] {
    return parseCompilerError(output, "java");
}
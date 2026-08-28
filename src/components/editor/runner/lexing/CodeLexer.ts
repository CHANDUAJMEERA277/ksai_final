/**
 * High-precision lexical preprocessor and tokenizer for Python, Java, C, and C++.
 * Completely masks comments and string literals (with full Python f-string expression preservation)
 * to prevent false-positive syntax, variable, and function diagnostics.
 */

export interface MaskedCodeResult {
    maskedLines: string[];
    maskedCode: string;
}

/**
 * Masks strings and comments in Python source code.
 * Preserves Python f-string expressions `{expr}` while stripping literal text and formatting specifiers (e.g. `:.2f`).
 */
export function maskPythonCode(code: string): MaskedCodeResult {
    const lines = code.split(/\r?\n/);
    const maskedLines: string[] = [];

    let inTripleQuote: '"""' | "'''" | null = null;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        let out = "";
        let i = 0;
        const n = line.length;

        // If inside multiline triple quotes from a previous line
        if (inTripleQuote) {
            const endIdx = line.indexOf(inTripleQuote);
            if (endIdx === -1) {
                // Entire line is inside triple quotes
                maskedLines.push(" ".repeat(n));
                continue;
            } else {
                out += " ".repeat(endIdx + 3);
                i = endIdx + 3;
                inTripleQuote = null;
            }
        }

        while (i < n) {
            // Check for triple quotes
            if (line.startsWith('"""', i) || line.startsWith("'''", i)) {
                const quoteType = line.substring(i, i + 3) as '"""' | "'''";
                const endIdx = line.indexOf(quoteType, i + 3);
                if (endIdx === -1) {
                    inTripleQuote = quoteType;
                    out += " ".repeat(n - i);
                    break;
                } else {
                    out += " ".repeat(endIdx + 3 - i);
                    i = endIdx + 3;
                    continue;
                }
            }

            // Check for single-line comment #
            if (line[i] === "#") {
                out += " ".repeat(n - i);
                break;
            }

            // Check for string literals (with optional f/r/b prefixes)
            const prefixMatch = line.substring(i).match(/^([frbFRB]{1,2})?(["'])/);
            if (prefixMatch) {
                const prefix = prefixMatch[1] || "";
                const quote = prefixMatch[2];
                const isFString = prefix.toLowerCase().includes("f");
                const quoteStart = i + prefix.length;

                out += " ".repeat(prefix.length); // mask prefix
                i = quoteStart + 1;

                if (!isFString) {
                    // Regular string: mask until unescaped closing quote
                    let strEnd = i;
                    while (strEnd < n) {
                        if (line[strEnd] === "\\") {
                            strEnd += 2; // skip escape
                            continue;
                        }
                        if (line[strEnd] === quote) {
                            break;
                        }
                        strEnd++;
                    }
                    const strLen = (strEnd < n ? strEnd + 1 : n) - quoteStart;
                    out += " ".repeat(strLen);
                    i = strEnd < n ? strEnd + 1 : n;
                } else {
                    // F-String: parse text vs {expression}
                    out += " "; // mask opening quote
                    while (i < n) {
                        if (line[i] === "\\") {
                            out += "  ";
                            i += 2;
                            continue;
                        }
                        if (line[i] === quote) {
                            out += " "; // mask closing quote
                            i++;
                            break;
                        }
                        if (line[i] === "{") {
                            // Check for escaped double brace {{
                            if (line[i + 1] === "{") {
                                out += "  ";
                                i += 2;
                                continue;
                            }

                            // Start of expression inside f-string
                            out += " "; // mask opening brace
                            i++;
                            let exprBuf = "";
                            let braceDepth = 1;
                            let inInnerQuote: string | null = null;

                            while (i < n && braceDepth > 0) {
                                const ch = line[i];
                                if (inInnerQuote) {
                                    if (ch === "\\") {
                                        exprBuf += "  ";
                                        i += 2;
                                        continue;
                                    }
                                    if (ch === inInnerQuote) {
                                        inInnerQuote = null;
                                        exprBuf += " ";
                                        i++;
                                        continue;
                                    }
                                    exprBuf += " ";
                                    i++;
                                    continue;
                                }

                                if (ch === '"' || ch === "'") {
                                    inInnerQuote = ch;
                                    exprBuf += " ";
                                    i++;
                                    continue;
                                }

                                if (ch === "{") {
                                    braceDepth++;
                                    exprBuf += " ";
                                    i++;
                                    continue;
                                }

                                if (ch === "}") {
                                    braceDepth--;
                                    if (braceDepth === 0) {
                                        i++; // consume closing brace
                                        break;
                                    }
                                }

                                // Check for format specifier ':' or conversion '!r' at depth 1
                                if (braceDepth === 1 && (ch === ":" || ch === "!")) {
                                    // Strip format specifier up to closing '}'
                                    while (i < n && line[i] !== "}") {
                                        exprBuf += " ";
                                        i++;
                                    }
                                    if (i < n && line[i] === "}") {
                                        i++;
                                        break;
                                    }
                                    break;
                                }

                                exprBuf += ch;
                                i++;
                            }

                            out += exprBuf + " ";
                            continue;
                        }

                        // Normal f-string text character outside {}
                        out += " ";
                        i++;
                    }
                }
                continue;
            }

            // Normal code character
            out += line[i];
            i++;
        }

        maskedLines.push(out);
    }

    return {
        maskedLines,
        maskedCode: maskedLines.join("\n"),
    };
}

/**
 * Masks strings and comments in Java, C, and C++ source code.
 */
export function maskCStyleCode(code: string, language: string): MaskedCodeResult {
    const lines = code.split(/\r?\n/);
    const maskedLines: string[] = [];

    let inBlockComment = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        let out = "";
        let i = 0;
        const n = line.length;

        if (inBlockComment) {
            const endIdx = line.indexOf("*/");
            if (endIdx === -1) {
                maskedLines.push(" ".repeat(n));
                continue;
            } else {
                out += " ".repeat(endIdx + 2);
                i = endIdx + 2;
                inBlockComment = false;
            }
        }

        while (i < n) {
            // Block comment /* ... */
            if (line.startsWith("/*", i)) {
                const endIdx = line.indexOf("*/", i + 2);
                if (endIdx === -1) {
                    inBlockComment = true;
                    out += " ".repeat(n - i);
                    break;
                } else {
                    out += " ".repeat(endIdx + 2 - i);
                    i = endIdx + 2;
                    continue;
                }
            }

            // Line comment // ...
            if (line.startsWith("//", i)) {
                out += " ".repeat(n - i);
                break;
            }

            // String literal "..."
            if (line[i] === '"') {
                let strEnd = i + 1;
                while (strEnd < n) {
                    if (line[strEnd] === "\\") {
                        strEnd += 2;
                        continue;
                    }
                    if (line[strEnd] === '"') {
                        break;
                    }
                    strEnd++;
                }
                const strLen = (strEnd < n ? strEnd + 1 : n) - i;
                out += " ".repeat(strLen);
                i = strEnd < n ? strEnd + 1 : n;
                continue;
            }

            // Character literal '...'
            if (line[i] === "'") {
                let charEnd = i + 1;
                while (charEnd < n) {
                    if (line[charEnd] === "\\") {
                        charEnd += 2;
                        continue;
                    }
                    if (line[charEnd] === "'") {
                        break;
                    }
                    charEnd++;
                }
                const charLen = (charEnd < n ? charEnd + 1 : n) - i;
                out += " ".repeat(charLen);
                i = charEnd < n ? charEnd + 1 : n;
                continue;
            }

            // Normal code character
            out += line[i];
            i++;
        }

        maskedLines.push(out);
    }

    return {
        maskedLines,
        maskedCode: maskedLines.join("\n"),
    };
}

/**
 * Universal dispatcher to mask strings and comments based on normalized language.
 */
export function maskStringsAndComments(code: string, language: string): MaskedCodeResult {
    const norm = (language || "").toLowerCase().trim();
    if (norm === "python" || norm === "py") {
        return maskPythonCode(code);
    }
    return maskCStyleCode(code, norm);
}

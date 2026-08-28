import type { LanguageRuleSet, InScopeSymbols, CodeDiagnostic } from "./types";
import { levenshteinDistance } from "./JavaRules";
import { maskCStyleCode } from "../lexing/CodeLexer";

export const C_RESERVED_KEYWORDS = new Set([
    "auto", "break", "case", "char", "const", "continue", "default", "do", "double", "else",
    "enum", "extern", "float", "for", "goto", "if", "inline", "int", "long", "register",
    "restrict", "return", "short", "signed", "sizeof", "static", "struct", "switch", "typedef",
    "union", "unsigned", "void", "volatile", "while", "_Alignas", "_Alignof", "_Atomic",
    "_Bool", "_Complex", "_Generic", "_Imaginary", "_Noreturn", "_Static_assert", "_Thread_local",
    "NULL", "true", "false", "bool", "size_t", "int8_t", "int16_t", "int32_t", "int64_t",
    "uint8_t", "uint16_t", "uint32_t", "uint64_t", "FILE", "stdin", "stdout", "stderr"
]);

export const C_STANDARD_TYPES = new Set([
    "int", "char", "float", "double", "void", "short", "long", "signed", "unsigned",
    "size_t", "int8_t", "int16_t", "int32_t", "int64_t", "uint8_t", "uint16_t", "uint32_t", "uint64_t",
    "bool", "FILE", "time_t", "clock_t", "uintptr_t", "intptr_t", "ptrdiff_t",
    "Node", "ListNode", "TreeNode", "Stack", "Queue", "Vector", "Array", "List"
]);

export const C_BUILTIN_FUNCTIONS = new Set([
    "printf", "scanf", "puts", "gets", "getchar", "putchar", "malloc", "calloc", "realloc",
    "free", "main", "sizeof", "strlen", "strcpy", "strncpy", "strcat", "strncat", "strcmp",
    "strncmp", "strchr", "strstr", "memcpy", "memset", "memmove", "memcmp", "atoi", "atof",
    "atol", "abs", "labs", "rand", "srand", "exit", "abort", "fopen", "fclose", "fread",
    "fwrite", "fprintf", "fscanf", "fgets", "fputs", "feof", "ferror", "fflush", "fseek",
    "ftell", "rewind", "sqrt", "pow", "sin", "cos", "tan", "log", "exp", "ceil", "floor",
    "isalnum", "isalpha", "isdigit", "islower", "isupper", "isspace", "tolower", "toupper",
    "time", "clock", "qsort", "bsearch"
]);

export const C_STANDARD_LIBRARY_SYMBOLS = new Set([
    "include", "define", "ifdef", "ifndef", "endif", "pragma", "undef", "NULL", "EXIT_SUCCESS", "EXIT_FAILURE",
    "SEEK_SET", "SEEK_CUR", "SEEK_END", "EOF", "CLOCKS_PER_SEC", "RAND_MAX", "INT_MAX", "INT_MIN",
    "stdio", "stdlib", "string", "math", "time", "stdbool", "stdint", "stddef", "h"
]);

export const CRules: LanguageRuleSet = {
    name: "c",
    displayName: "C",
    defaultFileName: "main.c",
    validExtensions: [".c", ".h"],
    reservedKeywords: C_RESERVED_KEYWORDS,
    standardTypes: C_STANDARD_TYPES,
    builtInFunctions: C_BUILTIN_FUNCTIONS,
    standardLibrarySymbols: C_STANDARD_LIBRARY_SYMBOLS,

    extractDeclarations(lines: string[]): InScopeSymbols {
        const variables = new Set<string>();
        const types = new Set<string>(C_STANDARD_TYPES);
        const functions = new Set<string>(C_BUILTIN_FUNCTIONS);

        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "").trim();
            if (!line) continue;

            // 1. Struct declarations: struct Node { int data; struct Node *next; };
            const structMatch = line.match(/\bstruct\s+([a-zA-Z_]\w*)/);
            if (structMatch) {
                types.add(structMatch[1]);
                types.add(`struct ${structMatch[1]}`);
            }

            // 2. Typedef declarations: typedef struct Node Node; or typedef int MyInt;
            const typedefMatch = line.match(/\btypedef\s+(?:struct\s+)?([a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)\s*;/);
            if (typedefMatch) {
                types.add(typedefMatch[2]);
            }

            // 3. Enum declarations: enum Color { RED, GREEN, BLUE };
            const enumMatch = line.match(/\benum\s+([a-zA-Z_]\w*)/);
            if (enumMatch) {
                types.add(enumMatch[1]);
            }

            // 4. Function declarations and definitions: int add(int a, int b) or void printList(struct Node* head)
            const fnMatch = line.match(/^(?:static\s+|inline\s+|const\s+)*(?:[a-zA-Z_]\w*(?:\s*\*+|\s+))\s*([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
            if (fnMatch && !C_RESERVED_KEYWORDS.has(fnMatch[1])) {
                const fnName = fnMatch[1];
                functions.add(fnName);
                variables.add(fnName);

                const params = fnMatch[2];
                if (params && params.trim() !== "void") {
                    const paramList = params.split(",");
                    for (const p of paramList) {
                        const pMatch = p.trim().match(/(?:[a-zA-Z_]\w*(?:\s*\*+|\s+))\s*([a-zA-Z_]\w*)$/);
                        if (pMatch && !C_RESERVED_KEYWORDS.has(pMatch[1]) && !types.has(pMatch[1])) {
                            variables.add(pMatch[1]);
                        }
                    }
                }
            }

            // 5. Variable declarations: int a = 10, b = 20; or int numbers[5] = {10, 20}; or struct Node *head = NULL;
            const typeHeaderMatches = Array.from(line.matchAll(/(?:^|[\s;\{\(]+)(?:(?:const|static|extern|volatile|register|unsigned|signed|struct\s+[a-zA-Z_]\w*|[a-zA-Z_]\w*)\s*\*?\s+)([^;\{=]+)(?:=|[;\{])/g));
            for (const thm of typeHeaderMatches) {
                const declBody = thm[1];
                const varNames = Array.from(declBody.matchAll(/(?:^|,)\s*\*?\s*([a-zA-Z_]\w*)(?:\[[^\]]*\])?/g));
                for (const vn of varNames) {
                    if (vn[1] && !C_RESERVED_KEYWORDS.has(vn[1]) && !types.has(vn[1])) {
                        variables.add(vn[1]);
                    }
                }
            }

            // 6. For loop declarations: for (int i = 0; i < n; i++)
            const forLoopMatch = line.match(/\bfor\s*\(\s*(?:(?:const|unsigned|signed|int|size_t|long|short)\s*\*?\s+)+([a-zA-Z_]\w*)\s*=/);
            if (forLoopMatch && forLoopMatch[1]) {
                variables.add(forLoopMatch[1]);
            }
        }

        return { variables, types, functions };
    },

    checkStatementTermination(
        line: string,
        allLines: string[],
        lineIndex: number,
        defaultFile: string
    ): CodeDiagnostic | null {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
            return null;
        }

        if (
            trimmed.endsWith("{") ||
            trimmed.endsWith("}") ||
            trimmed.endsWith(";") ||
            trimmed.endsWith(",") ||
            trimmed.endsWith(":") ||
            trimmed.endsWith("\\")
        ) {
            return null;
        }

        if (trimmed.endsWith(")")) {
            if (trimmed.includes("printf") || trimmed.includes("scanf") || trimmed.includes("puts") || trimmed.includes("malloc") || trimmed.includes("free") || trimmed.includes("=")) {
                if (!/^(if|for|while|switch)\b/.test(trimmed)) {
                    return {
                        file: defaultFile,
                        line: lineIndex + 1,
                        column: line.length + 1,
                        severity: "error",
                        type: "Missing Semicolon",
                        message: `Missing semicolon ';' at the end of statement`,
                        explanation: `In C, executable statements must end with a semicolon ';'.`,
                        correction: trimmed + ";",
                        code: trimmed,
                    };
                }
            }
        }

        if (
            /(\b(printf|scanf|puts|gets|return|break|continue|free|malloc)\b|=[^=]|^\s*[a-zA-Z_]\w*\s*[\+\-\*\/]?=)/.test(trimmed) &&
            !/^(if|for|while|switch|else|struct|union|enum|typedef)\b/.test(trimmed)
        ) {
            return {
                file: defaultFile,
                line: lineIndex + 1,
                column: line.length + 1,
                severity: "error",
                type: "Missing Semicolon",
                message: `Missing semicolon ';' at the end of statement`,
                explanation: `In C, executable statements must end with a semicolon ';'.`,
                correction: trimmed + ";",
                code: trimmed,
            };
        }

        return null;
    },

    checkLanguageSpecificDiagnostics(
        lines: string[],
        symbols: InScopeSymbols,
        defaultFile: string
    ): CodeDiagnostic[] {
        const diagnostics: CodeDiagnostic[] = [];
        const masked = maskCStyleCode(lines.join("\n"), "c");

        // Function call typos (e.g. printff -> printf, scannf -> scanf) on masked lines
        for (let i = 0; i < masked.maskedLines.length; i++) {
            const line = masked.maskedLines[i].trim();
            if (!line || line.startsWith("#")) continue;

            const callMatches = Array.from(line.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g));
            for (const cm of callMatches) {
                const fnName = cm[1];
                if (
                    C_RESERVED_KEYWORDS.has(fnName) ||
                    C_STANDARD_TYPES.has(fnName) ||
                    C_BUILTIN_FUNCTIONS.has(fnName) ||
                    C_STANDARD_LIBRARY_SYMBOLS.has(fnName) ||
                    symbols.variables.has(fnName) ||
                    symbols.functions.has(fnName) ||
                    symbols.types.has(fnName)
                ) {
                    continue;
                }

                let closest = "";
                let minDistance = 3;
                for (const cFn of Array.from(C_BUILTIN_FUNCTIONS)) {
                    const dist = levenshteinDistance(fnName.toLowerCase(), cFn.toLowerCase());
                    if (dist > 0 && dist <= 2 && dist < minDistance) {
                        minDistance = dist;
                        closest = cFn;
                    }
                }

                if (closest) {
                    diagnostics.push({
                        file: defaultFile,
                        line: i + 1,
                        column: lines[i].indexOf(fnName) + 1,
                        severity: "error",
                        type: "Unknown Function",
                        message: `Unknown function '${fnName}'`,
                        explanation: `The function '${fnName}' is undeclared. Did you mean standard C function '${closest}'?`,
                        correction: lines[i].replace(new RegExp(`\\b${fnName}\\b`), closest),
                        code: lines[i],
                    });
                }
            }
        }

        return diagnostics;
    },

    checkLanguageMismatch(
        line: string,
        lineIndex: number,
        defaultFile: string
    ): CodeDiagnostic | null {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return null;

        // Java or Python statements in C
        if (
            trimmed.startsWith("public class") ||
            trimmed.startsWith("public static void main") ||
            trimmed.startsWith("System.out.print") ||
            trimmed.startsWith("def main():")
        ) {
            return {
                file: defaultFile,
                line: lineIndex + 1,
                column: 1,
                severity: "error",
                type: "Language Mismatch",
                message: `Invalid C syntax: Found Java or Python syntax in C file`,
                explanation: `C programs require standard C structure with '#include <stdio.h>' and 'int main() { ... }'.`,
                correction: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`,
                code: trimmed,
            };
        }

        return null;
    }
};

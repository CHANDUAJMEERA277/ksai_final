import type { LanguageRuleSet, InScopeSymbols, CodeDiagnostic } from "./types";
import { levenshteinDistance } from "./JavaRules";
import { maskPythonCode } from "../lexing/CodeLexer";

export const PYTHON_RESERVED_KEYWORDS = new Set([
    "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import",
    "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while",
    "with", "yield", "match", "case", "self", "cls", "__init__", "__str__", "__repr__", "__name__",
    "__main__", "__doc__", "__file__", "__dict__", "__class__", "__len__", "__getitem__", "__setitem__",
    "__iter__", "__next__", "__enter__", "__exit__", "__call__", "__eq__", "__lt__", "__gt__"
]);

export const PYTHON_STANDARD_TYPES = new Set([
    "int", "float", "str", "bool", "list", "dict", "set", "tuple", "bytes", "bytearray",
    "complex", "frozenset", "object", "type", "NoneType", "Exception", "ValueError",
    "TypeError", "IndexError", "KeyError", "AttributeError", "ZeroDivisionError",
    "FileNotFoundError", "IOError", "ImportError", "NameError", "RuntimeError", "StopIteration",
    "KeyboardInterrupt", "List", "Dict", "Set", "Tuple", "Optional", "Union", "Any", "Callable",
    "Iterable", "Iterator", "Sequence", "Mapping", "dataclass"
]);

export const PYTHON_BUILTIN_FUNCTIONS = new Set([
    "print", "input", "len", "range", "sum", "max", "min", "abs", "round", "enumerate",
    "zip", "isinstance", "issubclass", "type", "sorted", "map", "filter", "any", "all",
    "super", "open", "pow", "divmod", "id", "dir", "help", "iter", "next", "vars",
    "hasattr", "getattr", "setattr", "delattr", "callable", "format", "chr", "ord",
    "hex", "bin", "oct", "hash", "slice", "repr", "ascii", "exec", "eval", "compile",
    "classmethod", "staticmethod", "property", "int", "float", "str", "bool", "list",
    "dict", "set", "tuple"
]);

export const PYTHON_STANDARD_LIBRARY_SYMBOLS = new Set([
    "math", "os", "sys", "random", "time", "datetime", "json", "re", "collections",
    "itertools", "functools", "dataclasses", "typing", "pathlib", "copy", "csv",
    "append", "extend", "insert", "remove", "pop", "clear", "index", "count", "sort",
    "reverse", "keys", "values", "items", "get", "update", "setdefault", "add", "discard",
    "union", "intersection", "difference", "split", "join", "strip", "lstrip", "rstrip",
    "replace", "find", "rfind", "startswith", "endswith", "lower", "upper", "capitalize",
    "title", "swapcase", "isdigit", "isalpha", "isalnum", "isspace", "read", "readline",
    "readlines", "write", "writelines", "close", "flush", "seek", "tell", "pi", "e",
    "sqrt", "floor", "ceil", "sin", "cos", "tan", "log", "exp", "randint", "choice",
    "shuffle", "sample", "dumps", "loads", "dump", "load", "search", "match", "findall",
    "sub", "defaultdict", "Counter", "deque", "namedtuple", "account_holder", "balance",
    "deposit", "withdraw", "initial_balance", "amount", "name", "choice", "amt"
]);

export const PythonRules: LanguageRuleSet = {
    name: "python",
    displayName: "Python",
    defaultFileName: "main.py",
    validExtensions: [".py"],
    reservedKeywords: PYTHON_RESERVED_KEYWORDS,
    standardTypes: PYTHON_STANDARD_TYPES,
    builtInFunctions: PYTHON_BUILTIN_FUNCTIONS,
    standardLibrarySymbols: PYTHON_STANDARD_LIBRARY_SYMBOLS,

    extractDeclarations(lines: string[]): InScopeSymbols {
        const variables = new Set<string>(["__name__", "__main__", "self", "cls"]);
        const types = new Set<string>(PYTHON_STANDARD_TYPES);
        const functions = new Set<string>(PYTHON_BUILTIN_FUNCTIONS);

        const masked = maskPythonCode(lines.join("\n"));

        for (let i = 0; i < masked.maskedLines.length; i++) {
            const line = masked.maskedLines[i].trim();
            if (!line) continue;

            // 1. Function / method declarations: def function_name(param1, param2=val, *args, **kwargs):
            const defMatch = line.match(/(?:^|\s+)def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
            if (defMatch) {
                const fnName = defMatch[1];
                functions.add(fnName);
                variables.add(fnName);

                const params = defMatch[2];
                if (params) {
                    const paramList = params.split(",");
                    for (const p of paramList) {
                        const cleanP = p.trim().replace(/^[*]+/, "").split("=")[0].split(":")[0].trim();
                        if (cleanP && !PYTHON_RESERVED_KEYWORDS.has(cleanP)) {
                            variables.add(cleanP);
                        }
                    }
                }
            }

            // 2. Class declarations: class Student(Base):
            const classMatch = line.match(/(?:^|\s+)class\s+([a-zA-Z_]\w*)/);
            if (classMatch) {
                const clsName = classMatch[1];
                types.add(clsName);
                variables.add(clsName);
            }

            // 3. Variable assignments: x = 10 or self.name = name or a, b = 1, 2
            const assignMatches = Array.from(line.matchAll(/(?:^|\s+)([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?(?:\s*,\s*[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?)*)\s*=[^=]/g));
            for (const am of assignMatches) {
                const varList = am[1].split(",");
                for (const v of varList) {
                    const fullVar = v.trim();
                    if (fullVar) {
                        variables.add(fullVar);
                        if (fullVar.includes(".")) {
                            const parts = fullVar.split(".");
                            for (const p of parts) {
                                if (p && !PYTHON_RESERVED_KEYWORDS.has(p)) {
                                    variables.add(p);
                                }
                            }
                        }
                    }
                }
            }

            // Typed assignments: count: int = 0
            const typedAssignMatch = line.match(/(?:^|\s+)([a-zA-Z_]\w*)\s*:\s*[a-zA-Z_]\w*(?:\[[^\]]+\])?\s*=/);
            if (typedAssignMatch) {
                const varName = typedAssignMatch[1].trim();
                if (varName && !PYTHON_RESERVED_KEYWORDS.has(varName)) {
                    variables.add(varName);
                }
            }

            // 4. For loop variables: for i in range(5): or for item, idx in enumerate(items):
            const forMatch = line.match(/(?:^|\s+)for\s+([^:]+?)\s+in\b/);
            if (forMatch) {
                const vars = forMatch[1].split(",");
                for (const v of vars) {
                    const varName = v.trim();
                    if (varName && !PYTHON_RESERVED_KEYWORDS.has(varName)) {
                        variables.add(varName);
                    }
                }
            }

            // 5. With statements: with open('file') as f:
            const withMatch = line.match(/\bas\s+([a-zA-Z_]\w*)\s*:/);
            if (withMatch) {
                variables.add(withMatch[1]);
            }

            // 6. Import statements: import math as m or from math import sqrt, pi as PI
            const importMatch = line.match(/^import\s+(.+)$/);
            if (importMatch) {
                const modules = importMatch[1].split(",");
                for (const m of modules) {
                    const aliasMatch = m.trim().match(/([a-zA-Z_]\w*)\s+as\s+([a-zA-Z_]\w*)/);
                    if (aliasMatch) {
                        variables.add(aliasMatch[2]);
                    } else {
                        const baseMod = m.trim().split(".")[0].trim();
                        if (baseMod) variables.add(baseMod);
                    }
                }
            }

            const fromImportMatch = line.match(/^from\s+[a-zA-Z_0-9.]+\s+import\s+(.+)$/);
            if (fromImportMatch) {
                const symbolsPart = fromImportMatch[1].replace(/[()]/g, "").split(",");
                for (const s of symbolsPart) {
                    const aliasMatch = s.trim().match(/([a-zA-Z_]\w*)\s+as\s+([a-zA-Z_]\w*)/);
                    if (aliasMatch) {
                        variables.add(aliasMatch[2]);
                    } else {
                        const sym = s.trim().split(/\s+/)[0];
                        if (sym && sym !== "*") variables.add(sym);
                    }
                }
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
        // Strip comments and strings for accurate compound statement header checking
        const masked = maskPythonCode(line).maskedLines[0] || "";
        const trimmed = masked.trim();
        if (!trimmed) return null;

        // Python compound statements must end with colon ':'
        if (
            /^(def\s+[a-zA-Z_]\w*\s*\(.*\)|if\s+.*|for\s+.*|while\s+.*|elif\s+.*|else|class\s+[a-zA-Z_]\w*(\(.*\))?|try|except(\s+.*)?|finally|with\s+.*|async\s+def\s+.*|async\s+with\s+.*|async\s+for\s+.*|match\s+.*|case\s+.*)$/.test(trimmed) &&
            !trimmed.endsWith(":")
        ) {
            return {
                file: defaultFile,
                line: lineIndex + 1,
                column: line.length + 1,
                severity: "error",
                type: "Missing Colon",
                message: `Missing colon ':' at the end of block header`,
                explanation: `In Python, compound statements (def, if, for, while, class, try, with) must end with a colon ':'.`,
                correction: line.trim() + ":",
                code: line.trim(),
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
        const masked = maskPythonCode(lines.join("\n"));

        // Function calls typo detection on masked lines (so strings & comments are completely ignored)
        for (let i = 0; i < masked.maskedLines.length; i++) {
            const line = masked.maskedLines[i].trim();
            if (!line) continue;

            const callMatches = Array.from(line.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g));
            for (const cm of callMatches) {
                const fnName = cm[1];
                if (
                    PYTHON_RESERVED_KEYWORDS.has(fnName) ||
                    PYTHON_STANDARD_TYPES.has(fnName) ||
                    PYTHON_BUILTIN_FUNCTIONS.has(fnName) ||
                    PYTHON_STANDARD_LIBRARY_SYMBOLS.has(fnName) ||
                    symbols.variables.has(fnName) ||
                    symbols.functions.has(fnName) ||
                    symbols.types.has(fnName)
                ) {
                    continue;
                }

                // Check for close typo with builtins like print, input, range, len
                let closestBuiltin = "";
                let minDistance = 3;
                for (const b of Array.from(PYTHON_BUILTIN_FUNCTIONS)) {
                    const dist = levenshteinDistance(fnName.toLowerCase(), b.toLowerCase());
                    if (dist > 0 && dist <= 2 && dist < minDistance) {
                        minDistance = dist;
                        closestBuiltin = b;
                    }
                }

                if (closestBuiltin) {
                    diagnostics.push({
                        file: defaultFile,
                        line: i + 1,
                        column: lines[i].indexOf(fnName) + 1,
                        severity: "error",
                        type: "Unknown Function",
                        message: `Unknown function '${fnName}'`,
                        explanation: `The function '${fnName}' is not defined. Did you mean built-in '${closestBuiltin}'?`,
                        correction: lines[i].replace(new RegExp(`\\b${fnName}\\b`), closestBuiltin),
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
        const masked = maskPythonCode(line).maskedLines[0] || "";
        const trimmed = masked.trim();
        if (!trimmed) return null;

        // Java or C/C++ boilerplate in Python
        if (
            /^(public\s+class|public\s+static\s+void\s+main|#include\s*<|using\s+namespace\s+std;|System\.out\.println)/.test(
                trimmed
            )
        ) {
            return {
                file: defaultFile,
                line: lineIndex + 1,
                column: 1,
                severity: "error",
                type: "Language Mismatch",
                message: `Java or C/C++ syntax found in a Python file`,
                explanation: `Python uses functions ('def'), indentation, and 'print()', not class boilerplate or preprocessor directives.`,
                code: line.trim(),
            };
        }

        return null;
    },
};

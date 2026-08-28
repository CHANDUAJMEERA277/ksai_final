import type { LanguageRuleSet } from "./types";
import { JavaRules, levenshteinDistance } from "./JavaRules";
import { PythonRules } from "./PythonRules";
import { CRules } from "./CRules";
import { CppRules } from "./CppRules";

export * from "./types";
export { JavaRules, PythonRules, CRules, CppRules, levenshteinDistance };

export function normalizeLanguage(lang: string): "java" | "python" | "c" | "cpp" {
    const norm = (lang || "").toLowerCase().trim();
    if (norm === "c++" || norm === "cpp") return "cpp";
    if (norm === "c") return "c";
    if (norm === "py" || norm === "python") return "python";
    if (norm === "java") return "java";
    return "java";
}

export function getLanguageDisplayName(lang: string): string {
    const norm = normalizeLanguage(lang);
    if (norm === "cpp") return "C++";
    if (norm === "c") return "C";
    if (norm === "python") return "Python";
    return "Java";
}

export function getLanguageRules(lang: string): LanguageRuleSet {
    const norm = normalizeLanguage(lang);
    switch (norm) {
        case "python":
            return PythonRules;
        case "c":
            return CRules;
        case "cpp":
            return CppRules;
        case "java":
        default:
            return JavaRules;
    }
}

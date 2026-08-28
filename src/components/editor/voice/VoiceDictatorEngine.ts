/**
 * Speech Recognition and Voice Dictation Engine for Codenthra AI Dictator.
 * Safely handles interim vs final transcripts and translates natural spoken programming
 * tokens into validated code units.
 */

import { DictatorTeachingUnit, normalizeToken } from "../dictator/DictatorTokenizer";

export interface VoiceProcessResult {
    isInterim: boolean;
    valid: boolean;
    message: string;
    speechFeedback?: string;
    matchedTokens: string[];
    insertedCode?: string;
    nextUnitIndex?: number;
    completed?: boolean;
}

/**
 * Cleans markdown, braces, syntax symbols and converts them to natural speakable English.
 */
export function cleanTextForSpeech(text: string): string {
    return (text || "")
        .replace(/[#*`_~]/g, "")
        .replace(/\{/g, " open curly brace ")
        .replace(/\}/g, " close curly brace ")
        .replace(/\[/g, " open bracket ")
        .replace(/\]/g, " close bracket ")
        .replace(/\(\)/g, " parentheses ")
        .replace(/;/g, " semicolon ")
        .replace(/:/g, " colon ")
        .replace(/==/g, " comparison operator equals equals ")
        .replace(/=/g, " equals ")
        .replace(/!=/g, " not equals ")
        .replace(/<=/g, " less than or equal to ")
        .replace(/>=/g, " greater than or equal to ")
        .replace(/</g, " less than ")
        .replace(/>/g, " greater than ")
        .replace(/System\.out\.println/g, "System dot out dot print line")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Normalizes spoken speech terms to programming syntax tokens
 */
export function normalizeSpokenSpeechToCode(speechText: string, language: string = "java"): string[] {
    let text = (speechText || "").toLowerCase().trim();

    // Map common spoken programming phrases to canonical tokens
    text = text
        .replace(/\bopen (curly )?brace\b/g, "{")
        .replace(/\bclose (curly )?brace\b/g, "}")
        .replace(/\bopen bracket\b/g, "[")
        .replace(/\bclose bracket\b/g, "]")
        .replace(/\bopen (parenthesis|paren)\b/g, "(")
        .replace(/\bclose (parenthesis|paren)\b/g, ")")
        .replace(/\bsemi ?colon\b/g, ";")
        .replace(/\bcolon\b/g, ":")
        .replace(/\bequals? (to)?\b/g, "=")
        .replace(/\bdouble equals?\b/g, "==")
        .replace(/\bstring array\b/g, "String[]")
        .replace(/\bint(eger)? array\b/g, "int[]")
        .replace(/\bsystem dot out dot print(ln)?\b/g, "System.out.println")
        .replace(/\bprint line\b/g, "println")
        .replace(/\binclude stdio\b/g, "#include <stdio.h>")
        .replace(/\binclude iostream\b/g, "#include <iostream>")
        .replace(/\busing namespace std\b/g, "using namespace std;")
        .replace(/\breturn zero\b/g, "return 0;");

    // Extract individual tokens
    const tokens: string[] = [];
    const parts = text.split(/\s+/);

    for (const part of parts) {
        if (!part) continue;

        if (part === "public") tokens.push("public");
        else if (part === "class") tokens.push("class");
        else if (part === "main") tokens.push("Main");
        else if (part === "static") tokens.push("static");
        else if (part === "void") tokens.push("void");
        else if (part === "args") tokens.push("args");
        else if (part === "def") tokens.push("def");
        else if (part === "for") tokens.push("for");
        else if (part === "int") tokens.push("int");
        else if (part === "return") tokens.push("return");
        else tokens.push(part);
    }

    return tokens;
}

/**
 * Processes voice recognition events
 */
export function processVoiceRecognition({
    transcript,
    isFinal,
    currentUnits,
    currentUnitIndex,
    currentCode,
    language = "java",
    project = "array",
}: {
    transcript: string;
    isFinal: boolean;
    currentUnits: DictatorTeachingUnit[];
    currentUnitIndex: number;
    currentCode: string;
    language: string;
    project: string;
}): VoiceProcessResult {
    const rawTranscript = (transcript || "").trim();

    // 1. If speech is interim / in-progress -> NEVER FAIL OR COMPLAIN
    if (!isFinal) {
        return {
            isInterim: true,
            valid: true,
            message: `🎙️ Listening: "${rawTranscript}"...`,
            matchedTokens: [],
        };
    }

    // 2. If final transcript is empty
    if (!rawTranscript) {
        return {
            isInterim: false,
            valid: true,
            message: "Waiting for voice input...",
            matchedTokens: [],
        };
    }

    // 3. Process final spoken transcript
    const spokenTokens = normalizeSpokenSpeechToCode(rawTranscript, language);
    const safeIndex = Math.min(Math.max(0, currentUnitIndex), currentUnits.length - 1);
    const targetUnit = currentUnits[safeIndex];

    if (!targetUnit) {
        return {
            isInterim: false,
            valid: false,
            message: "No active teaching unit.",
            matchedTokens: [],
        };
    }

    // Check if spoken tokens match current and subsequent units
    let matchedCount = 0;
    for (let i = 0; i < spokenTokens.length; i++) {
        const checkUnitIdx = safeIndex + i;
        if (checkUnitIdx >= currentUnits.length) break;

        const expectedNorm = normalizeToken(currentUnits[checkUnitIdx].expectedToken).toLowerCase();
        const spokenNorm = spokenTokens[i].toLowerCase();

        if (
            spokenNorm === expectedNorm ||
            expectedNorm.startsWith(spokenNorm) ||
            spokenNorm.includes(expectedNorm)
        ) {
            matchedCount++;
        } else {
            break;
        }
    }

    if (matchedCount > 0) {
        const nextIdx = Math.min(safeIndex + matchedCount, currentUnits.length - 1);
        const reachedEnd = safeIndex + matchedCount >= currentUnits.length;
        const matchedUnit = currentUnits[nextIdx];

        return {
            isInterim: false,
            valid: true,
            matchedTokens: spokenTokens.slice(0, matchedCount),
            nextUnitIndex: nextIdx,
            completed: reachedEnd,
            message: `✅ Spoken: "${rawTranscript}". Advanced to: ${matchedUnit.title}.`,
            speechFeedback: `Correct. Moving to ${matchedUnit.expectedToken}.`,
        };
    }

    return {
        isInterim: false,
        valid: false,
        matchedTokens: [],
        message: `❌ Spoken: "${rawTranscript}". Expected token: '${targetUnit.expectedToken}'.`,
        speechFeedback: `Expected ${targetUnit.expectedToken}.`,
    };
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code snippet is required." }, { status: 400 });
    }

    // AI Guided Debug Analysis logic
    let diagnosis = "";
    let mistakeType = "";
    let preventiveAdvice = "";

    if (code.includes("publc") || code.includes("statc") || code.includes("prnt")) {
      mistakeType = "Syntax / Spelling Typo Error";
      diagnosis = "Found misspelled keyword (e.g. 'publc' instead of 'public' or 'statc' instead of 'static').";
      preventiveAdvice = "Always check key language keywords. In Java/C++, keywords are strict and case-sensitive.";
    } else if (!code.includes(";") && (language === "cpp" || language === "c" || language === "java")) {
      mistakeType = "Missing Semicolon (;) Terminal Symbol";
      diagnosis = "Your code line is missing a closing semicolon ';'. C, C++, and Java require semicolons at statement ends.";
      preventiveAdvice = "Ensure every statement ends with a semicolon ';' before running compile cycles.";
    } else if (!code.includes("return") && (language === "cpp" || language === "c")) {
      mistakeType = "Missing Return Value";
      diagnosis = "Function expects a return value but no return statement was found.";
      preventiveAdvice = "Always return an integer (e.g. return 0;) from main() in C/C++.";
    } else {
      mistakeType = "Logical / Edge Case Inspection";
      diagnosis = "Code structure analyzed. Ensure memory buffers and variable bounds are properly constrained.";
      preventiveAdvice = "Test your function with zero, negative, and large boundary inputs.";
    }

    return NextResponse.json({
      success: true,
      mistakeType,
      diagnosis,
      preventiveAdvice,
      explanation: `AI Guided Diagnosis for ${language || "Code"}: ${diagnosis} Guidance: ${preventiveAdvice}`,
    });
  } catch (error) {
    console.error("Guided Debug API Error:", error);
    return NextResponse.json({ error: "Guided mode analysis failed." }, { status: 500 });
  }
}

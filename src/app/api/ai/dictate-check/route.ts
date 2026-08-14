import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, targetLine } = await req.json();

    if (!code) {
      return NextResponse.json({ hasError: false });
    }

    const lines = code.split("\n");
    let errorFound = false;
    let spokenWarning = "";
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("publc")) {
        errorFound = true;
        lineNumber = i + 1;
        spokenWarning = `Spelling mistake on line ${lineNumber}! 'publc' is incorrect. Type 'public' instead.`;
        break;
      }
      if (line.includes("statc")) {
        errorFound = true;
        lineNumber = i + 1;
        spokenWarning = `Spelling mistake on line ${lineNumber}! 'statc' is incorrect. Type 'static' instead.`;
        break;
      }
      if (line.includes("mainn")) {
        errorFound = true;
        lineNumber = i + 1;
        spokenWarning = `Spelling mistake on line ${lineNumber}! 'mainn' is incorrect. Type 'main' instead.`;
        break;
      }
      if (line.includes("prnt") || line.includes("prinln")) {
        errorFound = true;
        lineNumber = i + 1;
        spokenWarning = `Spelling mistake on line ${lineNumber}! Check print function spelling.`;
        break;
      }
    }

    return NextResponse.json({
      hasError: errorFound,
      lineNumber,
      spokenWarning,
    });
  } catch (error) {
    console.error("Dictator Check Error:", error);
    return NextResponse.json({ hasError: false });
  }
}

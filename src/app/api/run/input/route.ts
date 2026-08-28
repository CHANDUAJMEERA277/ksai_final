import { NextResponse } from "next/server";
import { sendInputToSession } from "@/lib/interactive-process";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, input = "" } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId." },
        { status: 400 }
      );
    }

    const success = sendInputToSession(sessionId, input);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Session not found or already terminated." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send input." },
      { status: 500 }
    );
  }
}

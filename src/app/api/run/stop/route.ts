import { NextResponse } from "next/server";
import { cleanupSession } from "@/lib/interactive-process";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (sessionId) {
      cleanupSession(sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to stop session." },
      { status: 500 }
    );
  }
}

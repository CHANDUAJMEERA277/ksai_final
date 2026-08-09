import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: req.headers });
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    // Delete user from SQLite database. Cascades delete all relations.
    await db.user.delete({
      where: { id: userId },
    });

    // Clear session cookies in browser
    const response = NextResponse.json({ success: true });
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}

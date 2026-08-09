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

    const body = await req.json();
    const { name, phone, college, department, currentYear, country } = body;

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        name: name || "",
        phone: phone || null,
        college: college || null,
        department: department || null,
        currentYear: currentYear || null,
        country: country || "United States",
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

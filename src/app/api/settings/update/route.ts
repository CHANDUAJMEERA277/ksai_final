import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSessionToken } from "@/lib/auth-cookie";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionTokenRaw =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let userId = (session?.user as any)?.id;

    if (!userId && sessionTokenRaw) {
      const rawToken = parseSessionToken(sessionTokenRaw);
      const dbSession = await db.session.findUnique({
        where: { token: rawToken },
        select: { userId: true, expiresAt: true },
      });
      if (dbSession && new Date() < dbSession.expiresAt) {
        userId = dbSession.userId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, currentYear, country } = body;

    // Only allow updating editable fields (Phone, Current Year, Country)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(currentYear !== undefined && { currentYear: currentYear ? currentYear.trim() : null }),
        ...(country !== undefined && { country: country ? country.trim() : null }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile settings updated successfully!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        college: updatedUser.college,
        department: updatedUser.department,
        currentYear: updatedUser.currentYear,
        country: updatedUser.country,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile settings." },
      { status: 500 }
    );
  }
}

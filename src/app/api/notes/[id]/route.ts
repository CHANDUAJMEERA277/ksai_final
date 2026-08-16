import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSessionToken } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    return session.user;
  }

  const cookieStore = await cookies();

  const token =
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("sessionToken")?.value;

  if (!token) {
    return null;
  }

  const rawToken = parseSessionToken(token);

  const dbSession = await db.session.findUnique({
    where: {
      token: rawToken,
    },
    include: {
      user: true,
    },
  });

  if (!dbSession || new Date() >= dbSession.expiresAt) {
    return null;
  }

  return dbSession.user;
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const note = await db.learningNote.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          error: "Note not found.",
        },
        { status: 404 }
      );
    }

    await db.learningNote.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted.",
    });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete note.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }
    // Check if the user already exists
let user = await db.user.findUnique({
  where: {
    email: email.toLowerCase(),
  },
});
// If the user doesn't exist, create a new Google account
if (!user) {
  user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: null,
      provider: "GOOGLE",
      role: "Student",
      country: "United States",
    },
  });
}
// Delete any previous sessions (One device login)
await db.session.deleteMany({
  where: {
    userId: user.id,
  },
});
// Create a new session
const session = await db.session.create({
  data: {
    userId: user.id,
    token: randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
});
// Create the response
const response = NextResponse.json({
  message: "Google login successful.",
  user,
});

// Set the session cookie
response.cookies.set("sessionToken", session.token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: session.expiresAt,
  path: "/",
});

return response;

  } catch (error) {
    console.error("Google Login Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
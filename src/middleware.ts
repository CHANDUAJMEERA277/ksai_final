import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  if (isProtectedRoute) {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value ||
      request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};


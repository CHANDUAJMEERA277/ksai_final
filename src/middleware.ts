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
    // Check any valid session token cookie name (with underscore, hyphen, or standard prefixes)
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session-token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session-token")?.value ||
      request.cookies.get("session_token")?.value ||
      request.cookies.get("session-token")?.value ||
      request.cookies.get("ksai_session")?.value;

    const allCookies = request.cookies.getAll();
    const hasAnySession =
      Boolean(sessionToken) ||
      allCookies.some(
        (c) =>
          c.name.includes("session") ||
          c.name.includes("better-auth") ||
          c.name.includes("auth")
      );

    if (!hasAnySession) {
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

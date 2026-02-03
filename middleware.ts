// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Always allow login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Allow login/logout API handlers if you use them
  // (Adjust if your login route is different)
  if (pathname.startsWith("/api/admin/login") || pathname.startsWith("/api/admin/logout")) {
    return NextResponse.next();
  }

  // Verify signed session token
  const token = request.cookies.get("err_session")?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Optional: server-side access block example
  // If you don't want middleware doing RBAC, delete this block.
  if (pathname.startsWith("/admin/users") && session.role !== "SUPER_ADMIN") {
    return new NextResponse("Access denied", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

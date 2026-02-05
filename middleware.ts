// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/*
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow the login page
  if (pathname === "/admin/login") return NextResponse.next();

  // Allow auth endpoints (VERY IMPORTANT)
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  // Auth cookies (set by your login route)
  const userId = req.cookies.get("err_user_id")?.value;
  const role = req.cookies.get("err_role")?.value;

  if (!userId || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Example access block:
  if (pathname.startsWith("/admin/users") && role !== "SUPER_ADMIN") {
    return new NextResponse("Access denied", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

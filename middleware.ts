// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow login page + login POST handler
  if (pathname === "/admin/login") return NextResponse.next();

  // Auth cookies (set by app/admin/login/route.ts)
  const userId = req.cookies.get("err_user_id")?.value;
  const role = req.cookies.get("err_role")?.value;

  if (!userId || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Server-side access block example:
  if (pathname.startsWith("/admin/users") && role !== "SUPER_ADMIN") {
    return new NextResponse("Access denied", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

// app/admin/logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url), 303);

  res.cookies.set("err_user_id", "", { path: "/", maxAge: 0 });
  res.cookies.set("err_role", "", { path: "/", maxAge: 0 });

  return res;
}

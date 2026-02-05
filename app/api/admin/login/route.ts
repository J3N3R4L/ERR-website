// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();

  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");

  // Basic validation
  if (!email || !password) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("error", "missing");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, password_hash: true, is_active: true },
  });

  if (!user || !user.is_active) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("error", "invalid");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("error", "invalid");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  const maxAge = 60 * 60 * 24 * 7;

  res.cookies.set("err_user_id", user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  res.cookies.set("err_role", user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return res;
}

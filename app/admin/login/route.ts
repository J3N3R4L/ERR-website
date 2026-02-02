import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.is_active) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const token = createSessionToken({ userId: user.id, role: user.role });
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set("err_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return response;
}

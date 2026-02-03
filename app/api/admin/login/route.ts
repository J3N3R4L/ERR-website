import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      role: true,
      is_active: true,
    },
  });

  if (!user || !user.is_active) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const token = createSessionToken({ userId: user.id, role: user.role });

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set("err_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

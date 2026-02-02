import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || !canManageUsers(session.role as never)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "EDITOR") as never;
  const is_active = String(formData.get("is_active") || "true") === "true";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  const password_hash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      password_hash,
      role,
      is_active
    }
  });

  return NextResponse.redirect(new URL("/admin/users", request.url));
}

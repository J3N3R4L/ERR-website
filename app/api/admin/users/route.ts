import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const sessionUser = await getSessionUserFromRequest(request);
  if (!canManageUsers(sessionUser)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "EDITOR");
  const is_active = String(formData.get("is_active") || "true") === "true";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  const password_hash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      role,
      is_active
    },
    select: { id: true }
  });

  await logAudit({
    userId: sessionUser?.id ?? null,
    action: "create",
    entityType: "user",
    entityId: user.id,
    meta: { email, role }
  });

  return NextResponse.redirect(new URL("/admin/users", request.url));
}

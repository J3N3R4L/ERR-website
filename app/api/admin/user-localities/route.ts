import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/session";
import { canAssignLocalities } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const sessionUser = await getSessionUserFromRequest(request);
  if (!canAssignLocalities(sessionUser)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const formData = await request.formData();
  const action = String(formData.get("action") || "assign");
  const user_id = String(formData.get("user_id") || "");
  const locality_id = String(formData.get("locality_id") || "");

  if (!user_id || !locality_id) {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  if (action === "remove") {
    await prisma.userLocalityAccess.deleteMany({
      where: { user_id, locality_id }
    });

    await logAudit({
      userId: sessionUser?.id ?? null,
      action: "remove",
      entityType: "user_locality_access",
      entityId: null,
      meta: { user_id, locality_id }
    });

    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  await prisma.userLocalityAccess.create({
    data: {
      user_id,
      locality_id
    }
  });

  await logAudit({
    userId: sessionUser?.id ?? null,
    action: "assign",
    entityType: "user_locality_access",
    entityId: null,
    meta: { user_id, locality_id }
  });

  return NextResponse.redirect(new URL("/admin/users", request.url));
}

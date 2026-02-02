import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { canManageLocalities } from "@/lib/rbac";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || !canManageLocalities(session.role as never)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const formData = await request.formData();
  const name_en = String(formData.get("name_en") || "");
  const name_ar = String(formData.get("name_ar") || "");
  const slug = String(formData.get("slug") || "");
  const description_en = String(formData.get("description_en") || "");
  const description_ar = String(formData.get("description_ar") || "");

  if (!name_en || !name_ar || !slug) {
    return NextResponse.redirect(new URL("/admin/localities", request.url));
  }

  await prisma.locality.create({
    data: {
      name_en,
      name_ar,
      slug,
      description_en: description_en || null,
      description_ar: description_ar || null
    }
  });

  return NextResponse.redirect(new URL("/admin/localities", request.url));
}

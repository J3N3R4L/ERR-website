import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/session";
import { canPublish } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const sessionUser = await getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const title_en = String(formData.get("title_en") || "").trim();
  const title_ar = String(formData.get("title_ar") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const excerpt_en = String(formData.get("excerpt_en") || "").trim();
  const excerpt_ar = String(formData.get("excerpt_ar") || "").trim();
  const body_en = String(formData.get("body_en") || "").trim();
  const body_ar = String(formData.get("body_ar") || "").trim();
  const requestedStatus = String(formData.get("status") || "DRAFT");
  const locality_id = String(formData.get("locality_id") || "").trim() || null;

  if (!title_en || !title_ar || !slug || !excerpt_en || !excerpt_ar || !body_en || !body_ar) {
    return NextResponse.redirect(new URL("/admin/news/new", request.url));
  }

  const existingSlug = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (existingSlug) {
    return NextResponse.redirect(new URL("/admin/news/new?error=slug", request.url));
  }

  const canSelectAnyLocality =
    sessionUser.role === "SUPER_ADMIN" || sessionUser.role === "STATE_ADMIN";
  let finalLocalityId = locality_id;

  if (!canSelectAnyLocality) {
    const access = await prisma.userLocalityAccess.findMany({
      where: { user_id: sessionUser.id },
      select: { locality_id: true }
    });
    const allowedIds = access.map((entry: { locality_id: string }) => entry.locality_id);
    finalLocalityId = allowedIds[0] ?? null;

    if (!finalLocalityId || (locality_id && !allowedIds.includes(locality_id))) {
      return NextResponse.redirect(new URL("/admin/news/new?error=locality", request.url));
    }
  }

  const status = canPublish(sessionUser) && requestedStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const post = await prisma.post.create({
    data: {
      type: "NEWS",
      title_en,
      title_ar,
      slug,
      excerpt_en,
      excerpt_ar,
      body_en,
      body_ar,
      locality_id: finalLocalityId,
      status,
      published_at: status === "PUBLISHED" ? new Date() : null,
      created_by: sessionUser.id
    },
    select: { id: true }
  });

  await logAudit({
    userId: sessionUser.id,
    action: status === "PUBLISHED" ? "publish" : "create",
    entityType: "news",
    entityId: post.id,
    meta: { status }
  });

  return NextResponse.redirect(new URL("/admin/news", request.url));
}

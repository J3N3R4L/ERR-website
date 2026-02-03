import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/session";
import { canPublish } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, type: true, status: true, locality_id: true }
  });
  if (!post || post.type !== "NEWS") {
    return NextResponse.redirect(new URL("/admin/news", request.url));
  }

  const formData = await request.formData();
  const title_en = String(formData.get("title_en") || "").trim();
  const title_ar = String(formData.get("title_ar") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const excerpt_en = String(formData.get("excerpt_en") || "").trim();
  const excerpt_ar = String(formData.get("excerpt_ar") || "").trim();
  const body_en = String(formData.get("body_en") || "").trim();
  const body_ar = String(formData.get("body_ar") || "").trim();
  const requestedStatus = String(formData.get("status") || post.status);
  const locality_id = String(formData.get("locality_id") || "").trim() || null;

  if (!title_en || !title_ar || !slug || !excerpt_en || !excerpt_ar || !body_en || !body_ar) {
    return NextResponse.redirect(new URL(`/admin/news/${params.id}/edit`, request.url));
  }

  const existingSlug = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (existingSlug && existingSlug.id !== post.id) {
    return NextResponse.redirect(new URL(`/admin/news/${params.id}/edit?error=slug`, request.url));
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

    if (!post.locality_id || !allowedIds.includes(post.locality_id)) {
      return NextResponse.redirect(new URL("/admin/news", request.url));
    }

    finalLocalityId = post.locality_id;
  }

  const status = canPublish(sessionUser) && requestedStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  await prisma.post.update({
    where: { id: post.id },
    data: {
      title_en,
      title_ar,
      slug,
      excerpt_en,
      excerpt_ar,
      body_en,
      body_ar,
      locality_id: finalLocalityId,
      status,
      published_at: status === "PUBLISHED" ? new Date() : null
    }
  });

  if (post.status !== status) {
    await logAudit({
      userId: sessionUser.id,
      action: status === "PUBLISHED" ? "publish" : "unpublish",
      entityType: "news",
      entityId: post.id,
      meta: { previous: post.status, next: status }
    });
  } else {
    await logAudit({
      userId: sessionUser.id,
      action: "update",
      entityType: "news",
      entityId: post.id
    });
  }

  return NextResponse.redirect(new URL("/admin/news", request.url));
}

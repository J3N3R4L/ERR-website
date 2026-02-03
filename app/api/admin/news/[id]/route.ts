import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const form = await request.formData();
  const action = String(form.get("action") || "");

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post || post.type !== "NEWS") {
    return NextResponse.redirect(new URL("/admin/news", request.url), 303);
  }

  const canSelectAnyLocality =
    session.role === "SUPER_ADMIN" || session.role === "STATE_ADMIN";

  if (!canSelectAnyLocality) {
    const access: Array<{ locality_id: string }> = await prisma.userLocalityAccess.findMany({
    where: { user_id: session.id },
    select: { locality_id: true },
    });
    const allowedIds = access.map((entry) => entry.locality_id);


    if (!post.locality_id || !allowedIds.includes(post.locality_id)) {
      return NextResponse.redirect(new URL("/admin/news", request.url), 303);
    }
  }

  // EDITOR cannot publish/unpublish
  if (session.role === "EDITOR" && action !== "update") {
    return NextResponse.redirect(new URL("/admin/news", request.url), 303);
  }

  if (action === "update") {
    const title_en = String(form.get("title_en") || "").trim();
    const title_ar = String(form.get("title_ar") || "").trim();
    const slug = String(form.get("slug") || "").trim();
    const excerpt_en = String(form.get("excerpt_en") || "");
    const excerpt_ar = String(form.get("excerpt_ar") || "");
    const body_en = String(form.get("body_en") || "");
    const body_ar = String(form.get("body_ar") || "");
    const status = String(form.get("status") || "DRAFT");
    const locality_id_raw = String(form.get("locality_id") || "");
    const locality_id = locality_id_raw.length ? locality_id_raw : null;

    // Locality admins must not change locality_id
    let finalLocalityId = locality_id;
    if (!canSelectAnyLocality) {
      finalLocalityId = post.locality_id ?? null;
    }

    // Publishing gate
    const wantsPublish = status === "PUBLISHED";
    const canPublishRole =
      session.role === "SUPER_ADMIN" ||
      session.role === "STATE_ADMIN" ||
      session.role === "LOCALITY_ADMIN";

    const nextStatus = wantsPublish && canPublishRole ? "PUBLISHED" : "DRAFT";
    const nextPublishedAt = nextStatus === "PUBLISHED" ? new Date() : null;

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
        status: nextStatus as any,
        published_at: nextPublishedAt,
      },
    });

    return NextResponse.redirect(
      new URL(`/admin/news/${post.id}/edit`, request.url),
      303
    );
  }

  if (action === "publish") {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "PUBLISHED", published_at: new Date() },
    });
    return NextResponse.redirect(
      new URL(`/admin/news/${post.id}/edit`, request.url),
      303
    );
  }

  if (action === "unpublish") {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "DRAFT", published_at: null },
    });
    return NextResponse.redirect(
      new URL(`/admin/news/${post.id}/edit`, request.url),
      303
    );
  }

  return NextResponse.redirect(new URL("/admin/news", request.url), 303);
}

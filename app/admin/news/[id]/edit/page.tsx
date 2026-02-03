import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canPublish } from "@/lib/rbac";

type LocalityLite = { id: string; name_en: string; name_ar: string; slug: string };

type AccessEntry = {
  locality_id: string;
  locality: LocalityLite;
};

type PostRow = {
  id: string;
  type: string;
  title_en: string;
  title_ar: string;
  slug: string;
  excerpt_en: string | null;
  excerpt_ar: string | null;
  body_en: string | null;
  body_ar: string | null;
  status: string;
  locality_id: string | null;
};

export default async function NewsEditPage({
  params,
}: {
  params: { id: string };
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return (
      <main className="container py-10">
        <p className="text-red-600">Please log in.</p>
      </main>
    );
  }

  const post: PostRow | null = await prisma.post.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      type: true,
      title_en: true,
      title_ar: true,
      slug: true,
      excerpt_en: true,
      excerpt_ar: true,
      body_en: true,
      body_ar: true,
      status: true,
      locality_id: true,
    },
  });

  if (!post || post.type !== "NEWS") {
    notFound();
  }

  const role = sessionUser.role;
  const canSelectAnyLocality = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  // Force type so TS never treats it as any[]
  const access: AccessEntry[] = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    select: {
      locality_id: true,
      locality: {
        select: { id: true, name_en: true, name_ar: true, slug: true },
      },
    },
  });

  const localityIds = access.map((entry: AccessEntry) => entry.locality_id);

  if (!canSelectAnyLocality && (!post.locality_id || !localityIds.includes(post.locality_id))) {
    return (
      <main className="container py-10">
        <p className="text-red-600">You do not have access to this post.</p>
      </main>
    );
  }

  const accessibleLocalities: LocalityLite[] = canSelectAnyLocality
    ? await prisma.locality.findMany({
        orderBy: { name_en: "asc" },
        select: { id: true, name_en: true, name_ar: true, slug: true },
      })
    : access.map((entry: AccessEntry) => entry.locality);

  const publishAllowed = canPublish(sessionUser);

  return (
    <main className="container py-10">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Edit News Post</h2>

        {/* Post to API route (avoid /admin/.../route.ts conflicts) */}
        <form method="post" action={`/api/admin/news/${post.id}`} className="grid gap-4">
          <input type="hidden" name="action" value="update" />

          <label className="block text-sm">
            Title (EN)
            <input
              name="title_en"
              required
              defaultValue={post.title_en}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Title (AR)
            <input
              name="title_ar"
              required
              defaultValue={post.title_ar}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Slug
            <input
              name="slug"
              required
              defaultValue={post.slug}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Excerpt (EN)
            <textarea
              name="excerpt_en"
              rows={2}
              required
              defaultValue={post.excerpt_en ?? ""}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Excerpt (AR)
            <textarea
              name="excerpt_ar"
              rows={2}
              required
              defaultValue={post.excerpt_ar ?? ""}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Body (EN)
            <textarea
              name="body_en"
              rows={8}
              required
              defaultValue={post.body_en ?? ""}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Body (AR)
            <textarea
              name="body_ar"
              rows={8}
              required
              defaultValue={post.body_ar ?? ""}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>

          {canSelectAnyLocality ? (
            <label className="block text-sm">
              Locality (optional)
              <select
                name="locality_id"
                defaultValue={post.locality_id ?? ""}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              >
                <option value="">Global</option>
                {accessibleLocalities.map((locality: LocalityLite) => (
                  <option key={locality.id} value={locality.id}>
                    {locality.name_en}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" name="locality_id" value={post.locality_id ?? ""} />
          )}

          <label className="block text-sm">
            Status
            <select
              name="status"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              defaultValue={post.status}
            >
              <option value="DRAFT">Draft</option>
              {publishAllowed ? <option value="PUBLISHED">Published</option> : null}
            </select>
          </label>

          <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-white">
            Save changes
          </button>
        </form>

        {/* Optional quick publish/unpublish buttons */}
        <div className="flex gap-2">
          {publishAllowed ? (
            <>
              <form method="post" action={`/api/admin/news/${post.id}`}>
                <input type="hidden" name="action" value="publish" />
                <button className="rounded border border-slate-300 px-4 py-2">Publish</button>
              </form>

              <form method="post" action={`/api/admin/news/${post.id}`}>
                <input type="hidden" name="action" value="unpublish" />
                <button className="rounded border border-slate-300 px-4 py-2">Unpublish</button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

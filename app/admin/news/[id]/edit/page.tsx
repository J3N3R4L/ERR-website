import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canPublish } from "@/lib/rbac";

export default async function NewsEditPage({ params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return <p className="text-red-600">Please log in.</p>;
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { locality: true }
  });

  if (!post || post.type !== "NEWS") {
    notFound();
  }

  const role = sessionUser.role;
  const canSelectAnyLocality = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    include: { locality: true }
  });
  const localityIds = access.map((entry) => entry.locality_id);

  if (!canSelectAnyLocality && (!post.locality_id || !localityIds.includes(post.locality_id))) {
    return <p className="text-red-600">You do not have access to this post.</p>;
  }

  const accessibleLocalities = canSelectAnyLocality
    ? await prisma.locality.findMany({ orderBy: { name_en: "asc" } })
    : access.map((entry) => entry.locality);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Edit News Post</h2>
      <form method="post" action={`/admin/news/${post.id}`} className="grid gap-4">
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
              {accessibleLocalities.map((locality) => (
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
            {canPublish(role) && <option value="PUBLISHED">Published</option>}
          </select>
        </label>
        <button
          type="submit"
          className="w-fit rounded bg-slate-900 px-4 py-2 text-white"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}

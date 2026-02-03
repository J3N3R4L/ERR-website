import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canPublish } from "@/lib/rbac";

type LocalityOption = {
  id: string;
  name_en: string;
};

type AccessEntry = {
  locality_id: string;
  locality: { id: string; name_en: string };
};

type NewsPost = {
  id: string;
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

export default async function NewsEditPage({ params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return <p className="text-red-600">Please log in.</p>;
  }

  const post = await prisma.post.findUnique({
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
      locality_id: true
    }
  });

  if (!post || post.type !== "NEWS") {
    notFound();
  }

  const canSelectAnyLocality =
    sessionUser.role === "SUPER_ADMIN" || sessionUser.role === "STATE_ADMIN";

  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    select: { locality_id: true, locality: { select: { id: true, name_en: true } } }
  });
  const localityIds = access.map((entry: AccessEntry) => entry.locality_id);

  if (!canSelectAnyLocality && (!post.locality_id || !localityIds.includes(post.locality_id))) {
    return <p className="text-red-600">You do not have access to this post.</p>;
  }

  const accessibleLocalities = canSelectAnyLocality
    ? await prisma.locality.findMany({
        orderBy: { name_en: "asc" },
        select: { id: true, name_en: true }
      })
    : access.map((entry: AccessEntry) => entry.locality);

  const typedPost = post as NewsPost;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Edit News Post</h2>
      <form method="post" action={`/api/admin/news/${typedPost.id}`} className="grid gap-4">
        <label className="block text-sm">
          Title (EN)
          <input
            name="title_en"
            required
            defaultValue={typedPost.title_en}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Title (AR)
          <input
            name="title_ar"
            required
            defaultValue={typedPost.title_ar}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Slug
          <input
            name="slug"
            required
            defaultValue={typedPost.slug}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Excerpt (EN)
          <textarea
            name="excerpt_en"
            rows={2}
            required
            defaultValue={typedPost.excerpt_en ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Excerpt (AR)
          <textarea
            name="excerpt_ar"
            rows={2}
            required
            defaultValue={typedPost.excerpt_ar ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Body (EN)
          <textarea
            name="body_en"
            rows={8}
            required
            defaultValue={typedPost.body_en ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Body (AR)
          <textarea
            name="body_ar"
            rows={8}
            required
            defaultValue={typedPost.body_ar ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        {canSelectAnyLocality ? (
          <label className="block text-sm">
            Locality (optional)
            <select
              name="locality_id"
              defaultValue={typedPost.locality_id ?? ""}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              <option value="">Global</option>
              {accessibleLocalities.map((locality: LocalityOption) => (
                <option key={locality.id} value={locality.id}>
                  {locality.name_en}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="locality_id" value={typedPost.locality_id ?? ""} />
        )}
        <label className="block text-sm">
          Status
          <select
            name="status"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={typedPost.status}
          >
            <option value="DRAFT">Draft</option>
            {canPublish(sessionUser) && <option value="PUBLISHED">Published</option>}
          </select>
        </label>
        <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-white">
          Save changes
        </button>
      </form>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canPublish } from "@/lib/rbac";

type LocalityOption = {
  id: string;
  name_en: string;
};

type AccessEntry = {
  locality: { id: string; name_en: string };
};

export default async function NewsNewPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return <p className="text-red-600">Please log in.</p>;
  }

  const canSelectAnyLocality =
    sessionUser.role === "SUPER_ADMIN" || sessionUser.role === "STATE_ADMIN";

  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    select: { locality: { select: { id: true, name_en: true } } }
  });

  const accessibleLocalities = canSelectAnyLocality
    ? await prisma.locality.findMany({
        orderBy: { name_en: "asc" },
        select: { id: true, name_en: true }
      })
    : access.map((entry: AccessEntry) => entry.locality);

  if (!canSelectAnyLocality && accessibleLocalities.length === 0) {
    return <p className="text-red-600">No locality access assigned.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">New News Post</h2>
      <form method="post" action="/api/admin/news" className="grid gap-4">
        <label className="block text-sm">
          Title (EN)
          <input
            name="title_en"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Title (AR)
          <input
            name="title_ar"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Slug
          <input
            name="slug"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Excerpt (EN)
          <textarea
            name="excerpt_en"
            rows={2}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Excerpt (AR)
          <textarea
            name="excerpt_ar"
            rows={2}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Body (EN)
          <textarea
            name="body_en"
            rows={8}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Body (AR)
          <textarea
            name="body_ar"
            rows={8}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        {canSelectAnyLocality ? (
          <label className="block text-sm">
            Locality (optional)
            <select
              name="locality_id"
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
          <input type="hidden" name="locality_id" value={accessibleLocalities[0].id} />
        )}
        <label className="block text-sm">
          Status
          <select
            name="status"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue="DRAFT"
          >
            <option value="DRAFT">Draft</option>
            {canPublish(sessionUser) && <option value="PUBLISHED">Published</option>}
          </select>
        </label>
        <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-white">
          Create news post
        </button>
      </form>
    </div>
  );
}

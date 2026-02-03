import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canManageLocalities } from "@/lib/rbac";

type LocalityRow = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  created_at: Date;
};

export default async function LocalitiesPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="container py-10">
        <p className="text-red-600">Please log in.</p>
      </main>
    );
  }

  if (!canManageLocalities(user)) {
    return (
      <main className="container py-10">
        <p className="text-red-600">You do not have access to manage localities.</p>
      </main>
    );
  }

  const localities: LocalityRow[] = await prisma.locality.findMany({
    orderBy: { created_at: "desc" },
    select: { id: true, name_en: true, name_ar: true, slug: true, created_at: true },
  });

  return (
    <main className="container py-10 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Localities</h2>
        <p className="text-slate-600">Manage locality profiles and coverage.</p>
      </div>

      {/* IMPORTANT: use API route (avoid route.ts conflicts under /admin) */}
      <form method="post" action="/api/admin/localities" className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="action" value="create" />

        <label className="block text-sm">
          Name (EN)
          <input
            name="name_en"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Name (AR)
          <input
            name="name_ar"
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
          Description (EN)
          <textarea
            name="description_en"
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Description (AR)
          <textarea
            name="description_ar"
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="col-span-full w-fit rounded bg-slate-900 px-4 py-2 text-white"
        >
          Create locality
        </button>
      </form>

      <div className="rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Name (EN)</th>
              <th className="p-3">Name (AR)</th>
              <th className="p-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {localities.map((locality: LocalityRow) => (
              <tr key={locality.id} className="border-b">
                <td className="p-3">{locality.name_en}</td>
                <td className="p-3">{locality.name_ar}</td>
                <td className="p-3">{locality.slug}</td>
              </tr>
            ))}

            {localities.length === 0 ? (
              <tr>
                <td className="p-6 text-slate-600" colSpan={3}>
                  No localities found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canManageLocalities } from "@/lib/rbac";

export default async function LocalitiesPage() {
  const sessionUser = await getSessionUser();
  const role = sessionUser?.role ?? "EDITOR";
  const localities = await prisma.locality.findMany({ orderBy: { created_at: "desc" } });

  if (!canManageLocalities(role)) {
    return <p className="text-red-600">You do not have access to manage localities.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Localities</h2>
        <p className="text-slate-600">Manage locality profiles and coverage.</p>
      </div>
      <form method="post" action="/admin/localities" className="grid gap-4 md:grid-cols-2">
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
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {localities.map((locality) => (
              <tr key={locality.id} className="border-b">
                <td className="p-3">{locality.name_en}</td>
                <td className="p-3">{locality.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

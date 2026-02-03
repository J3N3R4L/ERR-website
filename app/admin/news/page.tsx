import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

type AccessEntry = { locality_id: string };

type AdminNewsRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  status: string;
  created_at: Date;
  published_at: Date | null;
  locality: { id: string; name_en: string } | null;
};

export default async function AdminNewsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return (
      <main className="container py-10">
        <p className="text-red-600">Please log in.</p>
      </main>
    );
  }

  const role = sessionUser.role;
  const canSeeAll = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const access: AccessEntry[] = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    select: { locality_id: true },
  });

  const localityIds = access.map((entry) => entry.locality_id);

  const posts: AdminNewsRow[] = await prisma.post.findMany({
    where: canSeeAll
      ? { type: "NEWS" }
      : { type: "NEWS", locality_id: { in: localityIds } },
    orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
    select: {
      id: true,
      slug: true,
      title_en: true,
      title_ar: true,
      status: true,
      created_at: true,
      published_at: true,
      locality: { select: { id: true, name_en: true } },
    },
  });

  return (
    <main className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">News</h1>
          <p className="text-slate-600">Manage published and draft news posts.</p>
        </div>

        <Link href="/admin/news/new" className="rounded bg-slate-900 px-4 py-2 text-white">
          New post
        </Link>
      </div>

      <div className="rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Locality</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="p-3">
                  <div className="font-medium">{post.title_en}</div>
                  <div className="text-slate-500">{post.title_ar}</div>
                </td>

                <td className="p-3">
                  {post.locality?.name_en ?? <span className="text-slate-500">Global</span>}
                </td>

                <td className="p-3">
                  <span className="rounded border border-slate-200 px-2 py-1">{post.status}</span>
                </td>

                <td className="p-3">
                  <Link href={`/admin/news/${post.id}/edit`} className="text-slate-900 underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {posts.length === 0 ? (
              <tr>
                <td className="p-6 text-slate-600" colSpan={4}>
                  No posts found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

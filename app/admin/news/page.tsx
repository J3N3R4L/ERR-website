import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export default async function NewsAdminPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return <p className="text-red-600">Please log in.</p>;
  }

  const role = sessionUser.role;
  const canAccessAll = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id }
  });
  const localityIds = access.map((entry) => entry.locality_id);

  const posts = await prisma.post.findMany({
    where: {
      type: "NEWS",
      ...(canAccessAll ? {} : { locality_id: { in: localityIds } })
    },
    include: { locality: true, author: true },
    orderBy: { created_at: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">News</h2>
          <p className="text-slate-600">Manage news posts and publishing.</p>
        </div>
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/admin/news/new">
          New post
        </Link>
      </div>
      <div className="rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Locality</th>
              <th className="p-3">Author</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="p-3">{post.title_en}</td>
                <td className="p-3">{post.status}</td>
                <td className="p-3">{post.locality?.name_en ?? "Global"}</td>
                <td className="p-3">{post.author.email}</td>
                <td className="p-3 text-right">
                  <Link className="text-slate-700 underline" href={`/admin/news/${post.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

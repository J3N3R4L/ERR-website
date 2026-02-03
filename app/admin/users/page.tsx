import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: Date;
};

export default async function AdminUsersPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return (
      <main className="container py-10">
        <p className="text-red-600">Please log in.</p>
      </main>
    );
  }

  // Only SUPER_ADMIN can manage users
  if (sessionUser.role !== "SUPER_ADMIN") {
    return (
      <main className="container py-10">
        <p className="text-red-600">Access denied.</p>
      </main>
    );
  }

  const users: AdminUserRow[] = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return (
    <main className="container py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-slate-600">Create and manage admin accounts.</p>
      </div>

      <form method="post" action="/api/admin/users" className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="action" value="create" />

        <label className="block text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Role
          <select
            name="role"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue="EDITOR"
          >
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="STATE_ADMIN">STATE_ADMIN</option>
            <option value="LOCALITY_ADMIN">LOCALITY_ADMIN</option>
            <option value="EDITOR">EDITOR</option>
          </select>
        </label>

        <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-white">
          Create user
        </button>
      </form>

      <div className="rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}

            {users.length === 0 ? (
              <tr>
                <td className="p-6 text-slate-600" colSpan={3}>
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

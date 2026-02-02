import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/rbac";

export default async function UsersPage() {
  const sessionUser = await getSessionUser();
  const role = sessionUser?.role ?? "EDITOR";
  const users = await prisma.user.findMany({ orderBy: { created_at: "desc" } });

  if (!canManageUsers(role)) {
    return <p className="text-red-600">You do not have access to manage users.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-slate-600">Create and manage admin accounts.</p>
      </div>
      <form method="post" action="/admin/users" className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="action" value="create" />
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Role
          <select
            name="role"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="STATE_ADMIN">STATE_ADMIN</option>
            <option value="LOCALITY_ADMIN">LOCALITY_ADMIN</option>
            <option value="EDITOR">EDITOR</option>
          </select>
        </label>
        <label className="block text-sm">
          Active
          <select
            name="is_active"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <button
          type="submit"
          className="col-span-full w-fit rounded bg-slate-900 px-4 py-2 text-white"
        >
          Create user
        </button>
      </form>
      <div className="rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

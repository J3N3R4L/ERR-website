import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canAssignLocalities, canManageUsers } from "@/lib/rbac";

type UserRow = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
};

type LocalityRow = {
  id: string;
  name_en: string;
};

type UserLocalityRow = {
  id: string;
  user: { id: string; email: string };
  locality: { id: string; name_en: string };
};

export default async function UsersPage() {
  const sessionUser = await getSessionUser();
  const canView = canManageUsers(sessionUser) || canAssignLocalities(sessionUser);

  if (!canView) {
    return <p className="text-red-600">You do not have access to manage users.</p>;
  }

  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true
    }
  });

  const localities = await prisma.locality.findMany({
    orderBy: { name_en: "asc" },
    select: { id: true, name_en: true }
  });

  const userLocalities = await prisma.userLocalityAccess.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true,
      user: { select: { id: true, email: true } },
      locality: { select: { id: true, name_en: true } }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-slate-600">Create and manage admin accounts.</p>
      </div>

      {canManageUsers(sessionUser) && (
        <form method="post" action="/api/admin/users" className="grid gap-4 md:grid-cols-2">
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
      )}

      {canAssignLocalities(sessionUser) && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Locality Access</h3>
          <form method="post" action="/api/admin/user-localities" className="grid gap-4 md:grid-cols-3">
            <input type="hidden" name="action" value="assign" />
            <label className="block text-sm">
              User
              <select
                name="user_id"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                required
              >
                {users.map((user: UserRow) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Locality
              <select
                name="locality_id"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                required
              >
                {localities.map((locality: LocalityRow) => (
                  <option key={locality.id} value={locality.id}>
                    {locality.name_en}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
                Assign
              </button>
            </div>
          </form>

          <div className="rounded bg-white shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3">User</th>
                  <th className="p-3">Locality</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {userLocalities.map((entry: UserLocalityRow) => (
                  <tr key={entry.id} className="border-b">
                    <td className="p-3">{entry.user.email}</td>
                    <td className="p-3">{entry.locality.name_en}</td>
                    <td className="p-3 text-right">
                      <form method="post" action="/api/admin/user-localities">
                        <input type="hidden" name="action" value="remove" />
                        <input type="hidden" name="user_id" value={entry.user.id} />
                        <input type="hidden" name="locality_id" value={entry.locality.id} />
                        <button type="submit" className="text-slate-700 underline">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            {users.map((user: UserRow) => (
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

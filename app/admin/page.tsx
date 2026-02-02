// app/admin/page.tsx
import { getSessionUser } from "@/lib/rbac"; // if alias doesn't work, see note below
import { Role } from "@prisma/client";

export default function AdminHome() {
  const user = getSessionUser();

  // Middleware already protects this, but keep safe
  if (!user) {
    return (
      <main className="container py-16">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p>You are not logged in.</p>
      </main>
    );
  }

  return (
    <main className="container py-16 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p>
        Logged in as <span className="font-mono">{user.id}</span> ({user.role})
      </p>

      <div className="flex gap-3">
        {user.role === Role.SUPER_ADMIN && (
          <a className="rounded border px-3 py-2" href="/admin/users">
            Manage Users
          </a>
        )}
        <a className="rounded border px-3 py-2" href="/admin/localities">
          Localities
        </a>
      </div>

      <form action="/admin/logout" method="post">
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Logout
        </button>
      </form>
    </main>
  );
}

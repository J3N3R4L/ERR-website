import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { canManageUsers, canManageLocalities, canPublish } from "@/lib/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="container py-10">
        <p className="text-red-600">Please log in.</p>
        <Link className="underline" href="/admin/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold">
              Admin
            </Link>

            <nav className="flex items-center gap-4 text-sm text-slate-700">
              <Link className="hover:underline" href="/admin">
                Dashboard
              </Link>

              <Link className="hover:underline" href="/admin/news">
                News
              </Link>

              {canManageLocalities(user) ? (
                <Link className="hover:underline" href="/admin/localities">
                  Localities
                </Link>
              ) : null}

              {canManageUsers(user) ? (
                <Link className="hover:underline" href="/admin/users">
                  Users
                </Link>
              ) : null}

              {canPublish(user) ? (
                <Link className="hover:underline" href="/admin/news/new">
                  New Post
                </Link>
              ) : null}
            </nav>
          </div>

          <div className="text-sm text-slate-600">
            <span className="font-medium">{user.email}</span>{" "}
            <span className="text-slate-400">•</span>{" "}
            <span>{user.role}</span>
          </div>
        </div>
      </header>

      <main className="container py-8">{children}</main>
    </div>
  );
}

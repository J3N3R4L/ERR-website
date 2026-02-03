import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/session";
import { canManageUsers, canManageLocalities } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const roleUser = user ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 p-6">
          <h1 className="text-lg font-semibold">ERR Admin</h1>
          <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
          <nav className="mt-6 space-y-2 text-sm">
            <Link className="block" href="/admin">
              Dashboard
            </Link>
            {canManageUsers(roleUser) && (
              <Link className="block" href="/admin/users">
                Users
              </Link>
            )}
            {canManageLocalities(roleUser) && (
              <Link className="block" href="/admin/localities">
                Localities
              </Link>
            )}
            <Link className="block" href="/admin/news">
              News
            </Link>
            <span className="block text-slate-400">Field Updates</span>
            <span className="block text-slate-400">Documents</span>
            <span className="block text-slate-400">Photos</span>
            <span className="block text-slate-400">Donations</span>
            <span className="block text-slate-400">Team</span>
            <span className="block text-slate-400">Settings</span>
          </nav>
        </aside>
        <main className="flex-1 p-10">{children}</main>
      </div>
    </div>
  );
}

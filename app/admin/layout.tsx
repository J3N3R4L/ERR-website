import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/session";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-6">
            <h1 className="text-lg font-semibold">ERR Admin</h1>
            <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
          </div>
          <AdminSidebar />
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
              <h2 className="text-lg font-semibold">Dashboard</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="hidden md:inline">{user?.email}</span>
              <details className="md:hidden">
                <summary className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  Menu
                </summary>
                <div className="mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <AdminSidebar />
                </div>
              </details>
            </div>
          </header>
          <main className="px-6 py-8 md:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

import { getSessionUser } from "@/lib/session";

export default async function AdminHome() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="container py-10">
        <p className="text-red-600">Please log in.</p>
      </main>
    );
  }

  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <p className="text-slate-600">
        Welcome back, <strong>{user.email}</strong>
      </p>

      <div className="rounded border border-slate-200 p-4">
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
    </main>
  );
}

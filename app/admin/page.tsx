import { getSessionUser } from "@/lib/session";

export default async function AdminHomePage() {
  const user = await getSessionUser();

  return (
    <div>
      <h2 className="text-2xl font-semibold">Welcome back</h2>
      <p className="mt-2 text-slate-600">Logged in as {user?.email}</p>
    </div>
  );
}

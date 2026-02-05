// app/admin/login/page.tsx
import Link from "next/link";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const error = searchParams?.error;
  const next = searchParams?.next || "/admin";

  return (
    <main className="container py-10 max-w-md">
      <h1 className="text-2xl font-semibold">Admin Login</h1>

      {error ? (
        <p className="mt-3 text-red-600">
          {error === "invalid"
            ? "Invalid email or password."
            : error === "missing"
            ? "Please enter email and password."
            : "Login failed."}
        </p>
      ) : null}

      <form method="post" action="/api/admin/login" className="mt-6 grid gap-4">
        <input type="hidden" name="next" value={next} />

        <label className="grid gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="admin@err.local"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Login
        </button>

        <Link className="text-sm text-slate-600 underline" href="/">
          Back to site
        </Link>
      </form>
    </main>
  );
}

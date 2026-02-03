export default function AdminLoginPage() {
  return (
    <main className="container py-16">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <form className="mt-6 max-w-md space-y-4" method="post" action="/admin/login">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}

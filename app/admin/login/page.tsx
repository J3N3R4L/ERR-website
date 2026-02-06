import Container from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const hasError = searchParams?.error === "1";

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <Container className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <p className="text-sm text-slate-500">Use your credentials to access the dashboard.</p>
          </CardHeader>
          <CardContent>
            {hasError && <Alert variant="error">Invalid email or password.</Alert>}
            <form className="mt-6 space-y-4" method="post" action="/api/admin/login">
              <label className="block text-sm font-medium">
                Email
                <Input type="email" name="email" required className="mt-1" />
              </label>
              <label className="block text-sm font-medium">
                Password
                <Input type="password" name="password" required className="mt-1" />
              </label>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}

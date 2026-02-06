import { getSessionUser } from "@/lib/session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";

export default async function AdminHomePage() {
  const user = await getSessionUser();

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" subtitle="Overview of content and access." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-600">Signed in as</h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
            <p className="text-sm text-slate-500">{user?.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-600">Content status</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Drafts and published items are listed per section.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-600">Next actions</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Use the sidebar to manage localities and news.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

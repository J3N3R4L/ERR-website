import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canManageLocalities } from "@/lib/rbac";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

type LocalityRow = {
  id: string;
  name_en: string;
  slug: string;
};

export default async function LocalitiesPage() {
  const sessionUser = await getSessionUser();
  const localities = await prisma.locality.findMany({
    orderBy: { created_at: "desc" },
    select: { id: true, name_en: true, slug: true }
  });

  if (!canManageLocalities(sessionUser)) {
    return <p className="text-red-600">You do not have access to manage localities.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Localities"
        subtitle="Manage locality profiles and coverage details."
      />

      <Card>
        <CardContent>
          <form method="post" action="/api/admin/localities" className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Name (EN)
              <Input name="name_en" required className="mt-1" />
            </label>
            <label className="block text-sm">
              Name (AR)
              <Input name="name_ar" required className="mt-1" />
            </label>
            <label className="block text-sm">
              Slug
              <Input name="slug" required className="mt-1" />
            </label>
            <label className="block text-sm">
              Description (EN)
              <Textarea name="description_en" rows={3} className="mt-1" />
            </label>
            <label className="block text-sm">
              Description (AR)
              <Textarea name="description_ar" rows={3} className="mt-1" />
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Create locality</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {localities.length === 0 ? (
            <EmptyState
              title="No localities yet"
              description="Add the first locality to start organizing content."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Slug</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {localities.map((locality: LocalityRow) => (
                    <TableRow key={locality.id}>
                      <TableCell>{locality.name_en}</TableCell>
                      <TableCell>{locality.slug}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

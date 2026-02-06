import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canPublish } from "@/lib/rbac";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";

type LocalityOption = {
  id: string;
  name_en: string;
};

type AccessEntry = {
  locality: { id: string; name_en: string };
};

export default async function NewsNewPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return <p className="text-red-600">Please log in.</p>;
  }

  const canSelectAnyLocality =
    sessionUser.role === "SUPER_ADMIN" || sessionUser.role === "STATE_ADMIN";

  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    select: { locality: { select: { id: true, name_en: true } } }
  });

  const accessibleLocalities = canSelectAnyLocality
    ? await prisma.locality.findMany({
        orderBy: { name_en: "asc" },
        select: { id: true, name_en: true }
      })
    : access.map((entry: AccessEntry) => entry.locality);

  if (!canSelectAnyLocality && accessibleLocalities.length === 0) {
    return <p className="text-red-600">No locality access assigned.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="New News Post" subtitle="Draft or publish a new update." />

      <Card>
        <CardContent>
          <form method="post" action="/api/admin/news" className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Title (EN)
              <Input name="title_en" required className="mt-1" />
            </label>
            <label className="block text-sm">
              Title (AR)
              <Input name="title_ar" required className="mt-1" />
            </label>
            <label className="block text-sm">
              Slug
              <Input name="slug" required className="mt-1" />
            </label>
            {canSelectAnyLocality ? (
              <label className="block text-sm">
                Locality (optional)
                <Select name="locality_id" className="mt-1">
                  <option value="">Global</option>
                  {accessibleLocalities.map((locality: LocalityOption) => (
                    <option key={locality.id} value={locality.id}>
                      {locality.name_en}
                    </option>
                  ))}
                </Select>
              </label>
            ) : (
              <input type="hidden" name="locality_id" value={accessibleLocalities[0].id} />
            )}
            <label className="block text-sm md:col-span-2">
              Excerpt (EN)
              <Textarea name="excerpt_en" rows={2} required className="mt-1" />
            </label>
            <label className="block text-sm md:col-span-2">
              Excerpt (AR)
              <Textarea name="excerpt_ar" rows={2} required className="mt-1" />
            </label>
            <label className="block text-sm md:col-span-2">
              Body (EN)
              <Textarea name="body_en" rows={8} required className="mt-1" />
            </label>
            <label className="block text-sm md:col-span-2">
              Body (AR)
              <Textarea name="body_ar" rows={8} required className="mt-1" />
            </label>
            <label className="block text-sm">
              Status
              <Select name="status" className="mt-1" defaultValue="DRAFT">
                <option value="DRAFT">Draft</option>
                {canPublish(sessionUser) && <option value="PUBLISHED">Published</option>}
              </Select>
            </label>
            <div className="flex items-end">
              <Button type="submit">Create news post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

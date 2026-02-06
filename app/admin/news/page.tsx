import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import PageHeader from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

type NewsRow = {
  id: string;
  title_en: string;
  status: string;
  locality: { name_en: string } | null;
  author: { email: string };
};

export default async function NewsAdminPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return <p className="text-red-600">Please log in.</p>;
  }

  const canAccessAll = sessionUser.role === "SUPER_ADMIN" || sessionUser.role === "STATE_ADMIN";

  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: sessionUser.id },
    select: { locality_id: true }
  });
  const localityIds = access.map((entry: { locality_id: string }) => entry.locality_id);

  const posts = await prisma.post.findMany({
    where: {
      type: "NEWS",
      ...(canAccessAll ? {} : { locality_id: { in: localityIds } })
    },
    select: {
      id: true,
      title_en: true,
      status: true,
      locality: { select: { name_en: true } },
      author: { select: { email: true } }
    },
    orderBy: { created_at: "desc" }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="News"
        subtitle="Create, edit, and publish news posts."
        actions={
          <Link className={buttonClasses({ variant: "primary" })} href="/admin/news/new">
            New post
          </Link>
        }
      />

      <Card>
        <CardContent>
          {posts.length === 0 ? (
            <EmptyState
              title="No news posts"
              description="Create your first news post to share updates."
              action={
                <Link className={buttonClasses({ variant: "secondary" })} href="/admin/news/new">
                  Create news
                </Link>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Locality</TableHeaderCell>
                    <TableHeaderCell>Author</TableHeaderCell>
                    <TableHeaderCell></TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {posts.map((post: NewsRow) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.title_en}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "PUBLISHED" ? "published" : "draft"}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.locality?.name_en ?? "Global"}</TableCell>
                      <TableCell>{post.author.email}</TableCell>
                      <TableCell className="text-right">
                        <Link className={buttonClasses({ variant: "ghost", size: "sm" })} href={`/admin/news/${post.id}/edit`}>
                          Edit
                        </Link>
                      </TableCell>
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

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { canAssignLocalities, canManageUsers } from "@/lib/rbac";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

type UserRow = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
};

type LocalityRow = {
  id: string;
  name_en: string;
};

type UserLocalityRow = {
  id: string;
  user: { id: string; email: string };
  locality: { id: string; name_en: string };
};

export default async function UsersPage() {
  const sessionUser = await getSessionUser();
  const canView = canManageUsers(sessionUser) || canAssignLocalities(sessionUser);

  if (!canView) {
    return <p className="text-red-600">You do not have access to manage users.</p>;
  }

  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true
    }
  });

  const localities = await prisma.locality.findMany({
    orderBy: { name_en: "asc" },
    select: { id: true, name_en: true }
  });

  const userLocalities = await prisma.userLocalityAccess.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true,
      user: { select: { id: true, email: true } },
      locality: { select: { id: true, name_en: true } }
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        subtitle="Create accounts and assign locality access."
      />

      {canManageUsers(sessionUser) && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-600">Create new user</h3>
          </CardHeader>
          <CardContent>
            <form method="post" action="/api/admin/users" className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                Email
                <Input name="email" type="email" required className="mt-1" />
              </label>
              <label className="block text-sm">
                Password
                <Input name="password" type="password" required className="mt-1" />
              </label>
              <label className="block text-sm">
                Role
                <Select name="role" className="mt-1">
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="STATE_ADMIN">STATE_ADMIN</option>
                  <option value="LOCALITY_ADMIN">LOCALITY_ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                </Select>
              </label>
              <label className="block text-sm">
                Active
                <Select name="is_active" className="mt-1">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </label>
              <div className="md:col-span-2">
                <Button type="submit">Create user</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {canAssignLocalities(sessionUser) && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-600">Locality access</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <form method="post" action="/api/admin/user-localities" className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="action" value="assign" />
              <label className="block text-sm">
                User
                <Select name="user_id" className="mt-1" required>
                  {users.map((user: UserRow) => (
                    <option key={user.id} value={user.id}>
                      {user.email} ({user.role})
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block text-sm">
                Locality
                <Select name="locality_id" className="mt-1" required>
                  {localities.map((locality: LocalityRow) => (
                    <option key={locality.id} value={locality.id}>
                      {locality.name_en}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="flex items-end">
                <Button type="submit">Assign</Button>
              </div>
            </form>

            {userLocalities.length === 0 ? (
              <EmptyState
                title="No locality assignments"
                description="Assign localities to locality admins and editors to scope their content."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>User</TableHeaderCell>
                      <TableHeaderCell>Locality</TableHeaderCell>
                      <TableHeaderCell></TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {userLocalities.map((entry: UserLocalityRow) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.user.email}</TableCell>
                        <TableCell>{entry.locality.name_en}</TableCell>
                        <TableCell className="text-right">
                          <form method="post" action="/api/admin/user-localities">
                            <input type="hidden" name="action" value="remove" />
                            <input type="hidden" name="user_id" value={entry.user.id} />
                            <input type="hidden" name="locality_id" value={entry.locality.id} />
                            <Button variant="ghost" size="sm" type="submit">
                              Remove
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-600">All users</h3>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState title="No users yet" description="Create your first admin user." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {users.map((user: UserRow) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>
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

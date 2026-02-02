// lib/rbac.ts
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
};

export function getSessionUser(): SessionUser | null {
  const jar = cookies();
  const id = jar.get("err_user_id")?.value;
  const role = jar.get("err_role")?.value as Role | undefined;

  if (!id || !role) return null;
  return { id, role };
}

export function requireAuth(): SessionUser {
  const user = getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function requireRole(allowed: Role[]): SessionUser {
  const user = requireAuth();
  if (!allowed.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

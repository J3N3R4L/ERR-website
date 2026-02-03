import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import type { AppRole, SessionUser } from "@/lib/rbac";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return null;

  const user = await prisma.user.findUnique({
    where: { id: cookie },
    select: { id: true, email: true, role: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as unknown as AppRole, // stored as strings in DB
  };
}

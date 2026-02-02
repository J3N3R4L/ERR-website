// lib/locality-scope.ts
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserLocalityIds(userId: string): Promise<string[]> {
  const access = await prisma.userLocalityAccess.findMany({
    where: { user_id: userId },
    select: { locality_id: true },
  });
  return access.map((a) => a.locality_id);
}

export async function assertCanAccessLocality(
  user: { id: string; role: Role },
  localityId: string
) {
  if (user.role === Role.SUPER_ADMIN || user.role === Role.STATE_ADMIN) return true;

  const allowedIds = await getUserLocalityIds(user.id);
  if (!allowedIds.includes(localityId)) throw new Error("FORBIDDEN_LOCALITY");
  return true;
}


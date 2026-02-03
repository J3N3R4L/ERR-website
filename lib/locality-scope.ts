import { prisma } from "@/lib/db";

export type AppRole = "SUPER_ADMIN" | "STATE_ADMIN" | "LOCALITY_ADMIN" | "EDITOR";

/**
 * Returns a list of locality IDs the user can access.
 * - SUPER_ADMIN / STATE_ADMIN => "ALL" (special marker)
 * - LOCALITY_ADMIN / EDITOR  => specific locality ids from UserLocalityAccess
 */
export async function getUserLocalityScope(user: { id: string; role: AppRole }) {
  const canSeeAll = user.role === "SUPER_ADMIN" || user.role === "STATE_ADMIN";
  if (canSeeAll) return { all: true as const, localityIds: [] as string[] };

  const access: Array<{ locality_id: string }> = await prisma.userLocalityAccess.findMany({
    where: { user_id: user.id },
    select: { locality_id: true },
  });

  return {
    all: false as const,
    localityIds: access.map((a) => a.locality_id),
  };
}

/**
 * Convenience check: does user have access to a localityId?
 */
export async function userHasLocalityAccess(
  user: { id: string; role: AppRole },
  localityId: string | null | undefined
) {
  if (user.role === "SUPER_ADMIN" || user.role === "STATE_ADMIN") return true;
  if (!localityId) return false;

  const access = await prisma.userLocalityAccess.findUnique({
    where: { user_id_locality_id: { user_id: user.id, locality_id: localityId } },
    select: { id: true },
  });

  return !!access;
}

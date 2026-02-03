// lib/session.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import type { AppRole, SessionUser } from "@/lib/rbac";

// 1) Server Components / Server Actions
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get("err_session")?.value;
  const payload = token ? verifySessionToken(token) : null;
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, is_active: true },
  });

  if (!user || !user.is_active) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as AppRole,
  };
}

// 2) API Routes (Route Handlers) — read cookie from Request headers
export function getSessionFromRequest(request: Request): { userId: string; role?: string } | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)err_session=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  const payload = token ? verifySessionToken(token) : null;
  if (!payload?.userId) return null;

  return payload;
}

export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
  const payload = getSessionFromRequest(request);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, is_active: true },
  });

  if (!user || !user.is_active) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as AppRole,
  };
}

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
};

export const getSessionUser = async () => {
  const token = cookies().get("err_session")?.value;
  const payload = token ? verifySessionToken(token) : null;
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true
    }
  });
};

export const getSessionFromRequest = (request: Request) => {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/err_session=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  return token ? verifySessionToken(token) : null;
};

export const getSessionUserFromRequest = async (request: Request) => {
  const payload = getSessionFromRequest(request);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true
    }
  });
};

import type { SessionUser } from "@/lib/session";

export const canManageUsers = (user: SessionUser | null) => user?.role === "SUPER_ADMIN";

export const canManageLocalities = (user: SessionUser | null) =>
  user?.role === "SUPER_ADMIN" || user?.role === "STATE_ADMIN";

export const canPublish = (user: SessionUser | null) =>
  user?.role === "SUPER_ADMIN" ||
  user?.role === "STATE_ADMIN" ||
  user?.role === "LOCALITY_ADMIN";

export const isEditor = (user: SessionUser | null) => user?.role === "EDITOR";

export const canAssignLocalities = (user: SessionUser | null) =>
  user?.role === "SUPER_ADMIN" || user?.role === "STATE_ADMIN";

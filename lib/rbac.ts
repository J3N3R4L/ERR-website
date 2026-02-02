import type { Role } from "@prisma/client";

export const canManageUsers = (role: Role) => role === "SUPER_ADMIN";

export const canManageLocalities = (role: Role) =>
  role === "SUPER_ADMIN" || role === "STATE_ADMIN";

export const canPublish = (role: Role) =>
  role === "SUPER_ADMIN" || role === "STATE_ADMIN" || role === "LOCALITY_ADMIN";

export const isEditor = (role: Role) => role === "EDITOR";

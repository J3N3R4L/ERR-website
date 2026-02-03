// lib/rbac.ts
// Pure RBAC helpers (no cookies, no prisma, no session reading)

export type AppRole = "SUPER_ADMIN" | "STATE_ADMIN" | "LOCALITY_ADMIN" | "EDITOR";

export type SessionUser = {
  id: string;
  email?: string;
  role: AppRole;
};

export function canManageUsers(user: SessionUser) {
  return user.role === "SUPER_ADMIN";
}

export function canManageLocalities(user: SessionUser) {
  return user.role === "SUPER_ADMIN" || user.role === "STATE_ADMIN";
}

export function canPublish(user: SessionUser) {
  return (
    user.role === "SUPER_ADMIN" ||
    user.role === "STATE_ADMIN" ||
    user.role === "LOCALITY_ADMIN"
  );
}

export function canEditPosts(user: SessionUser) {
  // Editors can edit drafts they have access to (scoping handled elsewhere)
  return canPublish(user) || user.role === "EDITOR";
}

export function canSelectAnyLocality(user: SessionUser) {
  return user.role === "SUPER_ADMIN" || user.role === "STATE_ADMIN";
}

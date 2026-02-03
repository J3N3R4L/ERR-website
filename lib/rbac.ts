// lib/rbac.ts
// Pure RBAC helpers (no cookies, no prisma, no session reading)

export type AppRole =
  | "SUPER_ADMIN"
  | "STATE_ADMIN"
  | "LOCALITY_ADMIN"
  | "EDITOR";

export type SessionUser = {
  id: string;
  email?: string;
  role: AppRole;
};

/**
 * SUPER_ADMIN only
 */
export function canManageUsers(user: SessionUser | null) {
  return user?.role === "SUPER_ADMIN";
}

/**
 * SUPER_ADMIN, STATE_ADMIN
 */
export function canManageLocalities(user: SessionUser | null) {
  return user?.role === "SUPER_ADMIN" || user?.role === "STATE_ADMIN";
}

/**
 * SUPER_ADMIN, STATE_ADMIN, LOCALITY_ADMIN
 */
export function canPublish(user: SessionUser | null) {
  return (
    user?.role === "SUPER_ADMIN" ||
    user?.role === "STATE_ADMIN" ||
    user?.role === "LOCALITY_ADMIN"
  );
}

/**
 * Editors can edit drafts (scope enforced elsewhere)
 */
export function canEditPosts(user: SessionUser | null) {
  return canPublish(user) || user?.role === "EDITOR";
}

/**
 * Only admins who can choose *any* locality
 */
export function canSelectAnyLocality(user: SessionUser | null) {
  return user?.role === "SUPER_ADMIN" || user?.role === "STATE_ADMIN";
}

/**
 * Assign locality access
 */
export function canAssignLocalities(user: SessionUser | null) {
  return user?.role === "SUPER_ADMIN" || user?.role === "STATE_ADMIN";
}


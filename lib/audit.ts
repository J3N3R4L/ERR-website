import { prisma } from "@/lib/db";

type AuditMeta = Record<string, unknown> | null;

export const logAudit = async ({
  userId,
  action,
  entityType,
  entityId,
  meta
}: {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  meta?: AuditMeta;
}) => {
  await prisma.auditLog.create({
    data: {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      meta_json: meta ?? null
    }
  });
};

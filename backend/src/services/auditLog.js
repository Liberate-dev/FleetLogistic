/**
 * Audit Log Service
 * Records all changes to entities for tracking and compliance
 */
export async function createAuditLog(prisma, { userId, entityType, entityId, action, oldValue, newValue }) {
  return prisma.auditLog.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      oldValue,
      newValue
    }
  });
}

export async function getAuditLogs(prisma, { entityType, entityId, userId, limit = 50, offset = 0 }) {
  const where = {};

  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total, limit, offset };
}

// Status transition logging helper
export async function logStatusChange(prisma, { userId, entityType, entityId, oldStatus, newStatus }) {
  return createAuditLog(prisma, {
    userId,
    entityType,
    entityId,
    action: 'STATUS_CHANGE',
    oldValue: { status: oldStatus },
    newValue: { status: newStatus }
  });
}

// Entity change logging helper
export async function logEntityChange(prisma, { userId, entityType, entityId, action, oldEntity, newEntity }) {
  return createAuditLog(prisma, {
    userId,
    entityType,
    entityId,
    action,
    oldValue: oldEntity,
    newValue: newEntity
  });
}

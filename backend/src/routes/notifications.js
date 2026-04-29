import { Router } from 'express';
import { checkExpiringDocuments } from '../services/expiryTracking.js';

const router = Router();

// Get notifications
router.get('/', async (req, res, next) => {
  try {
    const { userId, read, type, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (read !== undefined) where.read = read === 'true';
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      req.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.notification.count({ where }),
      req.prisma.notification.count({
        where: { ...where, read: false }
      })
    ]);

    res.json({
      notifications,
      total,
      unreadCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', async (req, res, next) => {
  try {
    const { userId } = req.query;

    const where = { read: false };
    if (userId) where.userId = userId;

    const count = await req.prisma.notification.count({ where });
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await req.prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/mark-all-read', async (req, res, next) => {
  try {
    const { userId } = req.body;

    const where = { read: false };
    if (userId) where.userId = userId;

    const result = await req.prisma.notification.updateMany({
      where,
      data: { read: true }
    });

    res.json({ updated: result.count });
  } catch (error) {
    next(error);
  }
});

// Check expiring documents (triggers notifications)
router.post('/check-expiring', async (req, res, next) => {
  try {
    const { days = 30 } = req.body;

    const notifications = await checkExpiringDocuments(req.prisma, parseInt(days));

    res.json({
      message: 'Expiry check completed',
      newNotifications: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', async (req, res, next) => {
  try {
    await req.prisma.notification.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Clear old notifications
router.delete('/', async (req, res, next) => {
  try {
    const { days = 30, readOnly = true } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const where = {
      createdAt: { lt: cutoffDate }
    };

    if (readOnly === 'true') {
      where.read = true;
    }

    const result = await req.prisma.notification.deleteMany({ where });

    res.json({ deleted: result.count });
  } catch (error) {
    next(error);
  }
});

export default router;

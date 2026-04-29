import { Router } from 'express';
import { getExpiringDrivers } from '../services/expiryTracking.js';
import { createAuditLog } from '../services/auditLog.js';

const router = Router();

// List all drivers
router.get('/', async (req, res, next) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [drivers, total] = await Promise.all([
      req.prisma.driver.findMany({
        where,
        orderBy: { name: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.driver.count({ where })
    ]);

    res.json({ drivers, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

// Get drivers with expiring licenses
router.get('/expiring', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const drivers = await getExpiringDrivers(req.prisma, parseInt(days));
    res.json({ drivers, count: drivers.length });
  } catch (error) {
    next(error);
  }
});

// Get single driver
router.get('/:id', async (req, res, next) => {
  try {
    const driver = await req.prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        dispatches: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            suratJalan: {
              select: {
                documentNumber: true,
                date: true
              }
            }
          }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    next(error);
  }
});

// Create driver
router.post('/', async (req, res, next) => {
  try {
    const { employeeId, name, phone, licenseExpiry, simExpiry, simType, simNumber, whatsappPhone } = req.body;

    if (!employeeId || !name) {
      return res.status(400).json({ error: 'Employee ID and name are required' });
    }

    const expiryDate = licenseExpiry || simExpiry;

    const driver = await req.prisma.driver.create({
      data: {
        employeeId,
        name,
        phone: phone || null,
        whatsappPhone: whatsappPhone || phone || null,
        simType: simType || null,
        simNumber: simNumber || null,
        licenseExpiry: expiryDate ? new Date(expiryDate) : null
      }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Driver',
      entityId: driver.id,
      action: 'CREATE',
      newValue: driver
    });

    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
});

// Update driver
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.driver.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const { employeeId, name, phone, licenseExpiry, simExpiry, simType, simNumber, status, whatsappPhone } = req.body;
    const expiryDate = licenseExpiry || simExpiry;

    const driver = await req.prisma.driver.update({
      where: { id: req.params.id },
      data: {
        employeeId,
        name,
        phone: phone !== undefined ? phone : undefined,
        whatsappPhone: whatsappPhone !== undefined ? whatsappPhone : phone || undefined,
        simType: simType !== undefined ? simType : undefined,
        simNumber: simNumber !== undefined ? simNumber : undefined,
        licenseExpiry: expiryDate ? new Date(expiryDate) : undefined,
        status
      }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Driver',
      entityId: driver.id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: driver
    });

    res.json(driver);
  } catch (error) {
    next(error);
  }
});

// Delete driver
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.driver.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { dispatches: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (existing._count.dispatches > 0) {
      return res.status(400).json({
        error: 'Cannot delete driver with existing dispatches',
        count: existing._count.dispatches
      });
    }

    await req.prisma.driver.delete({
      where: { id: req.params.id }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Driver',
      entityId: req.params.id,
      action: 'DELETE',
      oldValue: existing
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

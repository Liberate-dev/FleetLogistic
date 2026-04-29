import { Router } from 'express';
import { getExpiringVehicles } from '../services/expiryTracking.js';
import { createAuditLog } from '../services/auditLog.js';

const VehicleStatus = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE'
};

const router = Router();

// List all vehicles
router.get('/', async (req, res, next) => {
  try {
    const { status, type, search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [vehicles, total] = await Promise.all([
      req.prisma.vehicle.findMany({
        where,
        orderBy: { plateNumber: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.vehicle.count({ where })
    ]);

    res.json({ vehicles, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

// Get vehicles with expiring documents
router.get('/expiring', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const vehicles = await getExpiringVehicles(req.prisma, parseInt(days));
    res.json({ vehicles, count: vehicles.length });
  } catch (error) {
    next(error);
  }
});

// Get single vehicle
router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await req.prisma.vehicle.findUnique({
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

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// Create vehicle
router.post('/', async (req, res, next) => {
  try {
    const { plateNumber, type, capacity, stnkExpiry, kirExpiry } = req.body;

    if (!plateNumber) {
      return res.status(400).json({ error: 'Plate number is required' });
    }

    const vehicle = await req.prisma.vehicle.create({
      data: {
        plateNumber,
        type: type || 'TRUCK',
        capacity: capacity ? parseFloat(capacity) : null,
        stnkExpiry: stnkExpiry ? new Date(stnkExpiry) : null,
        kirExpiry: kirExpiry ? new Date(kirExpiry) : null
      }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'CREATE',
      newValue: vehicle
    });

    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

// Update vehicle
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.vehicle.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { plateNumber, type, capacity, stnkExpiry, kirExpiry, status } = req.body;

    const vehicle = await req.prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        plateNumber,
        type,
        capacity: capacity ? parseFloat(capacity) : undefined,
        stnkExpiry: stnkExpiry ? new Date(stnkExpiry) : undefined,
        kirExpiry: kirExpiry ? new Date(kirExpiry) : undefined,
        status
      }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: vehicle
    });

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// Delete vehicle
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { dispatches: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (existing._count.dispatches > 0) {
      return res.status(400).json({
        error: 'Cannot delete vehicle with existing dispatches',
        count: existing._count.dispatches
      });
    }

    await req.prisma.vehicle.delete({
      where: { id: req.params.id }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Vehicle',
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

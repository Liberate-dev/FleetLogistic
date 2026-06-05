import { Router } from 'express';
import { performGateCheck } from '../services/gateCheck.js';
import { createAuditLog, logStatusChange } from '../services/auditLog.js';

const DispatchStatus = {
  ASSIGNED: 'ASSIGNED',
  DEPARTED: 'DEPARTED',
  RETURNED: 'RETURNED'
};

const GateCheckStatus = {
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  FAILED: 'FAILED'
};

const router = Router();

// List all dispatches
router.get('/', async (req, res, next) => {
  try {
    const { status, vehicleId, driverId, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId) where.driverId = driverId;

    const [dispatches, total] = await Promise.all([
      req.prisma.dispatch.findMany({
        where,
        include: {
          suratJalan: {
            select: {
              id: true,
              documentNumber: true,
              date: true,
              status: true,
              customer: { select: { id: true, name: true } }
            }
          },
          vehicle: { select: { id: true, plateNumber: true, type: true } },
          driver: { select: { id: true, name: true, employeeId: true } },
          pod: true,
          lpj: true,
          vehicleChecklist: true,
          driverChecklist: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.dispatch.count({ where })
    ]);

    res.json({ dispatches, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

// Get single dispatch
router.get('/:id', async (req, res, next) => {
  try {
    const dispatch = await req.prisma.dispatch.findUnique({
      where: { id: req.params.id },
      include: {
        suratJalan: {
          include: {
            customer: true,
            items: { include: { material: true } }
          }
        },
        vehicle: true,
        driver: true,
        vehicleChecklist: true,
        driverChecklist: true,
        pod: true,
        lpj: true,
        gateCheckBy: { select: { id: true, name: true } }
      }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    res.json(dispatch);
  } catch (error) {
    next(error);
  }
});

// Submit vehicle checklist
router.post('/:id/vehicle-checklist', async (req, res, next) => {
  try {
    const { vehicleId, checklistItems, condition, notes, userId } = req.body;

    const dispatch = await req.prisma.dispatch.findUnique({
      where: { id: req.params.id }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    if (dispatch.vehicleChecklist) {
      return res.status(400).json({ error: 'Vehicle checklist already submitted' });
    }

    const vehicleChecklist = await req.prisma.vehicleChecklist.create({
      data: {
        dispatchId: req.params.id,
        vehicleId: vehicleId || dispatch.vehicleId,
        checklistItems,
        condition,
        notes,
        checkedById: userId
      }
    });

    await createAuditLog(req.prisma, {
      userId,
      entityType: 'VehicleChecklist',
      entityId: vehicleChecklist.id,
      action: 'CREATE',
      newValue: vehicleChecklist
    });

    res.status(201).json(vehicleChecklist);
  } catch (error) {
    next(error);
  }
});

// Submit driver checklist
router.post('/:id/driver-checklist', async (req, res, next) => {
  try {
    const { driverId, hasLicense, licenseValid, condition, notes, userId } = req.body;

    const dispatch = await req.prisma.dispatch.findUnique({
      where: { id: req.params.id }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    if (dispatch.driverChecklist) {
      return res.status(400).json({ error: 'Driver checklist already submitted' });
    }

    const driverChecklist = await req.prisma.driverChecklist.create({
      data: {
        dispatchId: req.params.id,
        driverId: driverId || dispatch.driverId,
        hasLicense,
        licenseValid,
        condition,
        notes,
        checkedById: userId
      }
    });

    await createAuditLog(req.prisma, {
      userId,
      entityType: 'DriverChecklist',
      entityId: driverChecklist.id,
      action: 'CREATE',
      newValue: driverChecklist
    });

    res.status(201).json(driverChecklist);
  } catch (error) {
    next(error);
  }
});

// Perform gate check
router.post('/:id/gate-check', async (req, res, next) => {
  try {
    const { userId, notes } = req.body;

    const result = await performGateCheck(req.prisma, req.params.id, userId, notes);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Update dispatch status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status, userId } = req.body;

    const existing = await req.prisma.dispatch.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    const dispatch = await req.prisma.dispatch.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        suratJalan: {
          select: {
            id: true,
            documentNumber: true,
            status: true
          }
        },
        vehicle: { select: { id: true, plateNumber: true } },
        driver: { select: { id: true, name: true } }
      }
    });

    await logStatusChange(req.prisma, {
      userId,
      entityType: 'Dispatch',
      entityId: req.params.id,
      oldStatus: existing.status,
      newStatus: status
    });

    res.json(dispatch);
  } catch (error) {
    next(error);
  }
});

// Submit POD
router.post('/:id/pod', async (req, res, next) => {
  try {
    const { receivedBy, receivedAt, signature, photos, notes, userId } = req.body;

    const dispatch = await req.prisma.dispatch.findUnique({
      where: { id: req.params.id }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    if (dispatch.pod) {
      // Update existing POD
      const pod = await req.prisma.pOD.update({
        where: { dispatchId: req.params.id },
        data: {
          receivedBy,
          receivedAt: receivedAt ? new Date(receivedAt) : undefined,
          signature,
          photos,
          notes
        }
      });
      return res.json(pod);
    }

    const pod = await req.prisma.pOD.create({
      data: {
        dispatchId: req.params.id,
        receivedBy,
        receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
        signature,
        photos,
        notes,
        submittedById: userId
      }
    });

    await createAuditLog(req.prisma, {
      userId,
      entityType: 'POD',
      entityId: pod.id,
      action: 'CREATE',
      newValue: pod
    });

    res.status(201).json(pod);
  } catch (error) {
    next(error);
  }
});

// Get POD
router.get('/:id/pod', async (req, res, next) => {
  try {
    const pod = await req.prisma.pOD.findUnique({
      where: { dispatchId: req.params.id },
      include: {
        submittedBy: { select: { id: true, name: true } }
      }
    });

    if (!pod) {
      return res.status(404).json({ error: 'POD not found' });
    }

    res.json(pod);
  } catch (error) {
    next(error);
  }
});

// Submit LPJ
router.post('/:id/lpj', async (req, res, next) => {
  try {
    const { startKm, endKm, fuelUsed, expenses, notes, userId } = req.body;

    const dispatch = await req.prisma.dispatch.findUnique({
      where: { id: req.params.id }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    if (dispatch.lpj) {
      // Update existing LPJ
      const lpj = await req.prisma.lPJ.update({
        where: { dispatchId: req.params.id },
        data: {
          startKm: startKm ? parseFloat(startKm) : undefined,
          endKm: endKm ? parseFloat(endKm) : undefined,
          fuelUsed: fuelUsed ? parseFloat(fuelUsed) : undefined,
          expenses,
          notes
        }
      });
      return res.json(lpj);
    }

    const lpj = await req.prisma.lPJ.create({
      data: {
        dispatchId: req.params.id,
        startKm: startKm ? parseFloat(startKm) : null,
        endKm: endKm ? parseFloat(endKm) : null,
        fuelUsed: fuelUsed ? parseFloat(fuelUsed) : null,
        expenses,
        notes,
        submittedById: userId
      }
    });

    await createAuditLog(req.prisma, {
      userId,
      entityType: 'LPJ',
      entityId: lpj.id,
      action: 'CREATE',
      newValue: lpj
    });

    res.status(201).json(lpj);
  } catch (error) {
    next(error);
  }
});

// Get LPJ
router.get('/:id/lpj', async (req, res, next) => {
  try {
    const lpj = await req.prisma.lPJ.findUnique({
      where: { dispatchId: req.params.id },
      include: {
        submittedBy: { select: { id: true, name: true } }
      }
    });

    if (!lpj) {
      return res.status(404).json({ error: 'LPJ not found' });
    }

    res.json(lpj);
  } catch (error) {
    next(error);
  }
});

export default router;

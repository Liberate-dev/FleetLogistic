import { Router } from 'express';
import { generateDocumentNumber } from '../services/documentNumbering.js';
import { validateTransition, canEdit, canCancel, requiresGateCheck } from '../services/statusWorkflow.js';
import { validateDispatch } from '../services/gateCheck.js';
import { createAuditLog, logStatusChange } from '../services/auditLog.js';
import { fonnteService } from '../services/fonnteService.js';

const SJStatus = {
  DRAFT: 'DRAFT',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const router = Router();

// List all surat jalan
router.get('/', async (req, res, next) => {
  try {
    const { status, customerId, dateFrom, dateTo, search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { documentNumber: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }

    const [suratJalan, total] = await Promise.all([
      req.prisma.suratJalan.findMany({
        where,
        include: {
          customer: { select: { id: true, code: true, name: true } },
          items: {
            include: {
              material: { select: { id: true, code: true, name: true, unit: true } }
            }
          },
          dispatch: {
            select: {
              id: true,
              status: true,
              vehicle: { select: { id: true, plateNumber: true } },
              driver: { select: { id: true, name: true } }
            }
          },
          createdBy: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.suratJalan.count({ where })
    ]);

    res.json({ suratJalan, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

// Get single surat jalan
router.get('/:id', async (req, res, next) => {
  try {
    const suratJalan = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: { material: true }
        },
        dispatch: {
          include: {
            vehicle: true,
            driver: true,
            vehicleChecklist: true,
            driverChecklist: true,
            pod: true,
            lpj: true
          }
        },
        createdBy: { select: { id: true, name: true } }
      }
    });

    if (!suratJalan) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Create surat jalan (frontend format)
router.post('/create-from-ui', async (req, res, next) => {
  try {
    const {
      number,
      loadingDate,
      originDepot,
      destination,
      destinationAddress,
      clientName,
      contactPerson,
      contactPhone,
      items,
      cashAdvance,
      totalWeight,
      totalQty,
      photoCount,
      createdByName,
    } = req.body;

    // Find or create customer by name
    let customer = await req.prisma.customer.findFirst({
      where: { name: { contains: clientName } }
    });

    if (!customer && clientName) {
      // Create new customer
      customer = await req.prisma.customer.create({
        data: {
          code: `CUST-${Date.now()}`,
          name: clientName,
          phone: contactPhone || '',
          address: destinationAddress || destination || '',
        }
      });
    }

    if (!customer) {
      return res.status(400).json({ error: 'Customer required' });
    }

    // Generate document number (or use provided)
    const documentNumber = number || await generateDocumentNumber(req.prisma);

    // Create SJ with all UI form data
    const suratJalan = await req.prisma.suratJalan.create({
      data: {
        documentNumber,
        customerId: customer.id,
        date: loadingDate ? new Date(loadingDate) : new Date(),
        status: 'DRAFT',
        destination: destination || null,
        destinationAddress: destinationAddress || null,
        originDepot: originDepot || null,
        contactPerson: contactPerson || null,
        contactPhone: contactPhone || null,
        createdByName: createdByName || null,
        uangJalanNominal: cashAdvance?.uangJalan?.nominal ? parseFloat(cashAdvance.uangJalan.nominal) : null,
        uangJalanRecipient: cashAdvance?.uangJalan?.recipient || null,
        danaCadanganNominal: cashAdvance?.danaCadangan?.nominal ? parseFloat(cashAdvance.danaCadangan.nominal) : null,
        notes: `Total Weight: ${totalWeight || 0} Ton | Total Qty: ${totalQty || 0} | Photo Count: ${photoCount || 0}`,
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        items: { include: { material: { select: { id: true, code: true, name: true, unit: true } } } },
        createdBy: { select: { id: true, name: true } },
      }
    });

    // Create items if any
    if (items && items.length > 0) {
      for (const item of items) {
        // Find material by SKU
        let material = await req.prisma.material.findFirst({
          where: { code: item.sku }
        });

        if (!material) {
          // Create material if not exists
          material = await req.prisma.material.create({
            data: {
              code: item.sku,
              name: item.name || item.sku,
              unit: item.unit || 'Kg',
            }
          });
        }

        await req.prisma.suratJalanItem.create({
          data: {
            suratJalanId: suratJalan.id,
            materialId: material.id,
            quantity: parseFloat(item.qty || item.quantity || 0),
            unitPrice: 0,
          }
        });
      }
    }

    // Re-fetch SJ with all relations including newly created items
    const freshSJ = await req.prisma.suratJalan.findUnique({
      where: { id: suratJalan.id },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        items: { include: { material: { select: { id: true, code: true, name: true, unit: true } } } },
        createdBy: { select: { id: true, name: true } },
        dispatch: {
          select: {
            id: true,
            status: true,
            vehicle: { select: { id: true, plateNumber: true } },
            driver: { select: { id: true, name: true } }
          }
        }
      }
    });

    res.json({ success: true, suratJalan: freshSJ });
  } catch (error) {
    next(error);
  }
});

// Create surat jalan (original)
router.post('/', async (req, res, next) => {
  try {
    const { customerId, date, notes, items, userId, driverId, vehicleId, uangJalanNominal, uangJalanRecipient } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer is required' });
    }

    // Validate customer exists
    const customer = await req.prisma.customer.findUnique({
      where: { id: customerId }
    });
    if (!customer) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Get driver info for WhatsApp notification
    const driver = driverId ? await req.prisma.driver.findUnique({ where: { id: driverId } }) : null;

    // Generate document number
    const documentNumber = await generateDocumentNumber(req.prisma);

    // Create SJ with items in transaction
    const suratJalan = await req.prisma.suratJalan.create({
      data: {
        documentNumber,
        customerId,
        date: date ? new Date(date) : new Date(),
        notes,
        createdById: userId,
        uangJalanNominal: uangJalanNominal ? parseFloat(uangJalanNominal) : null,
        uangJalanRecipient: uangJalanRecipient || null,
        items: items && items.length > 0 ? {
          create: items.map(item => ({
            materialId: item.materialId,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice || 0)
          }))
        } : undefined
      },
      include: {
        customer: true,
        items: { include: { material: true } }
      }
    });

    // Send WhatsApp notification to driver if driver assigned
    if (driver?.whatsappPhone || driver?.phone) {
      const phone = driver.whatsappPhone || driver.phone;
      const itemsList = items?.map(i => `• ${i.materialName || i.name || i.material?.name || 'Item'} x${i.quantity || 1}`).join('\n') || 'Data items dalam SJ';

      const formattedNominal = uangJalanNominal
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(uangJalanNominal))
        : null;

      let uangJalanSection = '';
      if (formattedNominal) {
        uangJalanSection = `
💰 *Uang Jalan:* ${formattedNominal}
👤 *Recipient:* ${uangJalanRecipient || driver.name || '-'}
`;
      }

      const message = `━━━━━━━━━━━━━━━━━━
📋 SURAT JALAN BARU
━━━━━━━━━━━━━━━━━━

*Halo ${driver.name}*,

SJ baru telah dibuat untuk Anda:

📄 *Nomor:* ${documentNumber}
🏢 *Client:* ${customer.name}
📅 *Tanggal:* ${new Date(date || new Date()).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
${uangJalanSection}
📦 *Items:*
${itemsList}

Silakan cek detail di aplikasi.

Terima kasih.`;

      // Send async - don't block the response
      fonnteService.sendMessage(phone, message).catch(err => {
        console.error('[SJ Create] Failed to send WA to driver:', err);
      });
    }

    await createAuditLog(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: suratJalan.id,
      action: 'CREATE',
      newValue: suratJalan
    });

    res.status(201).json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Update surat jalan
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    if (!canEdit(existing.status)) {
      return res.status(400).json({
        error: 'Cannot edit Surat Jalan in current status',
        currentStatus: existing.status
      });
    }

    const { customerId, date, notes, items, userId } = req.body;

    // Update with transaction
    const suratJalan = await req.prisma.$transaction(async (prisma) => {
      // Delete existing items
      await prisma.suratJalanItem.deleteMany({
        where: { suratJalanId: req.params.id }
      });

      // Update SJ with new items
      return prisma.suratJalan.update({
        where: { id: req.params.id },
        data: {
          customerId,
          date: date ? new Date(date) : undefined,
          notes,
          items: items && items.length > 0 ? {
            create: items.map(item => ({
              materialId: item.materialId,
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice || 0)
            }))
          } : undefined
        },
        include: {
          customer: true,
          items: { include: { material: true } }
        }
      });
    });

    await createAuditLog(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: suratJalan.id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: suratJalan
    });

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Assign vehicle and driver
router.post('/:id/assign', async (req, res, next) => {
  try {
    const { vehicleId, driverId, userId } = req.body;

    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    // Validate status transition
    const transition = validateTransition(existing.status, SJStatus.ASSIGNED);
    if (!transition.valid) {
      return res.status(400).json({ error: transition.error });
    }

    // Create or update dispatch record
    const dispatch = await req.prisma.dispatch.upsert({
      where: { suratJalanId: req.params.id },
      create: {
        suratJalanId: req.params.id,
        vehicleId,
        driverId
      },
      update: {
        vehicleId,
        driverId
      }
    });

    // Update SJ status
    const suratJalan = await req.prisma.suratJalan.update({
      where: { id: req.params.id },
      data: {
        status: SJStatus.ASSIGNED,
        assignedAt: existing.assignedAt || new Date()
      },
      include: {
        customer: true,
        items: { include: { material: true } },
        dispatch: { include: { vehicle: true, driver: true } }
      }
    });

    await logStatusChange(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: req.params.id,
      oldStatus: existing.status,
      newStatus: SJStatus.ASSIGNED
    });

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Dispatch (after gate check)
router.post('/:id/dispatch', async (req, res, next) => {
  try {
    const { userId } = req.body;

    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id },
      include: {
        dispatch: {
          include: { vehicle: true, driver: true }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    // Validate status transition
    const transition = validateTransition(existing.status, SJStatus.DISPATCHED);
    if (!transition.valid) {
      return res.status(400).json({ error: transition.error });
    }

    // Validate gate check
    const validation = await validateDispatch(req.prisma, req.params.id);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Gate check validation failed',
        details: validation.errors
      });
    }

    // Update dispatch status
    await req.prisma.dispatch.update({
      where: { id: existing.dispatch.id },
      data: { status: 'DEPARTED' }
    });

    // Update SJ status
    const suratJalan = await req.prisma.suratJalan.update({
      where: { id: req.params.id },
      data: {
        status: SJStatus.DISPATCHED,
        dispatchedAt: existing.dispatchedAt || new Date()
      },
      include: {
        customer: true,
        items: { include: { material: true } },
        dispatch: { include: { vehicle: true, driver: true } }
      }
    });

    await logStatusChange(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: req.params.id,
      oldStatus: existing.status,
      newStatus: SJStatus.DISPATCHED
    });

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Mark as delivered
router.post('/:id/deliver', async (req, res, next) => {
  try {
    const { userId } = req.body;

    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    const transition = validateTransition(existing.status, SJStatus.DELIVERED);
    if (!transition.valid) {
      return res.status(400).json({ error: transition.error });
    }

    // Photo optional - driver just confirms via WhatsApp
    const suratJalan = await req.prisma.suratJalan.update({
      where: { id: req.params.id },
      data: {
        status: SJStatus.DELIVERED,
        deliveredAt: existing.deliveredAt || new Date()
      },
      include: {
        customer: true,
        items: { include: { material: true } },
        dispatch: { include: { vehicle: true, driver: true, pod: true } }
      }
    });

    await logStatusChange(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: req.params.id,
      oldStatus: existing.status,
      newStatus: SJStatus.DELIVERED
    });

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Mark as completed
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { userId } = req.body;

    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id },
      include: { dispatch: { include: { pod: true, lpj: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    const transition = validateTransition(existing.status, SJStatus.COMPLETED);
    if (!transition.valid) {
      return res.status(400).json({ error: transition.error });
    }

    // Require signature confirmation before completing
    if (!existing.signatureConfirmed) {
      return res.status(400).json({
        error: 'Signature confirmation required',
        message: 'Driver must confirm receipt of uang jalan via WhatsApp before completing'
      });
    }

    const suratJalan = await req.prisma.suratJalan.update({
      where: { id: req.params.id },
      data: {
        status: SJStatus.COMPLETED,
        completedAt: new Date()
      },
      include: {
        customer: true,
        items: { include: { material: true } },
        dispatch: {
          include: {
            vehicle: true,
            driver: true,
            pod: true,
            lpj: true
          }
        }
      }
    });

    await logStatusChange(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: req.params.id,
      oldStatus: existing.status,
      newStatus: SJStatus.COMPLETED
    });

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Cancel surat jalan
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { userId, reason } = req.body;

    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    if (!canCancel(existing.status)) {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled Surat Jalan' });
    }

    const suratJalan = await req.prisma.suratJalan.update({
      where: { id: req.params.id },
      data: {
        status: SJStatus.CANCELLED,
        notes: existing.notes ? `${existing.notes}\n[CANCELLED: ${reason || 'No reason provided'}]` : `[CANCELLED: ${reason || 'No reason provided'}]`
      },
      include: {
        customer: true,
        items: { include: { material: true } }
      }
    });

    await logStatusChange(req.prisma, {
      userId,
      entityType: 'SuratJalan',
      entityId: req.params.id,
      oldStatus: existing.status,
      newStatus: SJStatus.CANCELLED
    });

    res.json(suratJalan);
  } catch (error) {
    next(error);
  }
});

// Delete surat jalan (only DRAFT)
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.suratJalan.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Surat Jalan not found' });
    }

    if (existing.status !== SJStatus.DRAFT) {
      return res.status(400).json({
        error: 'Can only delete DRAFT Surat Jalan',
        currentStatus: existing.status
      });
    }

    await req.prisma.suratJalan.delete({
      where: { id: req.params.id }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'SuratJalan',
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

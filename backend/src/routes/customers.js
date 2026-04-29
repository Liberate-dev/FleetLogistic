import { Router } from 'express';
import { generateCustomerCode } from '../services/documentNumbering.js';
import { createAuditLog } from '../services/auditLog.js';

const router = Router();

// List all customers
router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      req.prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.customer.count({ where })
    ]);

    res.json({ customers, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

// Get single customer
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await req.prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        suratJalan: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Create customer
router.post('/', async (req, res, next) => {
  try {
    const { name, address, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const code = await generateCustomerCode(req.prisma);

    const customer = await req.prisma.customer.create({
      data: { code, name, address, phone }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Customer',
      entityId: customer.id,
      action: 'CREATE',
      newValue: customer
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// Update customer
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { name, address, phone } = req.body;

    const customer = await req.prisma.customer.update({
      where: { id: req.params.id },
      data: { name, address, phone }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Customer',
      entityId: customer.id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: customer
    });

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Delete customer
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { suratJalan: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (existing._count.suratJalan > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with existing Surat Jalan',
        count: existing._count.suratJalan
      });
    }

    await req.prisma.customer.delete({
      where: { id: req.params.id }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Customer',
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

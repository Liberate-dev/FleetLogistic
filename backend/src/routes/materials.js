import { Router } from 'express';
import { generateMaterialCode } from '../services/documentNumbering.js';
import { createAuditLog } from '../services/auditLog.js';

const router = Router();

// List all materials
router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [materials, total] = await Promise.all([
      req.prisma.material.findMany({
        where,
        orderBy: { name: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      req.prisma.material.count({ where })
    ]);

    res.json({ materials, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

// Get single material
router.get('/:id', async (req, res, next) => {
  try {
    const material = await req.prisma.material.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
});

// Create material
router.post('/', async (req, res, next) => {
  try {
    const { name, unit } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const code = await generateMaterialCode(req.prisma);

    const material = await req.prisma.material.create({
      data: { code, name, unit: unit || 'pcs' }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Material',
      entityId: material.id,
      action: 'CREATE',
      newValue: material
    });

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
});

// Update material
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.material.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const { name, unit } = req.body;

    const material = await req.prisma.material.update({
      where: { id: req.params.id },
      data: { name, unit }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Material',
      entityId: material.id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: material
    });

    res.json(material);
  } catch (error) {
    next(error);
  }
});

// Delete material
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await req.prisma.material.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { suratJalanItems: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (existing._count.suratJalanItems > 0) {
      return res.status(400).json({
        error: 'Cannot delete material used in Surat Jalan',
        count: existing._count.suratJalanItems
      });
    }

    await req.prisma.material.delete({
      where: { id: req.params.id }
    });

    await createAuditLog(req.prisma, {
      userId: req.body.userId,
      entityType: 'Material',
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

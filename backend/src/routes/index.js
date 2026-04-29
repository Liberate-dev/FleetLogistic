import { Router } from 'express';
import customers from './customers.js';
import materials from './materials.js';
import vehicles from './vehicles.js';
import drivers from './drivers.js';
import suratJalan from './suratJalan.js';
import dispatches from './dispatches.js';
import notifications from './notifications.js';
import webhooks from './webhooks.js';
import fonnte from './fonnte.js';

const router = Router();

router.use('/customers', customers);
router.use('/materials', materials);
router.use('/vehicles', vehicles);
router.use('/drivers', drivers);
router.use('/surat-jalan', suratJalan);
router.use('/dispatches', dispatches);
router.use('/notifications', notifications);
router.use('/webhooks', webhooks);
router.use('/fonnte', fonnte);

export default router;

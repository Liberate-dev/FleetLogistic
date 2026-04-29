/**
 * Fonnte Webhook Handler
 * Handles incoming WhatsApp messages from Fonnte
 */

import express from 'express';
import { fonnteService } from '../services/fonnteService.js';

const router = express.Router();

// In-memory log for test page (resets on server restart)
let webhookLog = [];

/**
 * POST /api/webhooks/fonnte
 * Handle incoming Fonnte webhook events
 */
router.post('/fonnte', async (req, res) => {
  try {
    const payload = req.body;
    const webhookSecret = process.env.FONNTE_WEBHOOK_SECRET;

    console.log('[Webhook] Headers:', JSON.stringify(req.headers));
    console.log('[Webhook] Body keys:', Object.keys(payload));

    // Always log full payload for debugging
    console.log('[Webhook] Raw payload:', JSON.stringify(payload).substring(0, 500));

    // Verify webhook secret if configured
    if (webhookSecret && webhookSecret !== 'your_webhook_secret_here') {
      const signature = req.headers['x-fonnte-signature'];
      if (signature && signature !== webhookSecret) {
        console.warn('[Webhook] Invalid signature');
        // Don't reject - just log and continue for debugging
      }
    }

    // Parse the webhook data
    const parsed = fonnteService.parseWebhook(payload);
    console.log('[Webhook] Parsed:', parsed.type, parsed.phone);

    // Log for test page
    webhookLog.push({
      type: parsed.type,
      phone: parsed.phone,
      message: parsed.message || parsed.imageUrl || '',
      image: parsed.imageUrl || null,
      time: new Date().toISOString(),
    });
    if (webhookLog.length > 50) webhookLog.shift(); // Keep last 50

    // Handle based on message type
    if (parsed.type === 'photo') {
      // Photo received from driver
      await handlePhotoReceived(parsed, req.prisma);
    } else if (parsed.type === 'confirmation') {
      // Signature confirmation from driver
      await handleSignatureConfirmation(parsed, req.prisma);
    } else if (parsed.type === 'text') {
      // Text message - could be confirmation or other
      await handleTextMessage(parsed, req.prisma);
    }

    // Always respond quickly to Fonnte
    res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('[Webhook] Error processing:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * Handle photo received from driver
 */
async function handlePhotoReceived(parsed, prisma) {
  const { phone, imageUrl, message } = parsed;

  console.log(`[Webhook] Photo received from ${phone}`);

  // Find SJ by parsing any SJ number in the message
  const sjNumberMatch = message.match(/SJ[-\s]?\w+/i) || message.match(/SJ\/[A-Z]+\/\d+\/\d+/i);

  if (sjNumberMatch) {
    const sjNumber = sjNumberMatch[0].replace(/[-\s]/g, '/').toUpperCase();

    try {
      // Find SJ with pending photo request
      const sj = await prisma.suratJalan.findFirst({
        where: {
          documentNumber: {
            contains: sjNumber.replace(/SJ\/?/i, '').replace(/\//g, ''),
          },
          photoReceived: false,
        },
      });

      if (sj) {
        // Update SJ with photo
        await prisma.suratJalan.update({
          where: { id: sj.id },
          data: {
            photoReceived: true,
            photoUrl: imageUrl,
          },
        });

        console.log(`[Webhook] Photo updated for SJ ${sj.documentNumber}`);

        // Create notification for admin
        await prisma.notification.create({
          data: {
            userId: sj.createdById || 'system',
            type: 'WHATSAPP_PHOTO',
            title: 'Foto Muatan Diterima',
            message: `Driver mengirim foto muatan untuk SJ ${sj.documentNumber} via WhatsApp`,
          },
        });
      }
    } catch (error) {
      console.error('[Webhook] Error updating SJ:', error);
    }
  }
}

/**
 * Handle signature confirmation from driver
 */
async function handleSignatureConfirmation(parsed, prisma) {
  const { phone, message } = parsed;

  console.log(`[Webhook] Signature confirmation from ${phone}`);

  // Parse SJ number from message
  const sjNumberMatch = message.match(/SJ[-\s]?\w+/i) || message.match(/[A-Z]+-\d+-\d+/);

  if (sjNumberMatch) {
    const sjNumber = sjNumberMatch[0].toUpperCase();

    try {
      // Find driver by WhatsApp number (check both phone and whatsappPhone)
      const driver = await prisma.driver.findFirst({
        where: {
          OR: [
            { whatsappPhone: phone },
            { phone: phone },
          ],
        },
      });

      if (driver) {
        // Find SJ with pending signature request for this driver
        const sj = await prisma.suratJalan.findFirst({
          where: {
            uangJalanRecipient: driver.name,
            signatureConfirmed: false,
          },
        });

        if (sj) {
          // Update signature confirmed
          await prisma.suratJalan.update({
            where: { id: sj.id },
            data: {
              signatureConfirmed: true,
            },
          });

          console.log(`[Webhook] Signature confirmed for SJ ${sj.documentNumber}`);

          // Create notification
          await prisma.notification.create({
            data: {
              userId: sj.createdById || 'system',
              type: 'WHATSAPP_SIGNATURE',
              title: 'TTD Uang Jalan Dikonfirmasi',
              message: `Driver ${driver.name} mengkonfirmasi penerimaan uang jalan untuk SJ ${sj.documentNumber} via WhatsApp`,
            },
          });
        }
      }
    } catch (error) {
      console.error('[Webhook] Error updating signature:', error);
    }
  }
}

/**
 * Handle text message (fallback)
 */
async function handleTextMessage(parsed, prisma) {
  const { phone, message } = parsed;
  console.log(`[Webhook] Text from ${phone}: ${message}`);
  // Log for debugging, no action needed
}

/**
 * GET /api/webhooks/fonnte/logs
 * Get webhook log for test page
 */
router.get('/fonnte/logs', (req, res) => {
  // Return logs and clear them (so they don't show twice)
  const logs = [...webhookLog];
  webhookLog = [];
  res.json(logs);
});

/**
 * GET /api/webhooks/fonnte/test
 * Test endpoint for webhook functionality
 */
router.get('/fonnte/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/webhooks/fonnte/simulate
 * Simulate webhook event for testing
 */
router.post('/fonnte/simulate', async (req, res) => {
  const { type, phone, message, image } = req.body;

  const parsedData = {
    from: phone || '6281234567890',
    message: message || 'KONFIRMASI SJ-2026-001',
    image: image || null,
  };

  const parsed = fonnteService.parseWebhook(parsedData);

  console.log('[Webhook] Simulating:', parsed.type);

  if (parsed.type === 'confirmation') {
    await handleSignatureConfirmation(parsed, req.prisma);
  } else if (parsed.type === 'photo') {
    await handlePhotoReceived(parsed, req.prisma);
  }

  res.json({
    success: true,
    parsed,
    message: 'Simulation completed',
  });
});

export default router;
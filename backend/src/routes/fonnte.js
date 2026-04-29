import { Router } from 'express';
import { fonnteService } from '../services/fonnteService.js';

const router = Router();

// Send generic message to phone
router.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: 'Phone and message required'
    });
  }

  const result = await fonnteService.sendMessage(phone, message);
  res.json(result);
});

// Send photo request to driver
router.post('/send-photo-request', async (req, res) => {
  const { phone, driverName, sjNumber } = req.body;

  if (!phone || !sjNumber) {
    return res.status(400).json({
      success: false,
      error: 'Phone and SJ number required'
    });
  }

  const message = `📸 Permintaan Upload Foto Muatan

Halo ${driverName || 'Driver'},
SJ ${sjNumber} siap dimuat.

Kirim foto muatan ke nomor ini
atau reply pesan ini dengan foto.`;

  const result = await fonnteService.sendMessage(phone, message);
  res.json(result);
});

// Send signature request to driver
router.post('/send-signature-request', async (req, res) => {
  const { phone, driverName, sjNumber, nominal } = req.body;

  if (!phone || !sjNumber) {
    return res.status(400).json({
      success: false,
      error: 'Phone and SJ number required'
    });
  }

  const formattedNominal = nominal
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(nominal)
    : 'Rp 0';

  const message = `✍️ Konfirmasi Penerimaan Uang Jalan

SJ: ${sjNumber}
Total: ${formattedNominal}

Dengan klik tombol, saya menyatakan
sudah terima uang jalan tersebut.`;

  const result = await fonnteService.sendButtonMessage(
    phone,
    'Konfirmasi',
    message,
    [{ id: 'CONFIRM', title: 'KONFIRMASI' }]
  );
  res.json(result);
});

// Get WhatsApp status for an SJ
router.get('/status/:sjNumber', async (req, res) => {
  const { sjNumber } = req.params;
  const result = await fonnteService.getStatus(sjNumber);
  res.json(result);
});

export default router;

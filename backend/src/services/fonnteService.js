/**
 * Fonnte WhatsApp Service
 * Handles sending WhatsApp messages via Fonnte API
 */

const FONNTE_API_URL = 'https://api.fonnte.com/send';

/**
 * Convert phone number to Fonnte format (62xxx)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  // Remove spaces, dashes, parentheses
  let clean = phone.replace(/[\s\-()]/g, '');
  // If starts with 0, replace with 62
  if (clean.startsWith('0')) {
    return '62' + clean.substring(1);
  }
  // If starts with 8, add 62
  if (clean.startsWith('8')) {
    return '62' + clean;
  }
  // Already has country code
  return clean;
}

export const fonnteService = {
  /**
   * Send text message via WhatsApp
   * @param {string} phone - Recipient phone number (format: 62xxx)
   * @param {string} message - Message text
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendMessage(phone, message) {
    const apiKey = process.env.FONNTE_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('[Fonnte] API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return { success: false, error: 'Invalid phone number' };
    }

    try {
      console.log('[Fonnte] Sending to:', normalizedPhone);
      console.log('[Fonnte] Message:', message);

      const response = await fetch(FONNTE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
        },
        body: new URLSearchParams({
          target: normalizedPhone,
          message: message,
          countryCode: '0', // Already have 62 prefix
        }),
      });

      const data = await response.json();
      console.log('[Fonnte] Response:', data);

      if (data.status === true || data.status === 'success') {
        return { success: true, messageId: data.id?.[0] || data.requestid };
      } else {
        return { success: false, error: data.reason || data.detail || 'Unknown error' };
      }
    } catch (error) {
      console.error('[Fonnte] Send error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send message with buttons (for signature confirmation)
   * Note: Fonnte uses text message with URL buttons instead of native buttons
   * @param {string} phone - Recipient phone number
   * @param {string} title - Message title/header
   * @param {string} message - Message body
   * @param {Array<{id: string, text: string}>} buttons - Button options
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendButtonMessage(phone, title, message, buttons = []) {
    const apiKey = process.env.FONNTE_API_KEY;

    if (!apiKey) {
      console.warn('[Fonnte] API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return { success: false, error: 'Invalid phone number' };
    }

    // Build message with buttons as URL options
    let fullMessage = `${title}\n\n${message}\n\n`;
    buttons.forEach((btn, idx) => {
      fullMessage += `${idx + 1}. ${btn.text}\n`;
    });

    fullMessage += '\nBalas dengan nomor pilihan Anda.';

    try {
      console.log('[Fonnte] Sending button message to:', normalizedPhone);

      const response = await fetch(FONNTE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
        },
        body: new URLSearchParams({
          target: normalizedPhone,
          message: fullMessage,
          countryCode: '0',
        }),
      });

      const data = await response.json();
      console.log('[Fonnte] Button response:', data);

      if (data.status === true || data.status === 'success') {
        return { success: true, messageId: data.id?.[0] || data.requestid };
      } else {
        return { success: false, error: data.reason || data.detail || 'Unknown error' };
      }
    } catch (error) {
      console.error('[Fonnte] Send error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send photo upload request to driver
   * @param {object} params
   * @param {string} params.phone - Driver's WhatsApp number
   * @param {string} params.driverName - Driver's name
   * @param {string} params.sjNumber - Surat Jalan number
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendPhotoRequest({ phone, driverName, sjNumber }) {
    const deviceNumber = process.env.FONNTE_DEVICE_NUMBER || 'Not configured';

    const message = `📸 Permintaan Upload Foto Muatan

Halo *${driverName}*,
SJ *${sjNumber}* siap dimuat.

Mohon kirim foto muatan sebagai bukti fotografis
pengiriman barang.

Kirim foto langsung ke WhatsApp ini
atau balas pesan ini dengan foto muatan.

Terima kasih.`;

    return this.sendMessage(phone, message);
  },

  /**
   * Send signature confirmation request to driver
   * @param {object} params
   * @param {string} params.phone - Driver's WhatsApp number
   * @param {string} params.driverName - Driver's name
   * @param {string} params.sjNumber - Surat Jalan number
   * @param {number} params.nominal - Amount of uang jalan
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendSignatureRequest({ phone, driverName, sjNumber, nominal }) {
    const formattedNominal = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(nominal);

    // Fonnte supports URL buttons - use wa.me link with pre-filled message
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(`KONFIRMASI ${sjNumber}`)}`;

    const message = `━━━━━━━━━━━━━━━━━━
✍️ KONFIRMASI UANG JALAN
━━━━━━━━━━━━━━━━━━

*SJ:* ${sjNumber}
*Nominal:* ${formattedNominal}
*Driver:* ${driverName}

━━━━━━━━━━━━━━━━━━

Ketik: *KONFIRMASI ${sjNumber}*

di chat ini untuk konfirmasi.

Atau klik link:
${waLink}

Konfirmasi = Setuju uang jalan ${formattedNominal} sudah diterima.`;

    return this.sendMessage(phone, message);
  },

  /**
   * Parse incoming webhook data from Fonnte
   * @param {object} data - Webhook payload from Fonnte
   * @returns {object} Parsed data with type and details
   */
  parseWebhook(data) {
    console.log('[parseWebhook] Full data:', JSON.stringify(data));

    // Fonnte format: device, sender, message, url, filename, extension
    const from = data.sender || data.phone || data.from;
    const message = data.message || data.text || '';
    const imageUrl = data.url || null;
    const filename = data.filename || '';
    const extension = data.extension || '';

    console.log('[parseWebhook] Parsed - from:', from, 'message:', message, 'url:', imageUrl);

    // Check if it's an image (has url field with image extension or just url)
    if (imageUrl) {
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename) ||
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl) ||
                      data.url;
      if (isImage || imageUrl) {
        return {
          type: 'photo',
          phone: from,
          imageUrl: imageUrl,
          message: message,
        };
      }
    }

    // Check if it's a button response
    if (data.text) {
      return {
        type: 'button',
        phone: from,
        buttonText: data.text,
        message: message,
      };
    }

    // Check if it's a text message (could be confirmation)
    if (message) {
      const upperMessage = message.toUpperCase().trim();

      // Check for confirmation keywords
      if (upperMessage === 'KONFIRMASI' || upperMessage === 'OK' || upperMessage === 'YA' || upperMessage === 'CONFIRM') {
        return {
          type: 'confirmation',
          phone: from,
          message: upperMessage,
        };
      }

      return {
        type: 'text',
        phone: from,
        message: message,
      };
    }

    return {
      type: 'unknown',
      phone: from,
      data,
    };
  },
};

export default fonnteService;
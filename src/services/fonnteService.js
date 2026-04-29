/**
 * Fonnte Service - Frontend Client
 * Handles WhatsApp integration via backend API
 */

const API_BASE = '/api';

export const fonnteService = {
  /**
   * Send photo upload request via backend
   */
  async sendPhotoRequest({ phone, driverName, sjNumber }) {
    try {
      const response = await fetch(`${API_BASE}/fonnte/send-photo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, driverName, sjNumber }),
      });
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Send signature request via backend
   */
  async sendSignatureRequest({ phone, driverName, sjNumber, nominal }) {
    try {
      const response = await fetch(`${API_BASE}/fonnte/send-signature-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, driverName, sjNumber, nominal }),
      });
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get WhatsApp status for an SJ
   */
  async getStatus(sjNumber) {
    try {
      const response = await fetch(`${API_BASE}/fonnte/status/${encodeURIComponent(sjNumber)}`);
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Simulate webhook for testing
   */
  async simulateWebhook({ type, phone, message, image }) {
    try {
      const response = await fetch(`${API_BASE}/webhooks/fonnte/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, phone, message, image }),
      });
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default fonnteService;
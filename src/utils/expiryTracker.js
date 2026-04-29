// Expiry Tracker Service
// Monitors document expiration (STNK, KIR, SIM, Insurance) and sends reminders

const EXPIRY_TRACKER_KEY = 'fleet_ops_expiry_tracker';

const DOCUMENT_TYPES = {
  STNK: { name: 'STNK', defaultValidityMonths: 12, reminderDays: [30, 7] },
  KIR: { name: 'KIR', defaultValidityMonths: 6, reminderDays: [30, 7] },
  SIM: { name: 'SIM', defaultValidityMonths: 60, reminderDays: [30, 7] },
  INSURANCE: { name: 'Insurance', defaultValidityMonths: 12, reminderDays: [30, 7] },
  K3_CERT: { name: 'K3 Certificate', defaultValidityMonths: 12, reminderDays: [30] },
};

class ExpiryTracker {
  constructor() {
    this.documents = [];
    this._load();
  }

  /**
   * Register a document for expiry tracking
   * @param {object} options
   * @param {string} options.docType - STNK, KIR, SIM, INSURANCE, K3_CERT
   * @param {string} options.entityId - Truck ID or Driver ID
   * @param {string} options.entityType - 'truck' or 'driver'
   * @param {string} options.documentNumber - Document number
   * @param {Date} options.expiryDate - Expiration date
   * @param {string} [options.notes] - Additional notes
   */
  registerDocument({ docType, entityId, entityType, documentNumber, expiryDate, notes = '' }) {
    const entry = {
      id: this._generateId(),
      docType,
      entityId,
      entityType,
      documentNumber,
      expiryDate: new Date(expiryDate).toISOString(),
      notes,
      registeredAt: new Date().toISOString(),
      alertsSent: [],
    };

    this.documents.push(entry);
    this._save();
    return entry;
  }

  /**
   * Check for upcoming expiries and return alerts
   * @returns {Array} List of documents that need attention
   */
  checkExpiries() {
    const now = new Date();
    const alerts = [];

    for (const doc of this.documents) {
      const expiryDate = new Date(doc.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      const docTypeInfo = DOCUMENT_TYPES[doc.docType];
      if (!docTypeInfo) continue;

      for (const reminderDay of docTypeInfo.reminderDays) {
        if (daysUntilExpiry === reminderDay) {
          // Check if alert already sent for this day
          const alertKey = `${reminderDay}d`;
          if (!doc.alertsSent.includes(alertKey)) {
            alerts.push({
              ...doc,
              daysUntilExpiry,
              alertType: `${reminderDay}d_reminder`,
              severity: reminderDay <= 7 ? 'critical' : 'warning',
              message: `${docTypeInfo.name} for ${doc.entityType} ${doc.entityId} expires in ${reminderDay} days`,
            });
            doc.alertsSent.push(alertKey);
          }
        }
      }

      // Expired documents
      if (daysUntilExpiry < 0) {
        alerts.push({
          ...doc,
          daysUntilExpiry,
          alertType: 'expired',
          severity: 'critical',
          message: `${docTypeInfo.name} for ${doc.entityType} ${doc.entityId} has EXPIRED (${Math.abs(daysUntilExpiry)} days ago)`,
        });
      }
    }

    this._save();
    return alerts;
  }

  /**
   * Get all documents for an entity
   */
  getDocumentsForEntity(entityId, entityType) {
    return this.documents.filter(
      d => d.entityId === entityId && d.entityType === entityType
    );
  }

  /**
   * Check if entity has valid documents (not expired)
   */
  isEntityValid(entityId, entityType) {
    const docs = this.getDocumentsForEntity(entityId, entityType);
    const now = new Date();

    return docs.every(doc => new Date(doc.expiryDate) > now);
  }

  /**
   * Get days until earliest expiry for an entity
   */
  getEarliestExpiry(entityId, entityType) {
    const docs = this.getDocumentsForEntity(entityId, entityType);
    if (docs.length === 0) return null;

    const now = new Date();
    let earliest = Infinity;
    let earliestDoc = null;

    for (const doc of docs) {
      const daysUntil = Math.ceil((new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24));
      if (daysUntil < earliest) {
        earliest = daysUntil;
        earliestDoc = doc;
      }
    }

    return {
      daysUntil: earliest,
      document: earliestDoc,
      isValid: earliest > 0,
    };
  }

  /**
   * Update document expiry date (after renewal)
   */
  updateExpiry(documentId, newExpiryDate) {
    const doc = this.documents.find(d => d.id === documentId);
    if (!doc) return null;

    doc.expiryDate = new Date(newExpiryDate).toISOString();
    doc.alertsSent = []; // Reset alerts for new period
    this._save();
    return doc;
  }

  /**
   * Remove document from tracking
   */
  removeDocument(documentId) {
    this.documents = this.documents.filter(d => d.id !== documentId);
    this._save();
  }

  /**
   * Get all expired or soon-to-expire entities
   */
  getInvalidEntities(entityType = 'truck') {
    const now = new Date();
    const invalidEntities = new Set();

    for (const doc of this.documents) {
      if (doc.entityType !== entityType) continue;
      if (new Date(doc.expiryDate) <= now) {
        invalidEntities.add(doc.entityId);
      }
    }

    return Array.from(invalidEntities);
  }

  _generateId() {
    return `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _load() {
    try {
      const data = localStorage.getItem(EXPIRY_TRACKER_KEY);
      this.documents = data ? JSON.parse(data) : [];
    } catch {
      this.documents = [];
    }
  }

  _save() {
    localStorage.setItem(EXPIRY_TRACKER_KEY, JSON.stringify(this.documents));
  }
}

export { DOCUMENT_TYPES };
export const expiryTracker = new ExpiryTracker();
export default expiryTracker;

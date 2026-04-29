// Audit Logger Service
// Tracks all status changes and user actions with timestamp & user info

const AUDIT_LOG_KEY = 'fleet_ops_audit_log';

class AuditLogger {
  constructor() {
    this.currentUser = 'System Admin'; // Will be replaced with auth context
  }

  /**
   * Log an action with metadata
   * @param {object} options
   * @param {string} options.action - Action type (CREATE, UPDATE, DELETE, STATUS_CHANGE, VOID, APPROVE, REJECT)
   * @param {string} options.documentType - Document type (SJ, CHECKLIST, POD, LPJ, etc.)
   * @param {string} options.documentId - Document reference number
   * @param {string} options.details - Human-readable description
   * @param {object} [options.metadata] - Additional data
   * @returns {object} The created log entry
   */
  log({ action, documentType, documentId, details, metadata = {} }) {
    const entry = {
      id: this._generateId(),
      action,
      documentType,
      documentId,
      details,
      metadata,
      user: this.currentUser,
      timestamp: new Date().toISOString(),
    };

    const logs = this._getLogs();
    logs.unshift(entry); // Newest first

    // Keep only last 1000 entries to prevent storage bloat
    if (logs.length > 1000) logs.length = 1000;

    this._saveLogs(logs);
    return entry;
  }

  /**
   * Log status change specifically
   */
  logStatusChange(documentType, documentId, fromStatus, toStatus, additionalDetails = '') {
    return this.log({
      action: 'STATUS_CHANGE',
      documentType,
      documentId,
      details: `Status changed: ${fromStatus} → ${toStatus}${additionalDetails ? ` (${additionalDetails})` : ''}`,
      metadata: { fromStatus, toStatus },
    });
  }

  /**
   * Get logs with optional filtering
   */
  getLogs({ documentId, documentType, action, user, limit = 50 } = {}) {
    let logs = this._getLogs();

    if (documentId) logs = logs.filter(l => l.documentId === documentId);
    if (documentType) logs = logs.filter(l => l.documentType === documentType);
    if (action) logs = logs.filter(l => l.action === action);
    if (user) logs = logs.filter(l => l.user === user);

    return logs.slice(0, limit);
  }

  /**
   * Get audit trail for a specific document
   */
  getDocumentTrail(documentId) {
    return this.getLogs({ documentId, limit: 100 });
  }

  /**
   * Clear all logs (admin function)
   */
  clearLogs() {
    localStorage.removeItem(AUDIT_LOG_KEY);
  }

  _generateId() {
    return `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _getLogs() {
    try {
      const data = localStorage.getItem(AUDIT_LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveLogs(logs) {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }
}

export const auditLogger = new AuditLogger();
export default auditLogger;

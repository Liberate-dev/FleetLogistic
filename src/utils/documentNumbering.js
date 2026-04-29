// Document Numbering Service
// Format: SJ/[KODE-CABANG]/[YYYY]/[MM]/[NNNN]
// Example: SJ/MLG/2025/04/0047

const BRANCH_CODES = {
  malang: 'MLG',
  jakarta: 'JKT',
  surabaya: 'SBY',
  cikarang: 'CKR',
};

class DocumentNumberingService {
  constructor() {
    this.storageKey = 'fleet_ops_doc_numbers';
  }

  /**
   * Generate document number for a specific type and branch
   * @param {string} docType - Document type prefix (SJ, CL, POD, LPJ)
   * @param {string} branch - Branch identifier
   * @returns {object} { number, sequence, timestamp }
   */
  generateNumber(docType, branch = 'malang') {
    const branchCode = BRANCH_CODES[branch] || branch.toUpperCase().slice(0, 3);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const counters = this._getCounters();
    const key = `${docType}/${branchCode}/${year}/${month}`;

    const currentSequence = (counters[key] || 0) + 1;
    counters[key] = currentSequence;

    this._saveCounters(counters);

    const sequenceStr = String(currentSequence).padStart(4, '0');
    const number = `${docType}/${branchCode}/${year}/${month}/${sequenceStr}`;

    return {
      number,
      sequence: currentSequence,
      timestamp: now.toISOString(),
      key,
    };
  }

  /**
   * Reserve a number without using it (for voided documents)
   */
  reserveNumber(docType, branch = 'malang') {
    const result = this.generateNumber(docType, branch);
    this._markVoid(result.key);
    return result;
  }

  /**
   * Get next sequence number without incrementing
   */
  peekNext(docType, branch = 'malang') {
    const branchCode = BRANCH_CODES[branch] || branch.toUpperCase().slice(0, 3);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const counters = this._getCounters();
    const key = `${docType}/${branchCode}/${year}/${month}`;
    const next = (counters[key] || 0) + 1;

    return String(next).padStart(4, '0');
  }

  /**
   * Mark a number as void in audit log
   */
  _markVoid(key) {
    const voids = this._getVoids();
    if (!voids[key]) voids[key] = [];
    voids[key].push({
      timestamp: new Date().toISOString(),
      reason: 'Document cancelled',
    });
    localStorage.setItem(`${this.storageKey}_voids`, JSON.stringify(voids));
  }

  _getCounters() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _saveCounters(counters) {
    localStorage.setItem(this.storageKey, JSON.stringify(counters));
  }

  _getVoids() {
    try {
      const data = localStorage.getItem(`${this.storageKey}_voids`);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }
}

export const documentNumberingService = new DocumentNumberingService();
export default documentNumberingService;

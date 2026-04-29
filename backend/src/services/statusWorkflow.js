/**
 * Status Workflow Service
 * Enforces valid state transitions for Surat Jalan documents
 */

const SJStatus = {
  DRAFT: 'DRAFT',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const ALLOWED_TRANSITIONS = {
  [SJStatus.DRAFT]: [SJStatus.ASSIGNED, SJStatus.CANCELLED],
  [SJStatus.ASSIGNED]: [SJStatus.DISPATCHED, SJStatus.CANCELLED],
  [SJStatus.DISPATCHED]: [SJStatus.DELIVERED, SJStatus.CANCELLED],
  [SJStatus.DELIVERED]: [SJStatus.COMPLETED, SJStatus.CANCELLED],
  [SJStatus.COMPLETED]: [], // Final state
  [SJStatus.CANCELLED]: []  // Final state
};

export function validateTransition(currentStatus, newStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`
    };
  }

  return { valid: true };
}

export function getNextStatuses(currentStatus) {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

export function canEdit(currentStatus) {
  // Only DRAFT status allows full editing
  return currentStatus === SJStatus.DRAFT;
}

export function canCancel(currentStatus) {
  // Can cancel if not already completed or cancelled
  return ![SJStatus.COMPLETED, SJStatus.CANCELLED].includes(currentStatus);
}

export function requiresGateCheck(currentStatus, newStatus) {
  // Transitioning from ASSIGNED to DISPATCHED requires gate check
  return currentStatus === SJStatus.ASSIGNED && newStatus === SJStatus.DISPATCHED;
}

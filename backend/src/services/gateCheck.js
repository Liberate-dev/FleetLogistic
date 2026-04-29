/**
 * Gate Check Service
 * Validates if a dispatch can proceed based on vehicle and driver document validity
 */

const SJStatus = {
  DRAFT: 'DRAFT',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const GateCheckStatus = {
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  FAILED: 'FAILED'
};

export async function validateDispatch(prisma, suratJalanId) {
  const errors = [];

  // Get SJ with dispatch details
  const sj = await prisma.suratJalan.findUnique({
    where: { id: suratJalanId },
    include: {
      dispatch: {
        include: {
          vehicle: true,
          driver: true
        }
      }
    }
  });

  if (!sj) {
    errors.push('Surat Jalan not found');
    return { valid: false, errors };
  }

  // Check SJ status
  if (sj.status !== SJStatus.ASSIGNED) {
    errors.push(`Surat Jalan must be in ASSIGNED status. Current: ${sj.status}`);
  }

  // Check dispatch exists
  if (!sj.dispatch) {
    errors.push('Dispatch record not found. Please assign vehicle and driver first.');
    return { valid: false, errors };
  }

  // Check vehicle
  const vehicle = sj.dispatch.vehicle;
  if (!vehicle) {
    errors.push('Vehicle not assigned');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (vehicle.stnkExpiry) {
      const stnkExpiry = new Date(vehicle.stnkExpiry);
      stnkExpiry.setHours(0, 0, 0, 0);
      if (stnkExpiry < today) {
        errors.push(`Vehicle STNK expired on ${vehicle.stnkExpiry.toLocaleDateString()}`);
      }
    }

    if (vehicle.kirExpiry) {
      const kirExpiry = new Date(vehicle.kirExpiry);
      kirExpiry.setHours(0, 0, 0, 0);
      if (kirExpiry < today) {
        errors.push(`Vehicle KIR expired on ${vehicle.kirExpiry.toLocaleDateString()}`);
      }
    }

    if (vehicle.status === 'MAINTENANCE') {
      errors.push('Vehicle is under maintenance');
    } else if (vehicle.status === 'INACTIVE') {
      errors.push('Vehicle is inactive');
    }
  }

  // Check driver
  const driver = sj.dispatch.driver;
  if (!driver) {
    errors.push('Driver not assigned');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (driver.licenseExpiry) {
      const licenseExpiry = new Date(driver.licenseExpiry);
      licenseExpiry.setHours(0, 0, 0, 0);
      if (licenseExpiry < today) {
        errors.push(`Driver license expired on ${driver.licenseExpiry.toLocaleDateString()}`);
      }
    }

    if (driver.status === 'ON_LEAVE') {
      errors.push('Driver is on leave');
    } else if (driver.status === 'INACTIVE') {
      errors.push('Driver is inactive');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export async function performGateCheck(prisma, dispatchId, userId, notes) {
  const dispatch = await prisma.dispatch.findUnique({
    where: { id: dispatchId },
    include: {
      suratJalan: true,
      vehicle: true,
      driver: true,
      vehicleChecklist: true,
      driverChecklist: true
    }
  });

  if (!dispatch) {
    throw Object.assign(new Error('Dispatch not found'), { status: 404 });
  }

  if (dispatch.gateCheckStatus !== GateCheckStatus.PENDING) {
    throw Object.assign(new Error('Gate check already performed'), { status: 400 });
  }

  // Check vehicle checklist
  if (!dispatch.vehicleChecklist) {
    throw Object.assign(new Error('Vehicle checklist required before gate check'), { status: 400 });
  }

  // Check driver checklist
  if (!dispatch.driverChecklist) {
    throw Object.assign(new Error('Driver checklist required before gate check'), { status: 400 });
  }

  // Validate vehicle and driver documents
  const validation = await validateDispatch(prisma, dispatch.suratJalanId);

  // Determine gate check result
  const passed = validation.valid && notes === undefined;

  const updatedDispatch = await prisma.dispatch.update({
    where: { id: dispatchId },
    data: {
      gateCheckStatus: passed ? GateCheckStatus.PASSED : GateCheckStatus.FAILED,
      gateCheckNotes: notes || validation.errors.join('; '),
      gateCheckAt: new Date(),
      gateCheckById: userId
    }
  });

  // Create notification if failed
  if (!passed) {
    await prisma.notification.create({
      data: {
        userId: userId || 'system',
        type: 'GATE_CHECK_FAILED',
        title: 'Gate Check Failed',
        message: `Gate check failed for ${dispatch.suratJalan.documentNumber}: ${validation.errors.join(', ')}`
      }
    });
  }

  return {
    passed,
    validation,
    dispatch: updatedDispatch
  };
}

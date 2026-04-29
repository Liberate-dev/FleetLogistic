/**
 * Expiry Tracking Service
 * Checks for expiring documents and creates notifications
 */
export async function checkExpiringDocuments(prisma, daysThreshold = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);

  const notifications = [];

  // Check expiring vehicles
  const expiringVehicles = await prisma.vehicle.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { stnkExpiry: { lte: futureDate, gte: today } },
        { kirExpiry: { lte: futureDate, gte: today } }
      ]
    }
  });

  for (const vehicle of expiringVehicles) {
    let daysUntilExpiry = null;
    let docType = null;

    if (vehicle.stnkExpiry) {
      const stnkExpiry = new Date(vehicle.stnkExpiry);
      const days = Math.ceil((stnkExpiry - today) / (1000 * 60 * 60 * 24));
      if (days <= daysThreshold && days >= 0) {
        daysUntilExpiry = days;
        docType = 'STNK';
      }
    }

    if (vehicle.kirExpiry && !daysUntilExpiry) {
      const kirExpiry = new Date(vehicle.kirExpiry);
      const days = Math.ceil((kirExpiry - today) / (1000 * 60 * 60 * 24));
      if (days <= daysThreshold && days >= 0) {
        daysUntilExpiry = days;
        docType = 'KIR';
      }
    }

    if (daysUntilExpiry !== null) {
      // Check if notification already exists
      const existing = await prisma.notification.findFirst({
        where: {
          entityType: 'Vehicle',
          entityId: vehicle.id,
          type: 'EXPIRY_WARNING',
          createdAt: { gte: new Date(today.setHours(0, 0, 0, 0)) }
        }
      });

      if (!existing) {
        const notification = await prisma.notification.create({
          data: {
            userId: 'system',
            type: 'EXPIRY_WARNING',
            title: `${docType} Expires Soon`,
            message: `${vehicle.plateNumber} - ${docType} expires in ${daysUntilExpiry} day(s)`,
            entityType: 'Vehicle',
            entityId: vehicle.id
          }
        });
        notifications.push(notification);
      }
    }
  }

  // Check expiring driver licenses
  const expiringDrivers = await prisma.driver.findMany({
    where: {
      status: 'ACTIVE',
      licenseExpiry: {
        lte: futureDate,
        gte: today
      }
    }
  });

  for (const driver of expiringDrivers) {
    const licenseExpiry = new Date(driver.licenseExpiry);
    const daysUntilExpiry = Math.ceil((licenseExpiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0) {
      const existing = await prisma.notification.findFirst({
        where: {
          entityType: 'Driver',
          entityId: driver.id,
          type: 'EXPIRY_WARNING',
          createdAt: { gte: new Date(today.setHours(0, 0, 0, 0)) }
        }
      });

      if (!existing) {
        const notification = await prisma.notification.create({
          data: {
            userId: 'system',
            type: 'EXPIRY_WARNING',
            title: 'License Expires Soon',
            message: `${driver.name} (${driver.employeeId}) - License expires in ${daysUntilExpiry} day(s)`,
            entityType: 'Driver',
            entityId: driver.id
          }
        });
        notifications.push(notification);
      }
    }
  }

  return notifications;
}

export async function getExpiringVehicles(prisma, daysThreshold = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);

  return prisma.vehicle.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { stnkExpiry: { lte: futureDate, gte: today } },
        { kirExpiry: { lte: futureDate, gte: today } }
      ]
    },
    orderBy: [
      { stnkExpiry: 'asc' },
      { kirExpiry: 'asc' }
    ]
  });
}

export async function getExpiringDrivers(prisma, daysThreshold = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);

  return prisma.driver.findMany({
    where: {
      status: 'ACTIVE',
      licenseExpiry: {
        lte: futureDate,
        gte: today
      }
    },
    orderBy: {
      licenseExpiry: 'asc'
    }
  });
}

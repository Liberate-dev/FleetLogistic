import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database with full operational data...');

  // 1. Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fleetops.com' },
    update: {},
    create: {
      email: 'admin@fleetops.com',
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@fleetops.com' },
    update: {},
    create: {
      email: 'operator@fleetops.com',
      name: 'Operator User',
      role: 'OPERATOR'
    }
  });

  console.log('✓ Users created');

  // 2. Create Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { code: 'CUST-001' },
      update: {},
      create: { code: 'CUST-001', name: 'PT Maju Bersama', address: 'Jl. Sudirman No. 123, Jakarta', phone: '021-1234567' }
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-002' },
      update: {},
      create: { code: 'CUST-002', name: 'CV Karya Mandiri', address: 'Jl. Gatot Subroto No. 456, Bandung', phone: '022-7654321' }
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-003' },
      update: {},
      create: { code: 'CUST-003', name: 'UD Sumber Rejeki', address: 'Jl. Ahmad Yani No. 789, Surabaya', phone: '031-9876543' }
    })
  ]);

  console.log('✓ Customers created');

  // 3. Create Materials
  const materials = await Promise.all([
    prisma.material.upsert({
      where: { code: 'MAT-001' },
      update: {},
      create: { code: 'MAT-001', name: 'Besi Beton 10mm', unit: 'batang' }
    }),
    prisma.material.upsert({
      where: { code: 'MAT-002' },
      update: {},
      create: { code: 'MAT-002', name: 'Semen Holcim', unit: 'zak' }
    }),
    prisma.material.upsert({
      where: { code: 'MAT-003' },
      update: {},
      create: { code: 'MAT-003', name: 'Pasir Bangunan', unit: 'm3' }
    }),
    prisma.material.upsert({
      where: { code: 'MAT-004' },
      update: {},
      create: { code: 'MAT-004', name: 'Batu Kali', unit: 'm3' }
    }),
    prisma.material.upsert({
      where: { code: 'MAT-005' },
      update: {},
      create: { code: 'MAT-005', name: 'Kayu Meranti', unit: 'm3' }
    })
  ]);

  console.log('✓ Materials created');

  // 4. Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { plateNumber: 'B 1234 ABC' },
      update: {},
      create: {
        plateNumber: 'B 1234 ABC',
        type: 'TRUCK',
        capacity: 5000,
        stnkExpiry: new Date('2026-12-31'),
        kirExpiry: new Date('2026-06-30'),
        status: 'ACTIVE'
      }
    }),
    prisma.vehicle.upsert({
      where: { plateNumber: 'B 5678 DEF' },
      update: {},
      create: {
        plateNumber: 'B 5678 DEF',
        type: 'TRUCK',
        capacity: 8000,
        stnkExpiry: new Date('2026-11-30'),
        kirExpiry: new Date('2026-05-31'),
        status: 'ACTIVE'
      }
    }),
    prisma.vehicle.upsert({
      where: { plateNumber: 'D 9012 GHI' },
      update: {},
      create: {
        plateNumber: 'D 9012 GHI',
        type: 'VAN',
        capacity: 2000,
        stnkExpiry: new Date('2026-10-31'),
        kirExpiry: new Date('2026-04-30'),
        status: 'ACTIVE'
      }
    })
  ]);

  console.log('✓ Vehicles created');

  // 5. Create Drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { employeeId: 'DRV-001' },
      update: {},
      create: {
        employeeId: 'DRV-001',
        name: 'Budi Santoso',
        phone: '0812-3456-7890',
        licenseExpiry: new Date('2027-01-15'),
        status: 'ACTIVE'
      }
    }),
    prisma.driver.upsert({
      where: { employeeId: 'DRV-002' },
      update: {},
      create: {
        employeeId: 'DRV-002',
        name: 'Ahmad Hidayat',
        phone: '0813-4567-8901',
        licenseExpiry: new Date('2026-11-20'),
        status: 'ACTIVE'
      }
    }),
    prisma.driver.upsert({
      where: { employeeId: 'DRV-003' },
      update: {},
      create: {
        employeeId: 'DRV-003',
        name: 'Dedi Kurniawan',
        phone: '0814-5678-9012',
        licenseExpiry: new Date('2026-08-10'),
        status: 'ACTIVE'
      }
    })
  ]);

  console.log('✓ Drivers created');

  // 6. Create Surat Jalan 1: DRAFT Status (New Order)
  const sj1 = await prisma.suratJalan.upsert({
    where: { documentNumber: 'SJ-20260428-001' },
    update: {},
    create: {
      documentNumber: 'SJ-20260428-001',
      customerId: customers[0].id,
      date: new Date(),
      status: 'DRAFT',
      destination: 'PT Maju Bersama - Pabrik Jakarta Timur',
      destinationAddress: 'Jl. Sudirman No. 123, Kawasan Industri Jakarta Timur',
      originDepot: 'Warehouse A - Jakarta Timur',
      contactPerson: 'Bapak Hendra Wijaya',
      contactPhone: '021-1234567',
      createdByName: 'Admin Operasional',
      notes: 'Total Weight: 15.50 Ton | Total Qty: 150 | Photo Count: 2',
      createdById: adminUser.id,
      uangJalanNominal: 500000,
      uangJalanRecipient: 'Budi Santoso',
      items: {
        create: [
          { materialId: materials[0].id, quantity: 100, unitPrice: 75000 },
          { materialId: materials[1].id, quantity: 50, unitPrice: 65000 }
        ]
      }
    }
  });

  // 7. Create Surat Jalan 2: ASSIGNED Status (Dispatched but not departed)
  const sj2 = await prisma.suratJalan.upsert({
    where: { documentNumber: 'SJ-20260428-002' },
    update: {},
    create: {
      documentNumber: 'SJ-20260428-002',
      customerId: customers[1].id,
      date: new Date(Date.now() - 86400000), // 1 day ago
      status: 'ASSIGNED',
      destination: 'CV Karya Mandiri - Site Cikarang',
      destinationAddress: 'Kawasan Industri Cikarang Blok C No. 5',
      originDepot: 'Warehouse A - Jakarta Timur',
      contactPerson: 'Ibu Ratna',
      contactPhone: '0812-9876-5432',
      createdByName: 'Admin Operasional',
      notes: 'Total Weight: 8.00 Ton | Total Qty: 80 | Photo Count: 0',
      createdById: adminUser.id,
      uangJalanNominal: 750000,
      uangJalanRecipient: 'Ahmad Hidayat',
      items: {
        create: [
          { materialId: materials[2].id, quantity: 80, unitPrice: 150000 }
        ]
      },
      dispatch: {
        create: {
          vehicleId: vehicles[1].id,
          driverId: drivers[1].id,
          status: 'ASSIGNED',
          gateCheckStatus: 'PENDING',
          vehicleChecklist: {
            create: {
              vehicleId: vehicles[1].id,
              checklistItems: JSON.stringify(['Ban', 'Rem', 'Lampu', 'Oli']),
              condition: 'GOOD',
              checkedById: operatorUser.id
            }
          },
          driverChecklist: {
            create: {
              driverId: drivers[1].id,
              hasLicense: true,
              licenseValid: true,
              condition: 'FIT',
              checkedById: operatorUser.id
            }
          }
        }
      }
    }
  });

  // 8. Create Surat Jalan 3: DISPATCHED Status (On the road)
  const sj3 = await prisma.suratJalan.upsert({
    where: { documentNumber: 'SJ-20260428-003' },
    update: {},
    create: {
      documentNumber: 'SJ-20260428-003',
      customerId: customers[2].id,
      date: new Date(Date.now() - 172800000), // 2 days ago
      status: 'DISPATCHED',
      destination: 'UD Sumber Rejeki - Surabaya',
      destinationAddress: 'Jl. Ahmad Yani No. 789, Surabaya',
      originDepot: 'Warehouse B - Cikarang',
      contactPerson: 'Bapak Joko',
      contactPhone: '0811-2222-3333',
      createdByName: 'Operator User',
      notes: 'Urgent Delivery - Total Weight: 12.00 Ton | Total Qty: 120 | Photo Count: 3',
      createdById: operatorUser.id,
      dispatchedAt: new Date(Date.now() - 86400000),
      uangJalanNominal: 1500000,
      danaCadanganNominal: 500000,
      uangJalanRecipient: 'Budi Santoso',
      items: {
        create: [
          { materialId: materials[3].id, quantity: 100, unitPrice: 85000 },
          { materialId: materials[4].id, quantity: 20, unitPrice: 200000 }
        ]
      },
      dispatch: {
        create: {
          vehicleId: vehicles[0].id,
          driverId: drivers[0].id,
          status: 'DISPATCHED',
          gateCheckStatus: 'PASSED',
          gateCheckAt: new Date(Date.now() - 86400000),
          gateCheckById: operatorUser.id,
          vehicleChecklist: {
            create: {
              vehicleId: vehicles[0].id,
              checklistItems: JSON.stringify(['Ban', 'Rem', 'Lampu', 'Oli', 'Wiper']),
              condition: 'GOOD',
              checkedById: operatorUser.id
            }
          },
          driverChecklist: {
            create: {
              driverId: drivers[0].id,
              hasLicense: true,
              licenseValid: true,
              condition: 'FIT',
              checkedById: operatorUser.id
            }
          }
        }
      }
    }
  });

  // 9. Create Surat Jalan 4: DELIVERED Status (Needs LPJ)
  const sj4 = await prisma.suratJalan.upsert({
    where: { documentNumber: 'SJ-20260428-004' },
    update: {},
    create: {
      documentNumber: 'SJ-20260428-004',
      customerId: customers[0].id,
      date: new Date(Date.now() - 345600000), // 4 days ago
      status: 'DELIVERED',
      destination: 'PT Maju Bersama - Warehouse',
      destinationAddress: 'Kawasan Industri Pulogadung',
      originDepot: 'Warehouse A - Jakarta Timur',
      contactPerson: 'Bapak Hendra Wijaya',
      contactPhone: '021-1234567',
      createdByName: 'Admin Operasional',
      notes: 'Total Weight: 2.00 Ton | Total Qty: 20 | Photo Count: 5',
      createdById: adminUser.id,
      dispatchedAt: new Date(Date.now() - 259200000),
      deliveredAt: new Date(Date.now() - 86400000), // Delivered 1 day ago
      uangJalanNominal: 300000,
      uangJalanRecipient: 'Dedi Kurniawan',
      items: {
        create: [
          { materialId: materials[1].id, quantity: 20, unitPrice: 65000 }
        ]
      },
      dispatch: {
        create: {
          vehicleId: vehicles[2].id,
          driverId: drivers[2].id,
          status: 'DELIVERED',
          gateCheckStatus: 'PASSED',
          gateCheckAt: new Date(Date.now() - 259200000),
          gateCheckById: operatorUser.id,
          vehicleChecklist: {
            create: {
              vehicleId: vehicles[2].id,
              checklistItems: JSON.stringify(['Ban', 'Rem', 'Lampu', 'Oli']),
              condition: 'GOOD',
              checkedById: operatorUser.id
            }
          },
          driverChecklist: {
            create: {
              driverId: drivers[2].id,
              hasLicense: true,
              licenseValid: true,
              condition: 'FIT',
              checkedById: operatorUser.id
            }
          },
          pod: {
            create: {
              receivedBy: 'Pak Satpam (Agus)',
              receivedAt: new Date(Date.now() - 86400000),
              notes: 'Diterima dalam kondisi baik',
              submittedById: operatorUser.id,
              photos: JSON.stringify(['/sample-pod-1.jpg', '/sample-pod-2.jpg'])
            }
          }
        }
      }
    }
  });

  // 10. Create Surat Jalan 5: COMPLETED Status (Has POD and LPJ)
  const sj5 = await prisma.suratJalan.upsert({
    where: { documentNumber: 'SJ-20260428-005' },
    update: {},
    create: {
      documentNumber: 'SJ-20260428-005',
      customerId: customers[1].id,
      date: new Date(Date.now() - 604800000), // 7 days ago
      status: 'COMPLETED',
      destination: 'CV Karya Mandiri - Pusat',
      destinationAddress: 'Jl. Merdeka No. 1, Bandung',
      originDepot: 'Warehouse B - Cikarang',
      contactPerson: 'Ibu Ratna',
      contactPhone: '0812-9876-5432',
      createdByName: 'Operator User',
      notes: 'Total Weight: 5.00 Ton | Total Qty: 50 | Photo Count: 4',
      createdById: operatorUser.id,
      dispatchedAt: new Date(Date.now() - 518400000),
      deliveredAt: new Date(Date.now() - 432000000),
      completedAt: new Date(Date.now() - 345600000),
      uangJalanNominal: 600000,
      uangJalanRecipient: 'Ahmad Hidayat',
      items: {
        create: [
          { materialId: materials[0].id, quantity: 50, unitPrice: 75000 }
        ]
      },
      dispatch: {
        create: {
          vehicleId: vehicles[1].id,
          driverId: drivers[1].id,
          status: 'COMPLETED',
          gateCheckStatus: 'PASSED',
          gateCheckAt: new Date(Date.now() - 518400000),
          gateCheckById: adminUser.id,
          vehicleChecklist: {
            create: {
              vehicleId: vehicles[1].id,
              checklistItems: JSON.stringify(['Ban', 'Rem', 'Lampu', 'Oli', 'Klakson']),
              condition: 'GOOD',
              checkedById: adminUser.id
            }
          },
          driverChecklist: {
            create: {
              driverId: drivers[1].id,
              hasLicense: true,
              licenseValid: true,
              condition: 'FIT',
              checkedById: adminUser.id
            }
          },
          pod: {
            create: {
              receivedBy: 'Gudang Utama - Bpk Rudi',
              receivedAt: new Date(Date.now() - 432000000),
              notes: 'Barang komplit sesuai DO',
              submittedById: adminUser.id,
              photos: JSON.stringify(['/sample-pod-completed.jpg'])
            }
          },
          lpj: {
            create: {
              startKm: 45000,
              endKm: 45210,
              fuelUsed: 40.5,
              expenses: JSON.stringify([
                { category: 'BBM', amount: 350000, description: 'Solar SPBU Tol' },
                { category: 'Toll', amount: 150000, description: 'Tol Japek & Cipularang' },
                { category: 'Parkir', amount: 20000, description: 'Parkir Kawasan' }
              ]),
              notes: 'Perjalanan lancar, tidak ada kendala',
              submittedById: operatorUser.id
            }
          }
        }
      }
    }
  });

  console.log('✓ Dispatches, Checklists, PODs, and LPJs generated for SJs');

  // 11. Add Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'SYSTEM',
        title: 'System Initialized',
        message: 'Welcome to FleetOps Logistics Command Center.',
        read: false
      },
      {
        userId: operatorUser.id,
        type: 'DISPATCH',
        title: 'New Dispatch Assigned',
        message: 'You have been assigned to review Gate Checks for SJ-20260428-002.',
        read: false
      },
      {
        userId: adminUser.id,
        type: 'POD',
        title: 'POD Received',
        message: 'Proof of Delivery for SJ-20260428-004 has been uploaded by the driver.',
        read: false
      }
    ]
  });

  console.log('✓ Notifications generated');

  // 12. Add Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        entityType: 'SuratJalan',
        entityId: sj5.id,
        action: 'CREATE',
        newValue: 'Created Draft SJ-20260428-005'
      },
      {
        userId: operatorUser.id,
        entityType: 'LPJ',
        entityId: sj5.id, // technically dispatchId/lpjId, but for logging demo this is fine
        action: 'APPROVE',
        newValue: 'LPJ Approved and SJ marked COMPLETED'
      }
    ]
  });

  console.log('✓ Audit Logs generated');

  console.log('\n✅ Seeding complete!');
  console.log('\nSample data populated:');
  console.log('- 1 DRAFT Surat Jalan');
  console.log('- 1 ASSIGNED Surat Jalan (Ready for Dispatch)');
  console.log('- 1 DISPATCHED Surat Jalan (In Transit)');
  console.log('- 1 DELIVERED Surat Jalan (Awaiting LPJ)');
  console.log('- 1 COMPLETED Surat Jalan (Full cycle: Checklists, POD, LPJ)');
  console.log('- Notifications & Audit Logs included for Dashboard visualization');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

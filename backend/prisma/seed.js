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

  // Clear existing transactions to enable clean re-seeding
  console.log('🧹 Clearing old transaction tables...');
  await prisma.lPJ.deleteMany({});
  await prisma.pOD.deleteMany({});
  await prisma.vehicleChecklist.deleteMany({});
  await prisma.driverChecklist.deleteMany({});
  await prisma.dispatch.deleteMany({});
  await prisma.suratJalanItem.deleteMany({});
  await prisma.suratJalan.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  console.log('✓ Transaction tables cleared');

  // 6. Generate rich operational records (January - June 2026)
  const historicalShipments = [
    // January 2026
    { date: '2026-01-10T08:00:00Z', status: 'COMPLETED', customerIdx: 0, dest: 'PT Maju Bersama - Surabaya Depot', origin: 'Warehouse A - Jakarta', uJ: 1200000, dC: 300000, odoStart: 10000, odoEnd: 10780, fuel: 220, exp: [{ cat: 'BBM', amt: 1500000 }, { cat: 'Toll', amt: 450000 }] },
    { date: '2026-01-18T09:30:00Z', status: 'COMPLETED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15000, odoEnd: 15150, fuel: 45, exp: [{ cat: 'BBM', amt: 350000 }, { cat: 'Toll', amt: 150000 }] },
    { date: '2026-01-25T11:00:00Z', status: 'COMPLETED', customerIdx: 2, dest: 'UD Sumber Rejeki - Malang', origin: 'Warehouse B - Surabaya', uJ: 500000, dC: 100000, odoStart: 22000, odoEnd: 22095, fuel: 30, exp: [{ cat: 'BBM', amt: 220000 }, { cat: 'Parkir', amt: 15000 }] },
    // February 2026
    { date: '2026-02-05T07:15:00Z', status: 'COMPLETED', customerIdx: 0, dest: 'PT Maju Bersama - Jakarta Timur', origin: 'Warehouse A - Jakarta', uJ: 300000, dC: 50000, odoStart: 10780, odoEnd: 10835, fuel: 15, exp: [{ cat: 'BBM', amt: 120000 }, { cat: 'Parkir', amt: 20000 }] },
    { date: '2026-02-12T08:45:00Z', status: 'COMPLETED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15150, odoEnd: 15305, fuel: 46, exp: [{ cat: 'BBM', amt: 350000 }, { cat: 'Toll', amt: 160000 }] },
    { date: '2026-02-20T10:00:00Z', status: 'COMPLETED', customerIdx: 2, dest: 'UD Sumber Rejeki - Surabaya', origin: 'Warehouse B - Surabaya', uJ: 400000, dC: 50000, odoStart: 22095, odoEnd: 22125, fuel: 10, exp: [{ cat: 'BBM', amt: 90000 }] },
    { date: '2026-02-27T13:20:00Z', status: 'COMPLETED', customerIdx: 0, dest: 'PT Maju Bersama - Surabaya Depot', origin: 'Warehouse A - Jakarta', uJ: 1200000, dC: 300000, odoStart: 10835, odoEnd: 11625, fuel: 225, exp: [{ cat: 'BBM', amt: 1550000 }, { cat: 'Toll', amt: 460000 }] },
    // March 2026
    { date: '2026-03-04T08:00:00Z', status: 'COMPLETED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15305, odoEnd: 15460, fuel: 44, exp: [{ cat: 'BBM', amt: 340000 }, { cat: 'Toll', amt: 150000 }] },
    { date: '2026-03-12T09:00:00Z', status: 'COMPLETED', customerIdx: 2, dest: 'UD Sumber Rejeki - Surabaya', origin: 'Warehouse B - Surabaya', uJ: 400000, dC: 50000, odoStart: 22125, odoEnd: 22160, fuel: 12, exp: [{ cat: 'BBM', amt: 100000 }] },
    { date: '2026-03-18T10:15:00Z', status: 'COMPLETED', customerIdx: 0, dest: 'PT Maju Bersama - Jakarta Timur', origin: 'Warehouse A - Jakarta', uJ: 300000, dC: 50000, odoStart: 11625, odoEnd: 11675, fuel: 14, exp: [{ cat: 'BBM', amt: 110000 }, { cat: 'Parkir', amt: 25000 }] },
    { date: '2026-03-25T14:30:00Z', status: 'COMPLETED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15460, odoEnd: 15612, fuel: 45, exp: [{ cat: 'BBM', amt: 350000 }, { cat: 'Toll', amt: 150000 }] },
    // April 2026
    { date: '2026-04-03T07:30:00Z', status: 'COMPLETED', customerIdx: 2, dest: 'UD Sumber Rejeki - Malang', origin: 'Warehouse B - Surabaya', uJ: 500000, dC: 100000, odoStart: 22160, odoEnd: 22255, fuel: 28, exp: [{ cat: 'BBM', amt: 230000 }, { cat: 'Toll', amt: 40000 }] },
    { date: '2026-04-10T08:00:00Z', status: 'COMPLETED', customerIdx: 0, dest: 'PT Maju Bersama - Surabaya Depot', origin: 'Warehouse A - Jakarta', uJ: 1200000, dC: 300000, odoStart: 11675, odoEnd: 12455, fuel: 222, exp: [{ cat: 'BBM', amt: 1520000 }, { cat: 'Toll', amt: 450000 }] },
    { date: '2026-04-17T09:15:00Z', status: 'COMPLETED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15612, odoEnd: 15765, fuel: 46, exp: [{ cat: 'BBM', amt: 360000 }, { cat: 'Toll', amt: 150000 }] },
    { date: '2026-04-24T11:00:00Z', status: 'COMPLETED', customerIdx: 2, dest: 'UD Sumber Rejeki - Surabaya', origin: 'Warehouse B - Surabaya', uJ: 400000, dC: 50000, odoStart: 22255, odoEnd: 22285, fuel: 9, exp: [{ cat: 'BBM', amt: 80000 }] },
    // May 2026
    { date: '2026-05-02T08:00:00Z', status: 'COMPLETED', customerIdx: 0, dest: 'PT Maju Bersama - Jakarta Timur', origin: 'Warehouse A - Jakarta', uJ: 300000, dC: 50000, odoStart: 12455, odoEnd: 12510, fuel: 16, exp: [{ cat: 'BBM', amt: 130000 }, { cat: 'Parkir', amt: 20000 }] },
    { date: '2026-05-08T09:00:00Z', status: 'COMPLETED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15765, odoEnd: 15920, fuel: 45, exp: [{ cat: 'BBM', amt: 350000 }, { cat: 'Toll', amt: 150000 }] },
    { date: '2026-05-15T10:30:00Z', status: 'COMPLETED', customerIdx: 2, dest: 'UD Sumber Rejeki - Malang', origin: 'Warehouse B - Surabaya', uJ: 500000, dC: 100000, odoStart: 22285, odoEnd: 22380, fuel: 29, exp: [{ cat: 'BBM', amt: 230000 }, { cat: 'Toll', amt: 40000 }] },
    // Deliberate Discrepancies in May for POD Reports
    { date: '2026-05-22T08:30:00Z', status: 'DELIVERED', customerIdx: 0, dest: 'PT Maju Bersama - Surabaya Depot', origin: 'Warehouse A - Jakarta', uJ: 1200000, dC: 300000, odoStart: 12510, odoEnd: 13295, fuel: 226, exp: [{ cat: 'BBM', amt: 1560000 }, { cat: 'Toll', amt: 460000 }], podCondition: 'damaged', discrepancy: 'Besi beton patah 2 batang karena benturan saat bongkar muat' },
    { date: '2026-05-27T11:00:00Z', status: 'DELIVERED', customerIdx: 1, dest: 'CV Karya Mandiri - Bandung Site', origin: 'Warehouse A - Jakarta', uJ: 600000, dC: 150000, odoStart: 15920, odoEnd: 16075, fuel: 46, exp: [{ cat: 'BBM', amt: 350000 }, { cat: 'Toll', amt: 150000 }], podCondition: 'partial_damage', discrepancy: 'Semen Holcim sobek 5 zak terkena air hujan' }
  ];

  let seq = 100;
  for (const s of historicalShipments) {
    const sjDate = new Date(s.date);
    const monthStr = String(sjDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(sjDate.getDate()).padStart(2, '0');
    const docNumber = `SJ-2026${monthStr}${dayStr}-${String(seq++).slice(-3)}`;

    // Calculate total weight (Tons) based on material quantities
    const qty1 = Math.floor(Math.random() * 100) + 50;
    const qty2 = Math.floor(Math.random() * 50) + 20;
    const weightTon = ((qty1 * 10 + qty2 * 50) / 1000).toFixed(2);

    const activeDriver = drivers[seq % drivers.length];
    const activeVehicle = vehicles[seq % vehicles.length];

    const sj = await prisma.suratJalan.create({
      data: {
        documentNumber: docNumber,
        customerId: customers[s.customerIdx].id,
        date: sjDate,
        status: s.status,
        destination: s.dest,
        destinationAddress: 'Kawasan Industri Utama Blok D-' + (seq % 10),
        originDepot: s.origin,
        contactPerson: 'Bpk. Penanggung Jawab ' + (seq % 5),
        contactPhone: '0812-3333-' + (seq % 10000),
        createdByName: 'Admin Operasional',
        notes: `Total Weight: ${weightTon} Ton | Auto-seeded historical record`,
        createdById: adminUser.id,
        uangJalanNominal: s.uJ,
        danaCadanganNominal: s.dC,
        uangJalanRecipient: activeDriver.name,
        photoReceived: true,
        items: {
          create: [
            { materialId: materials[0].id, quantity: qty1, unitPrice: 75000 },
            { materialId: materials[1].id, quantity: qty2, unitPrice: 65000 }
          ]
        },
        dispatch: {
          create: {
            vehicleId: activeVehicle.id,
            driverId: activeDriver.id,
            status: s.status,
            gateCheckStatus: 'PASSED',
            gateCheckAt: new Date(sjDate.getTime() + 7200000), // 2 hours later
            gateCheckById: operatorUser.id,
            vehicleChecklist: {
              create: {
                vehicleId: activeVehicle.id,
                checklistItems: JSON.stringify(['Ban', 'Rem', 'Lampu', 'Oli', 'Klakson', 'Aki']),
                condition: seq % 7 === 0 ? 'WARNING' : 'GOOD',
                notes: JSON.stringify({
                  type: 'post-arrival',
                  vehiclePlate: activeVehicle.plateNumber,
                  driverName: activeDriver.name,
                  odometerAwal: s.odoStart,
                  odometerAkhir: s.odoEnd,
                  distanceTraveled: s.odoEnd - s.odoStart,
                  itemValues: {
                    'Ban & Rem': {
                      'Kondisi Ban': { status: seq % 7 === 0 ? 'TIDAK LAYAK' : 'LAYAK', notes: seq % 7 === 0 ? 'Ban serep tipis' : 'Aman' },
                      'Fungsi Rem': { status: seq % 5 === 0 ? 'PERLU PERHATIAN' : 'LAYAK', notes: seq % 5 === 0 ? 'Minyak rem berkurang sedikit' : 'Aman' }
                    }
                  }
                }),
                checkedById: operatorUser.id,
                createdAt: sjDate
              }
            },
            driverChecklist: {
              create: {
                driverId: activeDriver.id,
                hasLicense: true,
                licenseValid: true,
                condition: 'FIT',
                checkedById: operatorUser.id,
                createdAt: sjDate
              }
            },
            pod: {
              create: {
                receivedBy: 'Penerima Barang ' + (seq % 4),
                receivedAt: new Date(sjDate.getTime() + 86400000), // Delivered next day
                photos: JSON.stringify(['/sample-pod.jpg']),
                submittedById: operatorUser.id,
                // Embed the JSON configuration inside the notes field
                notes: JSON.stringify({
                  status: s.podCondition ? 'POD DISCREPANCY' : 'RECEIVED',
                  deliveryCondition: s.podCondition || 'good',
                  discrepancyDetails: s.discrepancy || '',
                  notes: s.discrepancy ? 'Diterima dengan komplain' : 'Diterima dalam kondisi baik'
                })
              }
            },
            // LPJ record for completed ones
            ...(s.status === 'COMPLETED' ? {
              lpj: {
                create: {
                  startKm: s.odoStart,
                  endKm: s.odoEnd,
                  fuelUsed: s.fuel,
                  expenses: JSON.stringify(s.exp.map(e => ({
                    category: e.cat,
                    amount: e.amt,
                    description: `${e.cat} Operational Trip`
                  }))),
                  notes: 'Selesai dan dikonfirmasi oleh Finance',
                  submittedById: operatorUser.id,
                  createdAt: new Date(sjDate.getTime() + 172800000) // completed 2 days later
                }
              }
            } : {})
          }
        }
      }
    });
  }

  // 7. Add current Active/DRAFT/ASSIGNED/DISPATCHED orders in June 2026
  const currentSJs = [
    {
      docNum: 'SJ-20260605-001',
      status: 'DRAFT',
      dest: 'PT Maju Bersama - Pabrik Jakarta Timur',
      origin: 'Warehouse A - Jakarta Timur',
      custIdx: 0,
      items: [{ matIdx: 0, qty: 120 }, { matIdx: 2, qty: 50 }]
    },
    {
      docNum: 'SJ-20260605-002',
      status: 'ASSIGNED',
      dest: 'CV Karya Mandiri - Site Cikarang',
      origin: 'Warehouse A - Jakarta Timur',
      custIdx: 1,
      items: [{ matIdx: 1, qty: 90 }],
      dispatch: {
        driverIdx: 1,
        vehicleIdx: 1,
        status: 'ASSIGNED',
        checkCondition: 'GOOD'
      }
    },
    {
      docNum: 'SJ-20260605-003',
      status: 'DISPATCHED',
      dest: 'UD Sumber Rejeki - Surabaya',
      origin: 'Warehouse B - Cikarang',
      custIdx: 2,
      items: [{ matIdx: 3, qty: 200 }],
      dispatch: {
        driverIdx: 0,
        vehicleIdx: 0,
        status: 'DISPATCHED',
        checkCondition: 'GOOD'
      }
    }
  ];

  for (const c of currentSJs) {
    const sjDate = new Date();
    const weightTon = ((c.items.reduce((sum, i) => sum + i.qty * 15, 0)) / 1000).toFixed(2);

    await prisma.suratJalan.create({
      data: {
        documentNumber: c.docNum,
        customerId: customers[c.custIdx].id,
        date: sjDate,
        status: c.status,
        destination: c.dest,
        destinationAddress: 'Jl. Utama No. ' + (seq % 100),
        originDepot: c.origin,
        contactPerson: 'Penanggung Jawab Ops',
        contactPhone: '0812-9999-8888',
        createdByName: 'Admin Operasional',
        notes: `Total Weight: ${weightTon} Ton | Active Operational SJ`,
        createdById: adminUser.id,
        uangJalanNominal: c.status !== 'DRAFT' ? 800000 : null,
        uangJalanRecipient: c.status !== 'DRAFT' ? drivers[c.dispatch.driverIdx].name : null,
        items: {
          create: c.items.map(it => ({
            materialId: materials[it.matIdx].id,
            quantity: it.qty,
            unitPrice: 70000
          }))
        },
        ...(c.dispatch ? {
          dispatch: {
            create: {
              vehicleId: vehicles[c.dispatch.vehicleIdx].id,
              driverId: drivers[c.dispatch.driverIdx].id,
              status: c.dispatch.status,
              gateCheckStatus: c.dispatch.status === 'DISPATCHED' ? 'PASSED' : 'PENDING',
              gateCheckAt: c.dispatch.status === 'DISPATCHED' ? new Date() : null,
              gateCheckById: operatorUser.id,
              vehicleChecklist: {
                create: {
                  vehicleId: vehicles[c.dispatch.vehicleIdx].id,
                  checklistItems: JSON.stringify(['Ban', 'Rem', 'Lampu', 'Oli']),
                  condition: c.dispatch.checkCondition,
                  checkedById: operatorUser.id
                }
              },
              driverChecklist: {
                create: {
                  driverId: drivers[c.dispatch.driverIdx].id,
                  hasLicense: true,
                  licenseValid: true,
                  condition: 'FIT',
                  checkedById: operatorUser.id
                }
              }
            }
          }
        } : {})
      }
    });
  }

  console.log('✓ Programmatic historical and active dispatches created');

  // 11. Add Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'SYSTEM',
        title: 'Sistem Terhubung',
        message: 'Selamat datang di FleetOps Logistics Control Center.',
        read: false
      },
      {
        userId: operatorUser.id,
        type: 'DISPATCH',
        title: 'Penugasan Driver',
        message: 'Driver Budi Santoso ditugaskan ke order SJ-20260605-003.',
        read: false
      },
      {
        userId: adminUser.id,
        type: 'POD',
        title: 'POD Baru Diupload',
        message: 'Proof of Delivery untuk SJ-20260527-119 dilaporkan dengan kerusakan parsial.',
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
        entityId: 'SYSTEM',
        action: 'SEED',
        newValue: 'Full historical seed data generated successfully'
      }
    ]
  });

  console.log('✓ Audit Logs generated');

  console.log('\n✅ Seeding complete!');
  console.log('\nSample data populated:');
  console.log('- 18 COMPLETED Surat Jalan (spread over Jan - May 2026)');
  console.log('- 2 DELIVERED Surat Jalan (with May POD discrepancies for testing)');
  console.log('- 3 Active orders (DRAFT, ASSIGNED, DISPATCHED) for June 2026');
  console.log('- Real operational costs (LPJs) and check logs included.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

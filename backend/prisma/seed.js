import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
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

  // Create customers
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

  // Create materials
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

  // Create vehicles
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

  // Create drivers
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

  // Create sample Surat Jalan
  const sj = await prisma.suratJalan.upsert({
    where: { documentNumber: 'SJ-20260428-001' },
    update: {},
    create: {
      documentNumber: 'SJ-20260428-001',
      customerId: customers[0].id,
      date: new Date(),
      status: 'DRAFT',
      notes: 'Sample Surat Jalan for testing',
      createdById: adminUser.id,
      items: {
        create: [
          { materialId: materials[0].id, quantity: 100, unitPrice: 75000 },
          { materialId: materials[1].id, quantity: 50, unitPrice: 65000 }
        ]
      }
    }
  });

  console.log('✓ Sample Surat Jalan created');

  console.log('✅ Seeding complete!');
  console.log('\nSample data:');
  console.log('- Admin user: admin@fleetops.com');
  console.log('- Operator user: operator@fleetops.com');
  console.log(`- 3 customers, 5 materials, 3 vehicles, 3 drivers`);
  console.log(`- Sample SJ: ${sj.documentNumber}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

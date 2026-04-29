/**
 * Document numbering service
 * Generates sequential document numbers with format: PREFIX-YYYYMMDD-XXX
 */
export async function generateDocumentNumber(prisma, prefix = 'SJ') {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const datePrefix = `${prefix}-${dateStr}`;

  // Find the highest sequence number for today
  const lastDoc = await prisma.suratJalan.findFirst({
    where: {
      documentNumber: {
        startsWith: datePrefix
      }
    },
    orderBy: {
      documentNumber: 'desc'
    },
    select: {
      documentNumber: true
    }
  });

  let sequence = 1;
  if (lastDoc) {
    const lastSequence = parseInt(lastDoc.documentNumber.split('-')[2], 10);
    sequence = lastSequence + 1;
  }

  return `${datePrefix}-${String(sequence).padStart(3, '0')}`;
}

export async function generateCustomerCode(prisma) {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true }
  });

  let sequence = 1;
  if (lastCustomer) {
    const num = parseInt(lastCustomer.code.replace('CUST-', ''), 10);
    sequence = num + 1;
  }

  return `CUST-${String(sequence).padStart(3, '0')}`;
}

export async function generateMaterialCode(prisma) {
  const lastMaterial = await prisma.material.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true }
  });

  let sequence = 1;
  if (lastMaterial) {
    const num = parseInt(lastMaterial.code.replace('MAT-', ''), 10);
    sequence = num + 1;
  }

  return `MAT-${String(sequence).padStart(3, '0')}`;
}

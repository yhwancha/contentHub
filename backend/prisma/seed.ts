import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default settings
  await prisma.setting.upsert({
    where: { key: 'ingest_interval_minutes' },
    update: {},
    create: {
      key: 'ingest_interval_minutes',
      value: '180', // 3 hours default
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

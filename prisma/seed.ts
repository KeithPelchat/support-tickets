import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clientTokens = [
    {
      token: 'pad_a8f7b9c2d4e1f6',
      clientId: 'pad',
      clientName: 'Pad',
    },
    {
      token: 'acme_x7y8z9a1b2c3d4',
      clientId: 'acme',
      clientName: 'Acme Corporation',
    },
    {
      token: 'techstart_m3n4o5p6q7r8',
      clientId: 'techstart',
      clientName: 'TechStart Inc',
    },
  ];

  console.log('Seeding client tokens...');

  for (const token of clientTokens) {
    await prisma.clientToken.upsert({
      where: { token: token.token },
      update: {},
      create: token,
    });
    console.log(`Created token for ${token.clientName}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

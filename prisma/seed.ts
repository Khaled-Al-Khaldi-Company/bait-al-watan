import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@bait-al-watan.com', name: 'مدير النظام', role: 'ADMIN' },
    { email: 'member1@bait-al-watan.com', name: 'عضو 1', role: 'MEMBER' },
    { email: 'member2@bait-al-watan.com', name: 'عضو 2', role: 'MEMBER' },
    { email: 'member3@bait-al-watan.com', name: 'عضو 3', role: 'MEMBER' },
    { email: 'member4@bait-al-watan.com', name: 'عضو 4', role: 'MEMBER' },
  ];

  console.log('Seeding users...');

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: password,
        role: user.role,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};

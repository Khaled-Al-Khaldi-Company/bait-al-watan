import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Update all transactions where amount is 40700 to have officialAmount 40500
  const result = await prisma.transaction.updateMany({
    where: {
      amount: 40700
    },
    data: {
      officialAmount: 40500
    }
  });
  
  console.log(`Updated ${result.count} transactions.`);
}

main().finally(() => prisma.$disconnect());

export {};

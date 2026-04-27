const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const phases = await prisma.phase.findMany();
  
  for (const phase of phases) {
    let newName = phase.name;
    if (phase.name === 'Pre-application') newName = 'مرحلة ما قبل التقديم';
    if (phase.name === 'Application') newName = 'مرحلة التقديم';
    if (phase.name === 'Allocation') newName = 'مرحلة التخصيص';
    if (phase.name === 'Post-allocation') newName = 'مرحلة ما بعد التخصيص';
    
    await prisma.phase.update({
      where: { id: phase.id },
      data: { name: newName }
    });
  }
  
  console.log('Phases updated to Arabic.');
}

main().finally(() => prisma.$disconnect());

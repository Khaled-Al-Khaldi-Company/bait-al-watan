import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Create the sample project if it doesn't exist
    let project = await prisma.project.findFirst({
      where: { name: 'مشروع بيت الوطن - المرحلة الخامسة' }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'مشروع بيت الوطن - المرحلة الخامسة',
          location: 'التجمع الخامس - القاهرة الجديدة',
          status: 'IN_PROGRESS',
          totalValue: 500000,
          reservationFee: 50000,
          installmentValue: 15000,
          installmentsCount: 30,
          startDate: new Date(),
          phases: {
            create: [
              { name: 'مرحلة التقديم', status: 'COMPLETED', order: 1 },
              { name: 'مرحلة الإنشاءات', status: 'ACTIVE', order: 2 }
            ]
          }
        }
      });
    }

    // 2. Link ALL members to this project so anyone logging in can see it
    const members = await prisma.user.findMany({
      where: { role: 'MEMBER' }
    });

    for (const member of members) {
      // Upsert participation
      await prisma.projectParticipation.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: member.id
          }
        },
        update: {
          percentage: 25,
          shareAmount: 125000
        },
        create: {
          projectId: project.id,
          userId: member.id,
          percentage: 25,
          shareAmount: 125000
        }
      });

      // Add some sample transactions for each member if they don't have any
      const existingTx = await prisma.transaction.findFirst({
        where: { projectId: project.id, userId: member.id }
      });

      if (!existingTx) {
        await prisma.transaction.create({
          data: {
            projectId: project.id,
            userId: member.id,
            amount: 65000,
            type: 'MEMBER_CONTRIBUTION',
            date: new Date(),
            purpose: 'إجمالي المساهمات المسددة (تجريبي)'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم ربط المشروع بجميع الأعضاء (${members.length}) بنجاح.`,
      projectTitle: project.name
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

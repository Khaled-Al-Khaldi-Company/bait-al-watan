import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      projectId, 
      fromUserId, 
      toUserId, // Can be an existing user or a new one to be added
      transferPercentage, 
      transferPaidAmount,
      transferType // 'INTERNAL_TRANSFER' or 'EXIT_REPLACEMENT'
    } = body;

    if (!projectId || !fromUserId || !toUserId) {
      return NextResponse.json({ error: 'بيانات المناقلة غير مكتملة' }, { status: 400 });
    }

    // Execute in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Get source participation
      const sourceParticipation = await tx.projectParticipation.findUnique({
        where: { projectId_userId: { projectId, userId: fromUserId } }
      });

      if (!sourceParticipation) throw new Error('المساهم المصدر غير موجود في هذا المشروع');

      // 2. Adjust source participation
      // Note: We subtract from shareAmount (contractual) and from percentage if it exists
      const pctToMove = parseFloat(transferPercentage || 0);
      const paidToMove = parseFloat(transferPaidAmount || 0);
      
      const newSourcePercentage = (sourceParticipation.percentage || 0) - pctToMove;
      const newSourceShareAmount = (sourceParticipation.shareAmount || 0) * (1 - (pctToMove / (sourceParticipation.percentage || 100)));

      await tx.projectParticipation.update({
        where: { id: sourceParticipation.id },
        data: {
          percentage: newSourcePercentage < 0 ? 0 : newSourcePercentage,
          shareAmount: { decrement: (sourceParticipation.shareAmount * (pctToMove / (sourceParticipation.percentage || 100))) }
        }
      });

      // 3. Update/Create target participation
      const targetParticipation = await tx.projectParticipation.upsert({
        where: { projectId_userId: { projectId, userId: toUserId } },
        create: {
          projectId,
          userId: toUserId,
          percentage: pctToMove,
          shareAmount: (sourceParticipation.shareAmount * (pctToMove / (sourceParticipation.percentage || 100)))
        },
        update: {
          percentage: { increment: pctToMove },
          shareAmount: { increment: (sourceParticipation.shareAmount * (pctToMove / (sourceParticipation.percentage || 100))) }
        }
      });

      // 4. Create log transactions to move the "Paid Balance"
      // Transaction for source (Out)
      const transferId = `TID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      if (paidToMove > 0) {
        await tx.transaction.create({
          data: {
            projectId,
            userId: fromUserId,
            amount: -paidToMove,
            type: 'OTHER_EXPENSE',
            purpose: `[${transferId}] مناقلة رصيد مسدد إلى المساهم المستلم [نقل حصة]`,
            date: new Date()
          }
        });

        // Transaction for target (In)
        await tx.transaction.create({
          data: {
            projectId,
            userId: toUserId,
            amount: paidToMove,
            type: 'MEMBER_CONTRIBUTION',
            purpose: `[${transferId}] رصيد مسدد مرحل من مساهم سابق [نقل حصة]`,
            date: new Date()
          }
        });
      }

      // If source percentage reaches 0, we can optionally mark them as inactive or keep at 0
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('STAKE_TRANSFER_ERROR:', error);
    return NextResponse.json({ error: error.message || 'فشل تنفيذ المناقلة' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isAdmin = user?.role === 'ADMIN' || (user?.name || '').includes('مدير');
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'عذراً، هذه الصلاحية للمدراء فقط.' }, { status: 403 });
    }

    const userId = (session.user as any).id;

    const body = await req.json();
    const { sourceProjectId, targetProjectId, amount, purpose, date, mirrorPartners, transferType } = body;
    
    // ... rest of the logic remains the same

    if (!sourceProjectId || !targetProjectId || !amount) {
      return NextResponse.json({ error: 'بيانات التحويل غير مكتملة' }, { status: 400 });
    }

    const absAmount = Math.abs(amount);
    const isVirtual = transferType === 'AUTHORITY_BALANCE';
    const transferId = `TID-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const sourceProject = await prisma.project.findUnique({
      where: { id: sourceProjectId },
      include: { participations: true }
    });

    if (!sourceProject) {
      return NextResponse.json({ error: 'المشروع المصدر غير موجود' }, { status: 404 });
    }

    const sourceName = sourceProject.name;

    // If mirroring partners, we need to fetch them from source
    let partnerTransfers: any[] = [];
    if (mirrorPartners) {
      if (sourceProject && sourceProject.participations.length > 0) {
        partnerTransfers = sourceProject.participations.map(p => {
          const pct = p.percentage || (sourceProject.totalValue > 0 ? (p.shareAmount / sourceProject.totalValue) * 100 : 0);
          return {
            userId: p.userId,
            amount: (pct / 100) * absAmount,
            originalPct: pct
          };
        });
      }
    }

    // Execute as a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Outgoing from source
      await tx.transaction.create({
        data: {
          projectId: sourceProjectId,
          userId: userId,
          amount: isVirtual ? 0 : -absAmount,
          officialAmount: isVirtual ? -absAmount : 0,
          type: 'LIQUIDITY_TRANSFER',
          purpose: `[${transferId}] ${isVirtual ? 'نقل رصيد هيئة' : 'تحويل سيولة'} صادر: ${purpose}`,
          date: date ? new Date(date) : new Date(),
        }
      });

      // 2. Incoming to target
      if (mirrorPartners && partnerTransfers.length > 0) {
        // Create individual transactions for each mirrored partner
        for (const pt of partnerTransfers) {
          if (pt.amount <= 0) continue;
          
          await tx.transaction.create({
            data: {
              projectId: targetProjectId,
              userId: pt.userId,
              amount: isVirtual ? 0 : pt.amount,
              officialAmount: isVirtual ? pt.amount : 0,
              type: isVirtual ? 'AUTHORITY_PAYMENT' : 'MEMBER_CONTRIBUTION',
              purpose: `[${transferId}] ${isVirtual ? 'رصيد هيئة مرحل' : 'سيولة مرحلة'} من ${sourceName}`,
              date: date ? new Date(date) : new Date(),
            }
          });

          // Also ensure they have a participation record in target
          // For virtual transfers, we don't necessarily update shareAmount (which is contractual) 
          // unless it's a contribution. But let's keep it consistent.
          await tx.projectParticipation.upsert({
            where: { projectId_userId: { projectId: targetProjectId, userId: pt.userId } },
            create: { projectId: targetProjectId, userId: pt.userId, shareAmount: isVirtual ? 0 : pt.amount },
            update: isVirtual ? {} : { shareAmount: { increment: pt.amount } }
          });
        }
      } else {
        // Standard single incoming transaction
        await tx.transaction.create({
          data: {
            projectId: targetProjectId,
            userId: userId,
            amount: isVirtual ? 0 : absAmount,
            officialAmount: isVirtual ? absAmount : 0,
            type: isVirtual ? 'AUTHORITY_PAYMENT' : 'MEMBER_CONTRIBUTION',
            purpose: `[${transferId}] ${isVirtual ? 'رصيد هيئة مرحل' : 'تحويل سيولة واردة'} من ${sourceName}`,
            date: date ? new Date(date) : new Date(),
          }
        });
      }

      return { success: true };
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Transfer Error:', error);
    return NextResponse.json({ error: error.message || 'فشل في عملية التحويل' }, { status: 500 });
  }
}

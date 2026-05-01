export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Filter by user if they are a MEMBER
    const whereClause = role === 'ADMIN' || role === 'VIEWER' ? {} : { userId };

    const participations = await prisma.projectParticipation.findMany({
      where: whereClause,
      include: {
        user: true,
        project: {
          include: {
            transactions: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!participations || participations.length === 0) {
       return NextResponse.json([]);
    }

    const reportData = participations.map(p => {
      const project = p.project;
      const transactions = project?.transactions || [];
      const isWallet = project?.reservationType === 'WALLET' || (project?.name || '').includes('محفظة');
      
      const totalProjectContributions = transactions.filter((t: any) => 
        t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0 && 
        !t.purpose?.includes('[') && 
        !t.purpose?.includes('مناقلة')
      ).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const userTransactions = transactions.filter((t: any) => t.userId === p.userId);
      const userPaidUSD = userTransactions.filter((t: any) => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const userPaidEGP = userTransactions.filter((t: any) => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0).reduce((s, t) => s + (t.amount * (t.egpRate || 50)), 0);

      let pct = 0;
      if (isWallet) {
        const userBalance = userTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
        pct = totalProjectContributions > 0 ? (userBalance / totalProjectContributions) : 0;
      } else {
        pct = (p.percentage || 0) / 100;
      }

      const officialTransactions = transactions.filter((t: any) => 
        ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT', 'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER', 'LIQUIDITY_TRANSFER'].includes(t.type)
      );

      const partnerLandShareUSD = officialTransactions.reduce((sum: number, t: any) => {
        let val = 0;
        if (t.type === 'LIQUIDITY_TRANSFER' || t.type === 'AUTHORITY_PAYMENT') val = (t.officialAmount || 0);
        else val = Math.abs(t.officialAmount || t.amount || 0);
        return sum + val;
      }, 0) * pct;

      const partnerLandShareEGP = officialTransactions.reduce((sum: number, t: any) => {
        let val = 0;
        if (t.type === 'LIQUIDITY_TRANSFER' || t.type === 'AUTHORITY_PAYMENT') val = (t.officialAmount || 0);
        else val = Math.abs(t.officialAmount || t.amount || 0);
        
        const rate = t.egpRate || 50;
        return sum + (val * rate);
      }, 0) * pct;

      const expenseTransactions = transactions.filter((t: any) => 
        t.type === 'OTHER_EXPENSE' && !(t.purpose || '').includes('مرحل') && !(t.purpose || '').includes('مناقلة')
      );

      const partnerExpenseShareUSD = expenseTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0) * pct;
      const partnerExpenseShareEGP = expenseTransactions.reduce((sum: number, t: any) => {
        const val = Math.abs(t.amount || 0);
        const rate = t.egpRate || 50;
        return sum + (val * rate);
      }, 0) * pct;

      const effectiveShareAmount = isWallet ? userPaidUSD : (p.shareAmount || (project.totalValue * pct) || 0);
      const remainingAmountUSD = Math.max(0, effectiveShareAmount - userPaidUSD);

      return {
        id: p.id,
        userName: p.user?.name || 'مستخدم غير معروف',
        projectName: project?.name || 'مشروع غير موجود',
        projectId: project?.id,
        percentage: pct * 100,
        landShare: partnerLandShareUSD,
        landShareEGP: partnerLandShareEGP,
        expenseShare: partnerExpenseShareUSD,
        expenseShareEGP: partnerExpenseShareEGP,
        paidUSD: userPaidUSD,
        paidEGP: userPaidEGP,
        remainingUSD: remainingAmountUSD,
        totalRequired: effectiveShareAmount,
        totalUSD: partnerLandShareUSD + partnerExpenseShareUSD,
        totalEGP: partnerLandShareEGP + partnerExpenseShareEGP
      };
    });

    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error('RESERVATION_REPORT_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reservation report data' }, { status: 500 });
  }
}

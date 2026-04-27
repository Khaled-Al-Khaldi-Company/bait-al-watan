import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId'); // optional filter

    // Fetch all projects with full transaction & participation data
    const projects = await prisma.project.findMany({
      where: projectId ? { id: projectId } : undefined,
      include: {
        transactions: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        participations: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    // Fetch all users who have participations
    const allUsers = await prisma.user.findMany({
      where: {
        participations: { some: projectId ? { projectId } : {} }
      },
      select: { id: true, name: true, email: true }
    });

    const investorReports = allUsers.map(user => {
      // Per-project breakdown
      const projectBreakdowns = projects
        .filter(p => p.participations.some(part => part.userId === user.id))
        .map(project => {
          const participation = project.participations.find(part => part.userId === user.id);
          if (!participation) return null;

          const exchangeRate = project.exchangeRate || 3.75;
          const isWallet = project.name.includes('محفظة');

          // User's transactions in this project
          const userTxns = project.transactions.filter(t =>
            t.userId === user.id &&
            !t.purpose?.includes('[') &&
            !t.purpose?.includes('مناقلة') &&
            !t.purpose?.includes('رصيد افتتاح') &&
            !t.purpose?.includes('فتح محفظة') &&
            t.type !== 'FUND_REALLOCATION'
          );

          const contributions = userTxns.filter(t => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0);
          const totalPaidUSD = contributions.reduce((s, t) => s + t.amount, 0);
          const totalPaidEGP = contributions.reduce((s, t) => s + (t.amount * (t.egpRate || 50)), 0);
          const totalPaidSAR = totalPaidUSD * exchangeRate;

          // Calculate share
          const sharePercent = participation.percentage || 0;
          const shareAmount = participation.shareAmount || (project.totalValue * sharePercent / 100) || 0;
          const remainingUSD = Math.max(0, shareAmount - totalPaidUSD);
          const remainingSAR = remainingUSD * exchangeRate;
          const remainingEGP = remainingUSD * 50;

          // Project-level totals for share calculations
          const totalProjectOfficial = project.transactions
            .filter(t => ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT',
              'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER', 'LIQUIDITY_TRANSFER'].includes(t.type))
            .reduce((sum, t) => {
              if (t.type === 'LIQUIDITY_TRANSFER' || t.type === 'AUTHORITY_PAYMENT') return sum + (t.officialAmount || 0);
              return sum + Math.abs(t.officialAmount || t.amount || 0);
            }, 0);

          const totalProjectExpenses = project.transactions
            .filter(t => t.type === 'OTHER_EXPENSE' && !t.purpose?.includes('مرحل') && !t.purpose?.includes('مناقلة'))
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

          const partnerPct = isWallet
            ? (project.transactions.filter(t => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0)
                .reduce((s, t) => s + t.amount, 0) > 0
                ? totalPaidUSD / project.transactions.filter(t => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0)
                    .reduce((s, t) => s + t.amount, 0)
                : 0)
            : sharePercent / 100;

          const partnerLandShare = totalProjectOfficial * partnerPct;
          const partnerExpenseShare = totalProjectExpenses * partnerPct;

          // Fund balance = paid - land share - expense share
          const poolBalance = userTxns.reduce((s, t) => s + t.amount, 0);
          const fundBalance = poolBalance - (partnerLandShare + partnerExpenseShare);

          const progressPercent = shareAmount > 0 ? Math.min(100, (totalPaidUSD / shareAmount) * 100) : 0;

          return {
            projectId: project.id,
            projectName: project.name,
            isWallet,
            sharePercent: Number(sharePercent.toFixed(2)),
            shareAmount,
            totalPaidUSD,
            totalPaidSAR,
            totalPaidEGP,
            remainingUSD,
            remainingSAR,
            remainingEGP,
            partnerLandShare,
            partnerExpenseShare,
            fundBalance,
            progressPercent: Number(progressPercent.toFixed(1)),
            transactions: contributions.map(t => ({
              id: t.id,
              date: t.date,
              amount: t.amount,
              amountSAR: t.amount * (t.egpRate ? exchangeRate : exchangeRate),
              amountEGP: t.amount * (t.egpRate || 50),
              purpose: t.purpose,
              type: t.type
            }))
          };
        })
        .filter(Boolean);

      // Totals across all projects
      const totalPaidUSD = projectBreakdowns.reduce((s, p: any) => s + p.totalPaidUSD, 0);
      const totalPaidSAR = projectBreakdowns.reduce((s, p: any) => s + p.totalPaidSAR, 0);
      const totalPaidEGP = projectBreakdowns.reduce((s, p: any) => s + p.totalPaidEGP, 0);
      const totalRequiredUSD = projectBreakdowns.reduce((s, p: any) => s + p.shareAmount, 0);
      const totalRemainingUSD = projectBreakdowns.reduce((s, p: any) => s + p.remainingUSD, 0);
      const totalFundBalance = projectBreakdowns.reduce((s, p: any) => s + p.fundBalance, 0);

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        projectCount: projectBreakdowns.length,
        totalRequiredUSD,
        totalPaidUSD,
        totalPaidSAR,
        totalPaidEGP,
        totalRemainingUSD,
        totalRemainingEGP: totalRemainingUSD * 50,
        totalFundBalance,
        projects: projectBreakdowns
      };
    });

    return NextResponse.json(investorReports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch investor report' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      participations: {
        include: {
          project: {
            include: {
              transactions: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { date: 'desc' }
              }
            }
          }
        }
      },
      transactions: {
        include: { project: true },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let totalRequired = 0;
  let totalPaid = 0;
  let totalPaidEGP = 0;
  let totalPaidSAR = 0;

  const projects = user.participations.map(part => {
    const project = part.project;
    const exchangeRate = project.exchangeRate || 3.75;
    const isWallet = project.name.includes('محفظة');

    // All user transactions in this project
    const userTxns = project.transactions.filter(t =>
      t.userId === user.id &&
      !t.purpose?.includes('[') &&
      !t.purpose?.includes('مناقلة') &&
      !t.purpose?.includes('رصيد افتتاح') &&
      !t.purpose?.includes('فتح محفظة') &&
      t.type !== 'FUND_REALLOCATION'
    );

    const contributions = userTxns.filter(t => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0);
    const paid = contributions.reduce((s, t) => s + t.amount, 0);
    const paidEGP = contributions.reduce((s, t) => s + (t.amount * (t.egpRate || 50)), 0);
    const paidSAR = paid * exchangeRate;

    const shareAmount = part.shareAmount || (project.totalValue * (part.percentage || 0) / 100);
    const required = shareAmount;
    const remaining = Math.max(0, required - paid);

    // Project-level totals for share calculations
    const partnerPct = (part.percentage || 0) / 100;
    const totalProjectOfficial = project.transactions
      .filter(t => ['AUTHORITY_PAYMENT','RESERVATION_FEE_PAYMENT','WALLET_OPENING_PAYMENT',
        'INSTALLMENT_PAYMENT','ACTIVATION_TRANSFER','LIQUIDITY_TRANSFER'].includes(t.type))
      .reduce((sum, t) => {
        if (t.type === 'LIQUIDITY_TRANSFER' || t.type === 'AUTHORITY_PAYMENT') return sum + (t.officialAmount || 0);
        return sum + Math.abs(t.officialAmount || t.amount || 0);
      }, 0);

    const totalProjectExpenses = project.transactions
      .filter(t => t.type === 'OTHER_EXPENSE' && !t.purpose?.includes('مرحل') && !t.purpose?.includes('مناقلة'))
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const partnerLandShare = totalProjectOfficial * partnerPct;
    const partnerExpenseShare = totalProjectExpenses * partnerPct;
    const poolBalance = userTxns.reduce((s, t) => s + t.amount, 0);
    const fundBalance = poolBalance - (partnerLandShare + partnerExpenseShare);
    const progressPercent = required > 0 ? Math.min(100, (paid / required) * 100) : 0;

    totalRequired += required;
    totalPaid += paid;
    totalPaidEGP += paidEGP;
    totalPaidSAR += paidSAR;

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      isWallet,
      percentage: part.percentage || 0,
      shareAmount: required,
      paid,
      paidSAR,
      paidEGP,
      remaining,
      remainingSAR: remaining * exchangeRate,
      remainingEGP: remaining * 50,
      partnerLandShare,
      partnerExpenseShare,
      fundBalance,
      progressPercent: Number(progressPercent.toFixed(1)),
      // Detailed transactions for this project
      transactions: contributions.map(t => ({
        id: t.id,
        date: t.date,
        amount: t.amount,
        amountSAR: t.amount * exchangeRate,
        amountEGP: t.amount * (t.egpRate || 50),
        purpose: t.purpose,
        type: t.type,
      }))
    };
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    stats: {
      totalRequired,
      totalPaid,
      totalPaidEGP,
      totalPaidSAR,
      totalRemaining: totalRequired - totalPaid,
      projectCount: projects.length
    },
    projects,
    transactions: user.transactions.filter(t =>
      !t.purpose?.includes('[') &&
      !t.purpose?.includes('مناقلة') &&
      !t.purpose?.includes('رصيد افتتاح') &&
      !t.purpose?.includes('فتح محفظة')
    )
  });
}

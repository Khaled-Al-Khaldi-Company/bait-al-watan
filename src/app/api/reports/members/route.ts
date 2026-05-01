import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const users = await prisma.user.findMany({
      where: projectId ? {
        participations: {
          some: { projectId }
        }
      } : {
        role: { in: ['MEMBER', 'ADMIN'] }
      },
      include: {
        participations: {
          where: projectId ? { projectId } : {},
          include: {
            project: {
              include: {
                transactions: {
                  orderBy: { date: 'desc' }
                }
              }
            }
          }
        }
      }
    });

    const reportData = users.map(user => {
      let totalRequiredUSD = 0;
      let totalPaidUSD = 0;
      let totalPaidEGP = 0;

      user.participations.forEach(part => {
        // Fix: Safety check for percentage and totalValue to avoid null errors during build
        const percentage = Number(part.percentage || 0);
        const totalValue = Number(part.project.totalValue || 0);
        const required = (totalValue * percentage) / 100;
        
        const memberTransactions = part.project.transactions.filter(t => 
          t.userId === user.id && 
          ['MEMBER_CONTRIBUTION', 'INSTALLMENT_PAYMENT', 'RESERVATION_FEE_PAYMENT'].includes(t.type)
        );

        const paidUSD = memberTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const paidEGP = memberTransactions.reduce((sum, t) => {
          const amount = t.amount || 0;
          const rate = t.egpRate || 50;
          return sum + (amount * rate);
        }, 0);

        totalRequiredUSD += required;
        totalPaidUSD += paidUSD;
        totalPaidEGP += paidEGP;
      });

      const totalRemainingUSD = totalRequiredUSD - totalPaidUSD;
      // Estimate remaining EGP based on 50 rate if not specified
      const totalRemainingEGP = totalRemainingUSD * 50;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        totalRequired: totalRequiredUSD,
        totalPaid: totalPaidUSD,
        totalPaidEGP: totalPaidEGP,
        totalRemaining: totalRemainingUSD,
        totalRemainingEGP: totalRemainingEGP,
        progress: totalRequiredUSD > 0 ? (totalPaidUSD / totalRequiredUSD) * 100 : 0
      };
    });

    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error('MEMBERS_REPORT_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch report' }, { status: 500 });
  }
}

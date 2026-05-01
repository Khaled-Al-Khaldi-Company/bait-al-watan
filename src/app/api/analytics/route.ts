export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        transactions: true,
        obligations: true
      }
    });

    let totalLiquidityUSD = 0;
    let totalPaidToAuthorityUSD = 0;
    let totalDueToAuthorityUSD = 0;
    let totalContributionsUSD = 0;
    let totalExpensesUSD = 0;

    const projectSummaries = projects.map(project => {
      const transactions = project.transactions || [];
      const obligations = project.obligations || [];

      // 1. Current Liquidity (Total Inflow - Total Outflow)
      const liquidity = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // 2. Paid to Authority (Official amount if available, else total amount)
      const paidToAuth = transactions.filter((t: any) => 
        ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT', 'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER', 'LIQUIDITY_TRANSFER'].includes(t.type || '')
      ).reduce((sum: number, t: any) => {
        // Special handling for transfers to avoid double counting if needed
        // But here we want to see total recognized/paid value
        return sum + Math.abs(t.officialAmount || 0);
      }, 0);

      // 3. Due to Authority (Pending obligations)
      const dueToAuth = obligations.filter(o => (o.status || '') !== 'COMPLETED').reduce((sum, o) => sum + (o.amount || 0), 0);
      
      // 4. Contributions (Direct member cash inflow)
      const contributions = transactions.filter(t => (t.type || '') === 'MEMBER_CONTRIBUTION' && (t.amount || 0) > 0).reduce((sum, t) => sum + (t.amount || 0), 0);
      
      // 5. Expenses (Non-authority outflows)
      const expenses = transactions.filter(t => (t.type || '') === 'OTHER_EXPENSE').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      totalLiquidityUSD += liquidity;
      totalPaidToAuthorityUSD += paidToAuth;
      totalDueToAuthorityUSD += dueToAuth;
      totalContributionsUSD += contributions;
      totalExpensesUSD += expenses;

      return {
        id: project.id,
        name: project.name,
        liquidity,
        paidToAuth,
        dueToAuth,
        contributions,
        expenses
      };
    });

    return NextResponse.json({
      totals: {
        liquidity: totalLiquidityUSD,
        paidToAuthority: totalPaidToAuthorityUSD,
        dueToAuthority: totalDueToAuthorityUSD,
        contributions: totalContributionsUSD,
        expenses: totalExpensesUSD
      },
      projects: projectSummaries
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 });
  }
}

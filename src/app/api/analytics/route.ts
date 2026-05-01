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

      // 1. إجمالي مساهمات الشركاء (كل ما دخل من الشركاء)
      const contributions = transactions
        .filter(t => (t.type || '') === 'MEMBER_CONTRIBUTION' && (t.amount || 0) > 0)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // 2. إجمالي المبالغ المنصرفة (كل ما خرج: هيئة، رسوم، مصاريف، عمولات، أقساط)
      const spent = transactions
        .filter(t => (t.amount || 0) < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      // 3. السيولة الحالية = المساهمات - المنصرف
      const liquidity = contributions - spent;

      // 4. سداد الهيئة (ما تم تحويله فعلياً للهيئة - القيمة الرسمية)
      const paidToAuth = transactions
        .filter(t => ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT', 'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER', 'LIQUIDITY_TRANSFER'].includes(t.type || ''))
        .reduce((sum, t) => sum + Math.abs(t.officialAmount || 0), 0);

      // 5. الالتزامات القادمة
      const dueToAuth = obligations
        .filter(o => (o.status || '') !== 'COMPLETED')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      // 6. المصاريف الأخرى (خارج بند الهيئة)
      const expenses = transactions
        .filter(t => (t.type || '') === 'OTHER_EXPENSE' || (t.type || '') === 'COMMISSION')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

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
        expenses,
        spent
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
